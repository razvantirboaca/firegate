import { useOnlineStatus } from '../context/OnlineStatusContext';

export const useNovaTranslate = () => {
  const isOnline = useOnlineStatus();

  const translate = async (text, targetLang = 'fr') => {
    try {
      const res = await fetch('http://localhost:3000/api/nova-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetLang,
          preferLocal: !isOnline,
        }),
      });

      const data = await res.json();
      return data.translation || text;
    } catch (err) {
      console.error('NovaTranslate failed:', err);
      return text;
    }
  };

  return translate;
};