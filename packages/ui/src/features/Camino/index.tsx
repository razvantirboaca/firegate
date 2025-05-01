import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function CaminoViewer() {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    fetch('/src/features/Camino/Camino.md')
      .then((res) => res.text())
      .then(setContent);
  }, []);

  return (
    <div className="prose mx-auto p-6 text-white max-w-3xl bg-black/50 backdrop-blur-md rounded-xl shadow-lg">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
