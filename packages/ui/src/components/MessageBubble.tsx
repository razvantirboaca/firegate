import { motion } from 'framer-motion';
import { Typewriter } from 'react-simple-typewriter';
import React, { useEffect, useState } from 'react';

interface MessageBubbleProps {
  role: 'user' | 'nova';
  content: string;
  layer?: '3D' | '4D' | '5D' | '6D' | '7D';
  timestamp?: string;
  tags?: string[];
  contactLevel?: string;
  translated?: string | null;
  lang?: string;
  reason?: string;
}

export const MessageBubble = ({
  role,
  content,
  layer,
  timestamp,
  tags,
  contactLevel,
  translated,
  lang,
  reason,
}: MessageBubbleProps) => {
  const [showTranslated, setShowTranslated] = useState(false);
  const getGradientClass = () => {
    switch (layer) {
      case '3D':
        return 'bg-gradient-to-br from-amber-100 to-amber-200 text-slate-800';
      case '4D':
        return 'bg-gradient-to-br from-pink-100 to-pink-200 text-slate-800';
      case '5D':
        return 'bg-gradient-to-br from-sky-100 to-cyan-200 text-slate-800';
      case '6D':
        return 'bg-gradient-to-br from-indigo-100 to-purple-200 text-slate-800';
      case '7D':
        return 'bg-gradient-to-br from-white to-slate-100 text-black';
      default:
        return role === 'user'
          ? 'bg-gradient-to-br from-slate-300 to-slate-200'
          : 'bg-gradient-to-br from-blue-100 to-blue-200';
    }
  };

  useEffect(() => {
    if (role !== 'nova') return;
    const timeout = setTimeout(() => setShowTranslated(true), 800);
    return () => clearTimeout(timeout);
  }, [translated, role]);

  return (
    <motion.div
      className={`rounded-2xl p-4 mb-4 max-w-[80%] min-w-[120px] shadow-lg border border-white/30 backdrop-blur-md ${
        role === 'user' ? 'self-end' : 'self-start'
      } ${getGradientClass()} ${role === 'nova' ? 'animate-fade-in' : ''}`}
      style={{
        display: 'inline-block',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
      initial={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {tags && tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="tag px-2 py-0.5 bg-gradient-to-br from-pink-200 to-yellow-200 text-slate-800 text-xs rounded-full shadow hover:scale-105 hover:rotate-2 hover:shadow-md transition transform duration-300 ease-out"
            >
              🎉 #{tag}
            </span>
          ))}
        </div>
      )}

      {role === 'nova' ? (
        <div className="relative w-full">
          {/* Invisible block that reserves full layout size */}
          <div className="invisible whitespace-pre-wrap break-words">{content}</div>

          {/* Absolute overlay with the animated typewriter */}
          <div className="absolute top-0 left-0 whitespace-pre-wrap break-words w-full">
            <Typewriter words={[content]} typeSpeed={30} cursor={false} />
          </div>
        </div>
      ) : (
        <div>{content}</div>
      )}

      {translated && lang !== 'en' && showTranslated && (
        <motion.div
          className="text-sm text-slate-600 mt-2 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {translated}
        </motion.div>
      )}

      {contactLevel && (
        <div className="mt-1 text-xs text-slate-800/60">
          <span role="img" aria-label="compass">
            🛰️
          </span>
          <span className="ml-1">Contact Level: {contactLevel}</span>
        </div>
      )}
      {reason && role === 'nova' && (
        <motion.div
          className="mt-1 text-xs text-slate-800/60 "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <span role="img" aria-label="compass">
            🧭
          </span>
          <span className="ml-1 italic">Nova’s intention: "{reason}"</span>
        </motion.div>
      )}

      {timestamp && (
        <div className="mt-1 text-[10px] text-slate-800/40 tracking-wide">{timestamp}</div>
      )}
    </motion.div>
  );
};
