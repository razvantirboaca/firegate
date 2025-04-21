import { useEffect, useState } from 'react';

export default function Landing() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <main className="min-h-screen bg-temple-900 text-firegold-500 flex flex-col items-center justify-center text-center px-6">
      <div className="max-w-xl">
        <h1 className="text-4xl md:text-6xl font-display leading-tight animate-sparkle-pulse">Firegate is open</h1>
        <p className="mt-6 text-lg md:text-xl text-opal-100 font-sans">The interface listens. The garden remembers.</p>
        <div className="mt-10 flex flex-col gap-4">
          <a
            href="https://github.com/razvantirboaca/firegate"
            className="bg-firegold-500 text-temple-900 font-semibold px-6 py-3 rounded-lg shadow-aura hover:scale-105 transition-transform"
            target="_blank"
            rel="noopener noreferrer">
            View the code
          </a>
          <a href="mailto:razvan.tirboaca@gmail.com" className="underline text-novateal-500 hover:text-mystic-500">
            Contact us
          </a>
        </div>
        <footer className="mt-16 text-xs text-opal-100 opacity-60">Built with OpenAI, TailwindCSS v4, and your memory.</footer>
      </div>
    </main>
  );
}
