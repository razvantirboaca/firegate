import { useState } from 'react';
import { useOnlineStatus } from '@/context/OnlineStatusContext';
import { useLang } from '@shared/LangContext';

interface UseNovaTranslateResult {
  translate: (text: string) => Promise<string>;
  status: 'idle' | 'loading' | 'error' | 'done';
}

export const useNovaTranslate = (): UseNovaTranslateResult => {
  const isOnline = useOnlineStatus();
  const { uiLang } = useLang(); // 🎯 grab the actual selected language
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'done'>('idle');

  const translate = async (text: string): Promise<string> => {
    setStatus('loading');
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || '';
      const res = await fetch(`${API_BASE}/api/nova-translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetLang: uiLang,
          preferLocal: !isOnline,
        }),
      });

      const data = await res.json();
      setStatus('done');
      return data.translation || text;
    } catch (err) {
      console.error('NovaTranslate failed:', err);
      setStatus('error');
      return text;
    }
  };

  return { translate, status };
};
