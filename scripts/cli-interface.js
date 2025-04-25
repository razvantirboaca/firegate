import readline from 'readline';
import { aeolusFilter } from './aeolus-filter.js';
import { spawn } from 'child_process';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("🌱 NovaEgg ready. Ask anything:\n");

rl.on('line', (input) => {
  const safeInput = aeolusFilter(input);
  const child = spawn('ollama', ['run', 'nova-egg'], { stdio: ['pipe', 'inherit', 'inherit'] });

  child.stdin.write(`${safeInput}\n`);
  child.stdin.end();
});