import { useEffect, useRef, useState } from 'react';

interface SeedPortalProps {
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
}

const placeholderWhispers = [
  'Type when you feel called...',
  'What truth stirs in you today?',
  'Leave a seed for tomorrow’s garden.',
  'One breath, one thought...',
  'Speak like the field is listening.',
];

export const SeedPortal = ({ input, setInput, sendMessage }: SeedPortalProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [placeholder, setPlaceholder] = useState(placeholderWhispers[0]);

  // Autogrow magic
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);

  // Rotate placeholder whispers
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder((prev) => {
        const currentIndex = placeholderWhispers.indexOf(prev);
        const nextIndex = (currentIndex + 1) % placeholderWhispers.length;
        return placeholderWhispers[nextIndex];
      });
    }, 5000); // Change every 5 seconds, gentle pace

    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  return (
    <div className="seed-portal">
      <textarea
        ref={textareaRef}
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
        className="breathing-textarea"
        rows={1}
      />
      <button className="send-button" onClick={sendMessage}>
        Send
      </button>
    </div>
  );
};
