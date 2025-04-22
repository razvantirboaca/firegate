import { createContext, useState, useEffect, useContext } from 'react';

const OnlineStatusContext = createContext(true); // default: online

export const OnlineStatusProvider = ({ children }) => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return <OnlineStatusContext.Provider value={isOnline}>{children}</OnlineStatusContext.Provider>;
};

export const useOnlineStatus = () => useContext(OnlineStatusContext);
