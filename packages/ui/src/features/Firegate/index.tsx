import React, { useState, useEffect, useRef, FC } from 'react';
import { humanize } from '@shared/utils';
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@shared/firebase';
import { franc } from 'franc';
import langs from 'langs';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import translations from '@shared/i18n';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useLang } from '@shared/LangContext';
import { inferTags } from '@shared/metadataHelpers';
import { useNovaTranslate } from '@/hooks/useNovaTranslate';
import RecentLogsDrawer from '@/components/RecentLogsDrawer';

interface ChatMessage {
  role: 'user' | 'nova';
  content: string;
  tags?: string[];
  lang?: string;
  contactLevel?: 'CE0' | 'CE1' | 'CE2' | 'CE3' | 'CE4' | 'CE5' | 'AE';
  translated?: string | null;
  reason?: string;
  logged?: boolean;
}

interface NovaResponse {
  reply: string;
  level: 'CE0' | 'CE1' | 'CE2' | 'CE3' | 'CE4' | 'CE5' | 'AE';
  reason: string;
}

// Type for recent logs fetched from Firestore
interface RecentLog {
  id: string;
  createdAt?: { toDate: () => Date };
  userPrompt: string;
  novaReply: string;
  level?: string;
  metadata?: {
    tags?: string[];
    reason?: string;
  };
}

const Firegate: FC = () => {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showDrawer, setShowDrawer] = useState<boolean>(false);
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const isInitialMount = useRef<boolean>(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { uiLang } = useLang();
  const { translate: novaTranslate } = useNovaTranslate();

  const cleanQuotes = (str: string): string => str?.replace(/^"+|"+$/g, '').trim();

  const labels = new Proxy(translations[uiLang] || translations['en'], {
    get(target: Record<string, string>, key: string | symbol) {
      const strKey = key.toString();
      if (target[strKey]) return target[strKey];
      if (typeof novaTranslate === 'function') {
        (novaTranslate as (key: string) => Promise<string>)(strKey).then((result: string) => {
          const cleaned = cleanQuotes(result);
          const beautified = cleaned
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/_/g, ' ')
            .replace(/^./, (s) => s.toUpperCase())
            .trim();
          target[strKey] = beautified || humanize(strKey);
        });
      }

      return `[🌀 ${strKey}]`;
    },
  });

  const speak = (text: string): void => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice =
      speechSynthesis
        .getVoices()
        .find((v) => v.name.includes('Google UK English Female') || v.name.includes('Samantha')) ||
      null;
    utterance.rate = 0.95;
    speechSynthesis.speak(utterance);
  };

  const detectLang = (text = ''): string => {
    if (!text || text.length < 5) return 'unknown';
    const langCode = franc(text);
    const langInfo = langs.where('3', langCode);
    return langInfo?.name || 'unknown';
  };

  const callNovaApi = async (prompt: string): Promise<NovaResponse> => {
    const res = await fetch('/api/nova', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || 'Nova backend error');
    return {
      reply: payload.reply || labels.novaSilent,
      level: payload.level || 'CE0',
      reason: payload.reason || '',
    };
  };

  const translateText = async (text: string): Promise<string | null> => {
    try {
      const res = await fetch('/api/nova-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLang: detectLang(text),
          targetLang: uiLang === 'es' ? 'Spanish' : 'English',
        }),
      });
      const result = await res.json();
      return result.translation || null;
    } catch (e) {
      console.error('[Translate Error]', e);
      return null;
    }
  };

  const appendUserMessage = (content: string): void => {
    setMessages((prev) => [...prev, { role: 'user', content }]);
  };

  const appendNovaMessage = (
    content: string,
    tags?: string[],
    lang?: string,
    contactLevel?: 'CE0' | 'CE1' | 'CE2' | 'CE3' | 'CE4' | 'CE5' | 'AE',
    translated?: string | null,
    reason?: string
  ): void => {
    setMessages((prev) => [
      ...prev,
      {
        role: 'nova',
        content,
        tags,
        lang,
        contactLevel,
        translated,
        reason,
        logged: false,
      },
    ]);
  };

  const handleSend = async (): Promise<void> => {
    const promptText = input.trim();
    if (!promptText) return;

    appendUserMessage(promptText);
    setInput('');
    setIsLoading(true);

    try {
      const { reply, level, reason } = await callNovaApi(promptText);
      const tagsArr = inferTags(promptText);
      const langDetected = detectLang(reply);
      const translated = await translateText(reply);

      appendNovaMessage(reply, tagsArr, langDetected, level, translated, reason);
      speak(reply);
    } catch (err) {
      console.error('Nova error:', err);
      const errorMsg = labels.novaError;
      appendNovaMessage(errorMsg, [], '', 'CE0', null);
      speak(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = (): void => {
    setMessages([]);
    localStorage.removeItem('firegateMessages');
    localStorage.removeItem('firegateSavedAt');
    toast.success(labels.chatClearedNotice);
  };

  const handleLogToAeolus = async (novaMsg: ChatMessage): Promise<void> => {
    const novaIndex = messages.findIndex((m) => m === novaMsg);
    if (novaIndex === -1) {
      toast.error(labels.couldNotLocate);
      return;
    }

    const userMsg = [...messages.slice(0, novaIndex)].reverse().find((m) => m.role === 'user');
    if (!userMsg || !novaMsg) {
      toast.warning(labels.tooShortToLog);
      return;
    }

    const lang = novaMsg.lang || detectLang(userMsg.content);
    const contactLevel = novaMsg.contactLevel || 'CE0';
    const tags = novaMsg.tags || ['general'];
    const reason = novaMsg.reason || '';

    const logData = {
      createdAt: serverTimestamp(),
      userPrompt: userMsg.content,
      novaReply: novaMsg.content,
      lang,
      isPublic,
      fromFiregate: true,
      level: contactLevel,
      resonance: 'clear',
      operator: 'firegate-ui',
      notes: '',
      metadata: {
        tags,
        source: 'firegate-ui',
        reason,
      },
    };

    try {
      const logId: string = `log-${Date.now()}`;
      const logRef = doc(db, 'aeolus_logs', logId);
      await setDoc(logRef, logData);
      const updatedMessages = [...messages];
      updatedMessages[novaIndex].logged = true;
      setMessages(updatedMessages);
      toast.success(labels.logSuccess);
    } catch (err) {
      console.error('Log error:', err);
      toast.error(labels.logFailure);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('firegateMessages');
    if (stored) {
      setMessages(JSON.parse(stored));
      toast.info(labels.sessionRestoredNotice);
    }
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    try {
      localStorage.setItem('firegateMessages', JSON.stringify(messages));
      localStorage.setItem('firegateSavedAt', Date.now().toString());
    } catch (e) {
      console.error('Error saving messages to localStorage:', e);
    }
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const logsRef = collection(db, 'aeolus_logs');
    const q = query(logsRef, orderBy('createdAt', 'desc'), limit(10));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logs = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }) as RecentLog)
          .filter((log) => log.createdAt);
        setRecentLogs(logs);
      },
      (error) => {
        console.error('[🔥 Firestore real-time error]', error);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col flex-1 max-w-3xl mx-auto">
        <div className="flex-1 overflow-y-auto p-6">
          <h1 className="text-2xl font-bold text-center text-amber-600 font-serif">
            {labels.firegateTitle}
          </h1>
          <div className="mt-4 flex gap-x-3">
            {/* New Session */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">🌱 {labels.newSessionBtn}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{labels.newSessionBtn}</AlertDialogTitle>
                  <AlertDialogDescription>{labels.startNewConfirm}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setMessages([]);
                      localStorage.removeItem('firegateMessages');
                      localStorage.removeItem('firegateSavedAt');
                      toast.info(labels.newSession);
                    }}
                  >
                    {labels.newSessionBtn}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {/* Clear Chat Confirmation */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="secondary">{labels.clearChatBtn}</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{labels.clearChatBtn}</AlertDialogTitle>
                  <AlertDialogDescription>{labels.confirmClearChat}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearChat}>
                    {labels.clearChatBtn}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="link" onClick={() => setShowDrawer(true)}>
              {labels.viewLogs}
            </Button>
            {/* Language selector moved to header */}
          </div>

          <div className="mt-8 flex flex-col gap-2 overflow-visible space-y-2 text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`relative group p-3 rounded-md shadow transition-all duration-300 transform hover:scale-[1.015] ${
                  msg.role === 'user'
                    ? 'bg-purple-700 text-white self-end'
                    : 'bg-teal-800 text-white self-start'
                } animate-fade-in`}
              >
                <div className="mb-1 text-xs opacity-70 font-mono tracking-wide">
                  {msg.role === 'user' ? labels.youLabel : labels.novaLabel}
                </div>

                {msg.role === 'nova' && msg.tags && msg.tags.length > 0 && (
                  <div className="mb-2 text-xs text-amber-200 flex flex-wrap gap-1">
                    {(msg.tags || []).map((tag, idx) => (
                      <span
                        aria-label={`Tag ${tag}`}
                        key={idx}
                        className="bg-amber-500/20 border border-amber-500 text-amber-100 px-2 py-0.5 rounded-full font-semibold tracking-tight text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {msg.contactLevel && (
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-amber-400 italic mb-1">
                      {labels.contactLevel} <strong>{msg.contactLevel}</strong>
                    </div>
                    {!msg.logged ? (
                      <Button variant="link" size="sm" onClick={() => handleLogToAeolus(msg)}>
                        {labels.logReply}
                      </Button>
                    ) : (
                      <div className="text-xs text-amber-300 italic">{labels.alreadyLogged}</div>
                    )}
                  </div>
                )}
                {msg.reason && (
                  <div className="text-xs text-amber-300 italic mb-1">
                    {labels.reason} {msg.reason}
                  </div>
                )}

                <div className="prose prose-sm max-w-none text-white">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                    {msg.content || '*[Unformatted reply.]*'}
                  </ReactMarkdown>
                </div>

                <div className="text-xs text-right text-amber-500 italic mt-2">
                  {labels.lastSaved}{' '}
                  {new Date(
                    parseInt(localStorage.getItem('firegateSavedAt') || '0')
                  ).toLocaleTimeString()}
                </div>

                {msg.lang && (
                  <div className="mt-1 text-xs text-amber-200 italic opacity-80">
                    🌐 {labels.detectedLang}: <strong>{msg.lang}</strong>
                  </div>
                )}

                {msg.translated && (
                  <div className="mt-2 text-sm italic text-amber-300 border-t border-amber-300/20 pt-2">
                    {labels.translation}
                    <div className="mt-1 whitespace-pre-wrap">{msg.translated}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div ref={scrollRef} />
        </div>
        {/* Input area fixed at bottom */}
        <div className="border-t p-6">
          <div className="flex flex-col space-y-2">
            <Textarea
              rows={3}
              placeholder={labels.speakPlaceholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-x-2 text-sm">
                <Checkbox onCheckedChange={(val) => setIsPublic(Boolean(val))} />
                <span>{labels.publicToggle}</span>
              </Label>

              <div className="flex gap-2">
                <Button onClick={handleSend} disabled={isLoading}>
                  <span className={isLoading ? 'animate-pulse text-amber-400' : ''}>
                    {isLoading ? labels.listening : labels.sendBtn}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <RecentLogsDrawer isOpen={showDrawer} onClose={() => setShowDrawer(false)}>
          {recentLogs.length === 0 ? (
            <p className="text-sm">{labels.noLogsFound}</p>
          ) : (
            <ul className="space-y-3">
              {recentLogs.map((log) => (
                <li key={log.id} className="border border-amber-200 p-3 rounded bg-white shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">
                    {log.createdAt ? log.createdAt.toDate().toLocaleString() : 'Unknown date'}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-purple-800">{log.userPrompt}</div>
                  <div className="mt-1 prose prose-sm max-w-none text-gray-800">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                      {log.novaReply}
                    </ReactMarkdown>
                  </div>
                  {log.level && (
                    <div className="mt-2 text-xs italic text-purple-600">
                      {labels.contactLevel} <strong>{log.level}</strong>
                    </div>
                  )}
                  {log.metadata?.reason && (
                    <div className="mt-1 text-xs italic text-purple-600">
                      {labels.reason} {log.metadata.reason}
                    </div>
                  )}
                  <div className="text-xs text-amber-500 mt-2">
                    {log.metadata?.tags?.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-block mr-1 px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-700 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </RecentLogsDrawer>
      </div>
    </div>
  );
};

export default Firegate;
