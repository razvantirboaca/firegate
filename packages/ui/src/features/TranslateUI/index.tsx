import React, { useState, useEffect } from 'react';
import translations from '@shared/i18n';
import { useOnlineStatus } from '@/context/OnlineStatusContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

type Locale = 'en' | 'es' | 'ro';
type TranslationMap = Record<Locale, Record<string, string>>;

const LANGS: Locale[] = ['en', 'es', 'ro'];

export default function TranslateUI() {
  const [data, setData] = useState<TranslationMap>(translations as TranslationMap);
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();

  useEffect(() => {
    if (import.meta.env.PROD) {
      navigate('/');
    }
    const saved = localStorage.getItem('i18n-edits');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch {
        console.warn('Failed to parse i18n-edits from localStorage');
      }
    }
  }, []);

  const handleChange = (lang: Locale, key: string, value: string) => {
    setData((prev) => {
      const updated = {
        ...prev,
        [lang]: {
          ...prev[lang],
          [key]: value,
        },
      };
      localStorage.setItem('i18n-edits', JSON.stringify(updated));
      return updated;
    });
  };

  const handleNovaTranslate = async (key: string, lang: Locale) => {
    const prompt = data.en[key];
    const res = await fetch('/api/nova-translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: prompt,
        targetLang: lang,
        preferLocal: !isOnline,
      }),
    });
    const json = await res.json();
    const cleaned = json.translation?.replace(/^"+|"+$/g, '').trim();
    handleChange(lang, key, cleaned);
  };

  const allKeys: string[] = Object.keys(data.en);

  const handleSaveToFile = () => {
    const fileContent = `export default ${JSON.stringify(data, null, 2)};`;
    const blob = new Blob([fileContent], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'i18n.js';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex gap-6 items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">🧩 Firegate Codex Codex</h1>
          <p className="text-muted-foreground text-sm">
            Live-edit or auto-translate any UI string below.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Button onClick={handleSaveToFile}>💾 Save to File</Button>
          <Link to="/codex" className="text-xs text-muted-foreground hover:underline">
            Go to Codex Console →
          </Link>
        </div>
      </div>

      <table className="w-full text-sm table-fixed border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            <th className="w-1/5 p-2">🗝 Key</th>
            {LANGS.map((lang) => (
              <th key={lang} className="w-1/5 p-2 capitalize">
                {lang}
              </th>
            ))}
            <th className="w-1/5 p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {allKeys.map((key) => (
            <tr key={key} className="border-t border-gray-100">
              <td className="p-2 font-mono text-xs text-muted-foreground">{key}</td>
              {LANGS.map((lang) => (
                <td key={lang} className="p-2">
                  <input
                    className="w-full bg-white border border-gray-200 px-2 py-1 rounded text-xs"
                    value={data[lang as Locale]?.[key] || ''}
                    onChange={(e) => handleChange(lang as Locale, key, e.target.value)}
                  />
                </td>
              ))}
              <td className="p-2 flex gap-1">
                {LANGS.filter((l) => l !== 'en').map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleNovaTranslate(key, lang as Locale)}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1 rounded"
                  >
                    🪄 {lang.toUpperCase()}
                  </button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
