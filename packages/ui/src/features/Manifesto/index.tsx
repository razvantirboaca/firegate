import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Manifesto() {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    fetch('/manifesto.md')
      .then((res: Response) => res.text())
      .then((text: string) => setContent(text))
      .catch((err) => console.error('Failed to load manifesto:', err));
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 prose prose-firegate dark:prose-invert">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
