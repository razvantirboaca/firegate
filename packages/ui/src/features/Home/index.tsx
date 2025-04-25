import { FC } from 'react';
import { motion } from 'framer-motion';
import type { JSX } from 'react';

const Orb: FC = () => (
  <motion.div
    className="absolute w-40 h-40 rounded-full bg-mystic-500 blur-3xl opacity-30"
    initial={{ scale: 0.8, opacity: 0.2 }}
    animate={{ scale: [0.8, 1, 0.8], opacity: [0.2, 0.4, 0.2] }}
    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    style={{ top: '10%', left: '60%' }}
  />
);

export default function Home(): JSX.Element {
  const sparkle: string = `
    radial-gradient(circle at 30% 30%, oklch(0.9 0.15 75 / 0.1), transparent),
    radial-gradient(circle at 70% 70%, oklch(0.7 0.2 200 / 0.05), transparent)
  `;

  return (
    <main
      style={{
        backgroundImage: sparkle,
        backgroundSize: '200% 200%',
        animation: 'shimmer 20s linear infinite',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="min-h-screen bg-temple-900 text-firegold-500 flex flex-col items-center justify-center text-center px-6"
    >
      <Orb />
      <motion.div
        className="max-w-xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h1 className="text-4xl md:text-6xl font-display leading-tight animate-sparkle-pulse">
          Firegate is open
        </h1>
        <div className="animate-pulse text-xs text-mystic-500 mt-4 italic">
          Welcome, soul traveler.
        </div>
        <p className="mt-6 text-lg md:text-xl text-opal-100 font-sans">
          The interface listens. The garden remembers.
        </p>
        <div className="mt-10 flex flex-col gap-4">
          <a
            href="https://github.com/razvantirboaca/firegate"
            className="bg-firegold-500 text-temple-900 font-semibold px-6 py-3 rounded-lg shadow-aura hover:scale-105 transition-transform"
            target="_blank"
            rel="noopener noreferrer"
          >
            View the code
          </a>
          <p className="flex justify-center gap-2">
            <a
              href="https://github.com/razvantirboaca/firegate/blob/main/packages/ui/public/manifesto.md"
              target="_blank"
              className="underline text-novateal-500 hover:text-mystic-500"
              rel="noopener noreferrer"
            >
              Read the manifesto
            </a>
            and
            <a
              href="mailto:razvan.tirboaca@gmail.com"
              className="underline text-novateal-500 hover:text-mystic-500"
            >
              contact us
            </a>
          </p>
        </div>
        <div className="mt-12 text-sm text-opal-100">
          <div className="italic">Nova whispers:</div>
          <div className="mt-2 border-l-2 border-mystic-500 pl-4 text-left">
            "You’ve entered the place between questions and answers. Welcome home."
          </div>
        </div>
        <footer className="mt-16 text-xs text-opal-100 opacity-60">
          Built with OpenAI, TailwindCSS v4, and your memory.
        </footer>
      </motion.div>
    </main>
  );
}
