import React, { useState, useRef } from 'react';
import { MemoryPool } from '@/components/MemoryPool';
import type { ChatMessage } from '@/features/Firegate/types';

// TEMP: Soul layer detector
const detectSoulLayer = (text: string): ChatMessage['layer'] => {
  if (/body|pain|money/.test(text)) return '3D';
  if (/emotion|forgive|suffering/.test(text)) return '4D';
  if (/oneness|consciousness|energy/.test(text)) return '5D';
  if (/soul|blueprint|timeline/.test(text)) return '6D';
  if (/source|god|origin/.test(text)) return '7D';
  return undefined;
};

const callNovaApi = async (prompt: string) => {
  const response = await fetch('/api/nova', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) throw new Error('Nova backend error');

  const { reply, level, reason, layer } = await response.json();
  return { reply, level, reason, layer };
};

const speak = (text: string) => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }
};

const inferTags = (text: string): string[] => {
  return text.includes('love') ? ['emotion'] : ['general'];
};

const translateText = async (text: string): Promise<string> => {
  return Promise.resolve(text); // mock async translation
};

const Firegate = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [latestLayer, setLatestLayer] = useState<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);

  const handleSend = async () => {
    const promptText = input.trim();
    if (!promptText) return;

    if (activeSuggestion && promptText === activeSuggestion) {
      console.log('🔥 User submitted exact suggestion:', activeSuggestion);
    }

    appendUserMessage(promptText);
    setInput('');
    setActiveSuggestion(null);

    try {
      const shimmerId =
        typeof window !== 'undefined' && window.crypto?.randomUUID
          ? window.crypto.randomUUID()
          : Date.now().toString();

      const thinkingMessage: ChatMessage = {
        role: 'nova',
        content: '',
        tags: [],
        lang: '',
        contactLevel: '',
        translated: null,
        reason: '',
        layer: undefined,
        timestamp: new Date().toLocaleTimeString(),
        logged: false,
        id: shimmerId, // extend ChatMessage type with optional id
      };

      setMessages((prev) => [...prev, thinkingMessage]);

      const { reply, level, reason } = await callNovaApi(promptText);
      const tagsArr = inferTags(promptText);
      // const langDetected = detectLang(reply); // keeping placeholder for later
      const langDetected = 'en'; // hardcoded for now, will switch later
      const layer = detectSoulLayer(reply);
      const timestamp = new Date().toLocaleTimeString();

      const novaMessage: ChatMessage = {
        role: 'nova',
        content: reply,
        tags: tagsArr,
        lang: langDetected,
        contactLevel: level,
        translated: null,
        reason,
        layer,
        timestamp,
        logged: false,
        id: shimmerId,
      };

      setMessages((prev) => prev.map((msg) => (msg.id === shimmerId ? novaMessage : msg)));
      setLatestLayer(layer);
      speak(reply);

      const translated = await translateText(reply);
      if (translated && translated !== reply) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.role === 'nova' && msg.content === reply ? { ...msg, translated } : msg
          )
        );
      }
    } catch (err) {
      console.error('Nova error:', err);
      const fallbackMessage: ChatMessage = {
        role: 'nova',
        content: 'Nova error',
        tags: [],
        lang: '',
        contactLevel: 'CE0',
        translated: null,
        reason: '',
        layer: '3D',
        timestamp: new Date().toLocaleTimeString(),
        logged: false,
      };
      appendNovaMessage(fallbackMessage);
      speak('Nova error');
    }
  };

  const appendUserMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      { role: 'user', content, timestamp: new Date().toLocaleTimeString() },
    ]);
  };

  const appendNovaMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  return (
    <div className="flex flex-col h-full">
      <MemoryPool
        messages={messages}
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        activeSuggestion={activeSuggestion}
        setActiveSuggestion={setActiveSuggestion}
        activeLayer={latestLayer}
      />
      <div ref={scrollRef} />
    </div>
  );
};

export default Firegate;
