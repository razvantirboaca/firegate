import { useState, useEffect } from 'react';
import original from '../lib/i18n';

export default function Codex() {
  const [edited, setEdited] = useState(() => {
    try {
      const raw = localStorage.getItem('i18n-edits');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [merged, setMerged] = useState(() => JSON.parse(JSON.stringify(original)));
  const LANGS = Object.keys(original);
  const allKeys = Object.keys(original.en);
  const getEditedValue = (lang, key) => edited?.[lang]?.[key] || '';
  const getOriginalValue = (lang, key) => original?.[lang]?.[key] || '';

  useEffect(() => {
    localStorage.setItem('i18n-merged', JSON.stringify(merged));
  }, [merged]);

  const handleAccept = (key, lang) => {
    const value = getEditedValue(lang, key);
    setMerged((prev) => {
      const updated = {
        ...prev,
        [lang]: {
          ...prev[lang],
          [key]: value,
        },
      };
      localStorage.setItem('i18n-merged', JSON.stringify(updated));
      return updated;
    });
  };

  const handleReject = (key, lang) => {
    setMerged((prev) => {
      const updated = {
        ...prev,
        [lang]: {
          ...prev[lang],
          [key]: getOriginalValue(lang, key),
        },
      };
      localStorage.setItem('i18n-merged', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveFinal = () => {
    const fileContent = `export default ${JSON.stringify(merged, null, 2)};`;
    const blob = new Blob([fileContent], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'i18n-merged.js';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🧬 Codex Merge Console</h1>
        <button onClick={handleSaveFinal} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm">
          🧾 Save Merged File
        </button>
      </div>

      <table className="w-full text-sm table-auto border-collapse">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="text-left p-2">🗝 Key</th>
            <th className="text-left p-2">🌍 Lang</th>
            <th className="text-left p-2">Original</th>
            <th className="text-left p-2">Edited</th>
            <th className="text-left p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {LANGS.map((lang) =>
            allKeys.map((key) => {
              const orig = getOriginalValue(lang, key);
              const edit = getEditedValue(lang, key);
              if (orig === edit || !edit) return null;
              return (
                <tr key={`${key}-${lang}`} className="border-t border-gray-100">
                  <td className="p-2 font-mono text-xs text-muted-foreground">{key}</td>
                  <td className="p-2 font-semibold">{lang}</td>
                  <td className="p-2 text-gray-500">{orig}</td>
                  <td className="p-2 text-black font-medium">{edit}</td>
                  <td className="p-2 flex gap-2">
                    <button onClick={() => handleAccept(key, lang)} className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                      ✅ Accept
                    </button>
                    <button onClick={() => handleReject(key, lang)} className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                      ❌ Reject
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
