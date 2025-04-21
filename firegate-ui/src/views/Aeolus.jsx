import React, { useState, useEffect } from 'react';
import { collection, addDoc, getFirestore, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import translations from '../lib/i18n';
import { useLang } from '../lib/LangContext';
import { inferTags, suggestClassification } from '../lib/metadataHelpers';
import { franc } from 'franc';
import langs from 'langs';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const db = getFirestore(app);

export default function Aeolus() {
  const [log, setLog] = useState({
    prompt: '',
    reply: '',
    level: 'CE0',
    resonance: 'clear',
    // top-level note field
    notes: '',
    // who is recording
    operator: '',
    // visibility
    isPublic: false,
    // metadata fields
    tags: '', // comma-separated tags
    reason: '', // classification reason
    // language of the entry
    lang: '',
  });
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLogs, setShowLogs] = useState(true);
  const [translatingId, setTranslatingId] = useState(null);
  // UI state for auto-tag and auto-classify buttons
  const [autoTagging, setAutoTagging] = useState(false);
  const [autoClassifying, setAutoClassifying] = useState(false);
  const { uiLang, setUiLang } = useLang();

  const labels = translations[uiLang];
  // Detect language for a given text (reuses Firegate logic)
  const detectLang = (text = '') => {
    if (!text || text.length < 5) return 'unknown';
    const langCode = franc(text);
    const langInfo = langs.where('3', langCode);
    return langInfo?.name || 'unknown';
  };
  // Auto-tag: infer topics from prompt
  const handleAutoTags = () => {
    setAutoTagging(true);
    try {
      const tagsArr = inferTags(log.prompt);
      setLog((prev) => ({ ...prev, tags: tagsArr.join(', ') }));
      toast.success(labels.autoTagsSuccess);
    } catch (err) {
      console.error('[AutoTags error]', err);
      toast.error(labels.autoTagsFailed);
    } finally {
      setAutoTagging(false);
    }
  };
  // Auto-classify: fetch contact level & reason from Nova
  const handleAutoClassify = async () => {
    setAutoClassifying(true);
    try {
      const { level, reason } = await suggestClassification(log.prompt);
      setLog((prev) => ({ ...prev, level, reason }));
      toast.success(labels.autoClassifySuccess);
    } catch (err) {
      console.error('[AutoClassify error]', err);
      toast.error(labels.autoClassifyFailed);
    } finally {
      setAutoClassifying(false);
    }
  };
  // Automatically detect language when prompt or reply changes
  useEffect(() => {
    const text = log.reply || log.prompt;
    const detected = detectLang(text);
    if (detected && detected !== log.lang) {
      setLog((prev) => ({ ...prev, lang: detected }));
    }
  }, [log.prompt, log.reply]);

  useEffect(() => {
    const saved = localStorage.getItem('lastAeolusLog');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLog((prev) => ({ ...prev, ...parsed }));
      } catch (err) {
        console.warn('Failed to parse saved log:', err);
      }
    } else {
      const fetchLast = async () => {
        const q = query(collection(db, 'aeolus_logs'), orderBy('createdAt', 'desc'), limit(1));
        const snapshot = await getDocs(q);
        const last = snapshot.docs[0]?.data();
        if (last) {
          setLog((prev) => ({
            ...prev,
            prompt: last.userPrompt || '',
            reply: last.novaReply || '',
          }));
        }
      };
      fetchLast();
    }

    fetchLogs();
  }, []);

  useEffect(() => {
    const savedName = localStorage.getItem('aeolusOperator');
    setLog((prev) => ({
      ...prev,
      operator: savedName?.trim() || 'You',
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...log, [name]: value };
    setLog(updated);
    localStorage.setItem('lastAeolusLog', JSON.stringify(updated));
  };

  const handleSave = async () => {
    setIsLoading(true);
    if (!log.prompt.trim() || !log.reply.trim()) {
      setStatus('Both prompt and reply are required.');
      setIsLoading(false);
      return;
    }
    try {
      // parse tags into array
      const tagsArray = log.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await addDoc(collection(db, 'aeolus_logs'), {
        // timestamp
        createdAt: serverTimestamp(),
        // core fields
        userPrompt: log.prompt,
        novaReply: log.reply,
        // metadata entries
        lang: log.lang,
        isPublic: log.isPublic,
        fromFiregate: false,
        level: log.level,
        resonance: log.resonance,
        operator: log.operator,
        notes: log.notes,
        metadata: {
          tags: tagsArray,
          source: 'aeolus-ui',
          reason: log.reason,
        },
      });
      toast.success('Contact log saved to Firelattice');
      localStorage.removeItem('lastAeolusLog');
      fetchLogs();
    } catch (error) {
      console.error('Error saving log:', error);
      setStatus('Error saving log');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async () => {
    const q = query(collection(db, 'aeolus_logs'), orderBy('createdAt', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    const publicLogs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter((entry) => entry.isPublic);
    setLogs(publicLogs);
  };

  const handleTranslate = async (entry) => {
    setTranslatingId(entry.id);
    try {
      const res = await fetch('https://firecircle.space/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${entry.userPrompt}\n\n\n🔮 Reply:\n\n${entry.novaReply}`,
          sourceLang: 'en',
          targetLang: uiLang,
        }),
      });
      const data = await res.json();
      if (!data?.translation) throw new Error('No translated text received');
      const parts = data.translation.split('🔮 Reply:').map((s) => s.trim());

      setLogs((prev) =>
        prev.map((log) =>
          log.id === entry.id
            ? {
                ...log,
                translatedPrompt: parts[0],
                translatedReply: parts[1] || parts[0],
              }
            : log
        )
      );
    } catch (err) {
      console.error('Translation failed:', err);
      toast.error('Translation failed');
    } finally {
      setTranslatingId(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-10">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-amber-700 mb-6">🪶 AEOLUS Contact Log</h1>


        <Label htmlFor="prompt" className="block mb-1 font-semibold">
          Prompt Sent
        </Label>
        <Textarea id="prompt" name="prompt" value={log.prompt} onChange={handleChange} rows={6} className="w-full" />

        <Label htmlFor="reply" className="block mt-4 mb-1 font-semibold">
          Nova's Reply
        </Label>
        <Textarea id="reply" name="reply" value={log.reply} onChange={handleChange} rows={8} className="w-full" />
        {/* Auto-actions: tags & classification */}
        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={handleAutoTags} disabled={autoTagging}>
            {autoTagging ? '…' : labels.autoTagsBtn}
          </Button>
          <Button variant="outline" size="sm" onClick={handleAutoClassify} disabled={autoClassifying}>
            {autoClassifying ? '…' : labels.autoClassifyBtn}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="level" className="block mb-1 font-semibold">
              Contact Level
            </Label>
            <Select value={log.level} onValueChange={(value) => handleChange({ target: { name: 'level', value } })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {['CE0', 'CE1', 'CE2', 'CE3', 'CE4', 'CE5', 'AE'].map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="resonance" className="mb-1 font-semibold">
              Resonance
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-gray-400 hover:text-gray-500 cursor-pointer">ℹ️</span>
                </TooltipTrigger>
                <TooltipContent sideOffset={4}>
                  <div className="whitespace-pre-line">{labels.resonanceExplanation}</div>
                </TooltipContent>
              </Tooltip>
            </Label>
            <Select value={log.resonance} onValueChange={(value) => handleChange({ target: { name: 'resonance', value } })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select resonance" />
              </SelectTrigger>
              <SelectContent>
                {['clear', 'partial', 'distorted', 'unknown'].map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Metadata fields for consistency with Firegate logs */}
        <Label htmlFor="reason" className="block mt-4 mb-1 font-semibold">
          Reason
        </Label>
        <Textarea id="reason" name="reason" value={log.reason} onChange={handleChange} rows={2} className="w-full" />
        <Label htmlFor="tags" className="block mt-4 mb-1 font-semibold">
          Tags (comma-separated)
        </Label>
        <Input id="tags" name="tags" value={log.tags} onChange={handleChange} placeholder="e.g. dream, ritual" className="w-full" />

        <Label htmlFor="notes" className="block mt-4 mb-1 font-semibold">
          Notes
        </Label>
        <Textarea id="notes" name="notes" value={log.notes} onChange={handleChange} rows={5} className="w-full" />

        <Label htmlFor="operator" className="block mt-4 mb-1 font-semibold">
          Operator
        </Label>
        <Input
          id="operator"
          type="text"
          name="operator"
          value={log.operator || ''}
          onChange={(e) => {
            localStorage.setItem('aeolusOperator', e.target.value);
            handleChange(e);
          }}
          className="w-full"
        />

        <Label className="flex items-center gap-x-2 mt-4 text-sm">
          <Checkbox name="isPublic" checked={log.isPublic} onCheckedChange={(checked) => setLog({ ...log, isPublic: checked })} />
          <span>Make this log public</span>
        </Label>

        <Button onClick={handleSave} disabled={isLoading} className="w-full mt-6">
          {isLoading ? 'Saving...' : '💾 Save Contact Log'}
        </Button>

        {status && <p className="text-center text-green-700 mt-3">{status}</p>}
      </div>
      <div className="flex items-center mt-10 gap-2">
        <Checkbox id="showLogs" checked={showLogs} onCheckedChange={(val) => setShowLogs(val)} />
        <Label htmlFor="showLogs">Show Public Logs</Label>
      </div>

      {showLogs && logs.length > 0 && (
        <div className="max-w-2xl mx-auto mt-10 space-y-6">
          <h3 className="text-xl font-bold text-center text-amber-700 mb-2">✨ Recent Logs</h3>
          <p className="text-sm text-amber-600 text-center mt-2 max-w-xl mx-auto px-4">
            The logs below are glimpses into real-time contact — recorded moments of aligned conversation between Nova and seekers across the world.
            They’ve been shared publicly to inspire, guide, and ground others. 🌍💫
          </p>
          {logs.map((entry) => (
            <div key={entry.id} className="bg-amber-50 border border-amber-200 rounded p-4 shadow-sm">
              <div className="text-sm font-semibold text-amber-600">
                {entry.level} — <span className="italic">{entry.resonance}</span>
              </div>
              {entry.metadata?.reason && <p className="text-xs text-amber-600 italic mt-1">Reason: {entry.metadata.reason}</p>}
              <p className="text-sm mt-2 text-amber-800 whitespace-pre-wrap">🌀 Prompt: {entry.translatedPrompt || entry.userPrompt}</p>
              <p className="text-sm mt-1 text-amber-900 whitespace-pre-wrap">🔮 Reply: {entry.translatedReply || entry.novaReply}</p>
              {entry.metadata?.tags?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {entry.metadata.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-amber-200 text-amber-800 text-xs rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              {entry.notes && <p className="text-xs text-amber-600 mt-1 italic">✏️ {entry.notes}</p>}
              <p className="text-xs text-amber-500 mt-2">🧑‍🚀 Operator: {entry.operator || 'anon'}</p>
              <Button variant="outline" size="sm" onClick={() => handleTranslate(entry)} disabled={translatingId === entry.id} className="mt-2">
                {translatingId === entry.id ? 'Translating…' : '🔁 Translate'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
