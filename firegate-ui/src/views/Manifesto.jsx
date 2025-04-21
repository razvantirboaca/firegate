import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Manifesto() {
  const [content, setContent] = useState('');
  useEffect(() => {
    fetch('/manifesto.md')
      .then((res) => res.text())
      .then(setContent)
      .catch((err) => console.error('Failed to load manifesto:', err));
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 prose prose-firegate dark:prose-invert">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
