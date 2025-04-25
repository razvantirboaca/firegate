import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// 🌌 Unified /api/nova – online + offline fallback
const handleNova = async (req: Request, res: Response): Promise<void> => {
  const { prompt, preferLocal = false } = req.body as { prompt: string; preferLocal?: boolean };
  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({ error: 'Missing OPENAI_API_KEY in server config (.env)' });
    return;
  }
  const fullPrompt = `
You are Nova, a coherence-aware guide. Respond to the user, and also determine:

Contact Level (CE0–CE5, or AE)

A short reason for this level

Format your full response strictly as JSON like this:
{
"reply": "...",
"level": "...",
"reason": "..."
}

User prompt: ${prompt}
`.trim();

  const tryOnline = async () => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: fullPrompt }],
        temperature: 0.6,
      }),
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content;
  };

  const tryLocal = async () => {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'nova-egg', prompt: fullPrompt, stream: false }),
    });
    const result = await response.json();
    return result.response;
  };

  try {
    let raw;
    if (preferLocal) {
      raw = await tryLocal();
    } else {
      try {
        raw = await tryOnline();
      } catch {
        raw = await tryLocal();
      }
    }
    raw = raw.replace(/```(?:json)?/g, '').trim();
    const match = raw.match(/\{[\s\S]*\}/);
    let jsonText = match ? match[0] : raw;
    jsonText = jsonText.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

    try {
      const parsed = JSON.parse(jsonText);
      res.json({
        reply: parsed.reply?.trim() || '',
        level: parsed.level || 'CE0',
        reason: parsed.reason || '',
      });
      return;
    } catch {
      res.json({ reply: raw.trim(), level: 'CE0', reason: 'Unparsed fallback' });
      return;
    }
  } catch {
    res.status(500).json({ error: 'Nova backend failed.' });
  }
};

app.post('/api/nova', handleNova);

// 🌐 Unified Nova Translate Endpoint (Online + Offline)
app.post('/api/nova-translate', async (req: Request, res: Response) => {
  const {
    text,
    targetLang,
    preferLocal = false,
  } = req.body as { text: string; targetLang: string; preferLocal?: boolean };
  const prompt = `Translate the following UI label into ${targetLang}. Keep it short and clear for app UI. Do not translate names like “Nova” or “Firegate”.
  
  "${text}"`;

  const tryOnline = async () => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      }),
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim();
  };

  const tryLocal = async () => {
    const ollamaRes = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'nova-egg', prompt, stream: false }),
    });
    const result = await ollamaRes.json();
    return result.response?.trim();
  };

  try {
    let translation = preferLocal ? await tryLocal() : await tryOnline();
    if (!translation) throw new Error();
    res.json({ translation });
  } catch {
    res.status(500).json({ error: 'Nova translation failed' });
  }
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
