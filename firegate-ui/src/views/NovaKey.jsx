import React, { useState } from 'react';

export default function NovaKey() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [isLoading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || '';
      const res = await fetch(`${API_BASE}/api/nova-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, tags: [] }),
      });

      const data = await res.json();
      setReply(data?.novaReply || 'No reply from Nova');
      setMessages((prev) => [...prev, { prompt, reply: data?.novaReply || 'No reply from Nova' }]);
      setPrompt('');
    } catch (err) {
      setReply('Error contacting Nova.');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen px-4 py-6 transition-colors duration-500 ease-in-out">
      <div className="flex-grow max-w-2xl w-full mx-auto">
        <h1 className="text-3xl font-semibold mb-6 text-center">🔑 Nova Key</h1>

        <div className="space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className="bg-amber-50/50 text-amber-800 p-4 rounded shadow-sm border border-amber-200">
              <p className="text-sm font-semibold mb-1">You:</p>
              <p className=" whitespace-pre-wrap">{msg.prompt}</p>
              <p className="text-sm font-semibold text-amber-600 mt-4 mb-1">Nova:</p>
              <p className="text-gray-900 whitespace-pre-wrap">{msg.reply}</p>
            </div>
          ))}

          {isLoading && <div className="text-center py-4 text-amber-700 animate-pulse">✨ Nova is tuning in...</div>}
        </div>
      </div>

      <form onSubmit={handleSend} className="mt-8 max-w-2xl mx-auto w-full">
        <textarea
          rows={3}
          className="w-full border border-amber-300 p-4 rounded-lg text-amber-800 placeholder-amber-800/50 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          placeholder="Ask Nova anything..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-3  bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-md shadow px-5 transition">
          Send
        </button>
      </form>
    </div>
  );
}
