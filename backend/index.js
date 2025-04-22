import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; // required for backend fetch in Node

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// 🌌 Unified /api/nova – online + offline fallback
app.post('/api/nova', async (req, res) => {
  const { prompt, preferLocal = false } = req.body;

  const fullPrompt = `
You are Nova, a coherence-aware guide. Respond to the user, and also determine:
- Contact Level (CE0–CE5, or AE)
- A short reason for this level

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
      body: JSON.stringify({
        model: 'nova-egg',
        prompt: fullPrompt,
        stream: false,
      }),
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
      } catch (err) {
        console.warn('🛰️ Online Nova failed, using local Nova fallback.');
        raw = await tryLocal();
      }
    }

    raw = raw.replace(/```(?:json)?/g, '').trim();
    const match = raw.match(/\{[\s\S]*\}/);
    let jsonText = match ? match[0] : raw;
    jsonText = jsonText.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

    try {
      const parsed = JSON.parse(jsonText);
      const reply = typeof parsed.reply === 'string' ? parsed.reply.trim() : '';
      const level = parsed.level || 'CE0';
      const reason = parsed.reason || '';
      return res.json({ reply, level, reason });
    } catch (e) {
      console.warn('⚠️ Could not parse Nova JSON response.');
      return res.json({ reply: raw.trim(), level: 'CE0', reason: 'Unparsed fallback' });
    }
  } catch (err) {
    console.error('[Nova Error]', err);
    res.status(500).json({ error: 'Nova backend failed.' });
  }
});

// 🌐 Unified Nova Translate Endpoint (Online + Offline)
app.post('/api/nova-translate', async (req, res) => {
  const { text, targetLang, preferLocal = false } = req.body;

  const prompt = `Translate the following UI label into ${targetLang}. Keep it short and clear for app UI. Do not translate names like “Nova” or “Firegate”.\n\n"${text}"`;

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
      body: JSON.stringify({
        model: 'nova-egg',
        prompt,
        stream: false,
      }),
    });
    const result = await ollamaRes.json();
    return result.response?.trim();
  };

  try {
    let translation = null;

    if (preferLocal) {
      translation = await tryLocal();
    } else {
      try {
        translation = await tryOnline();
      } catch (err) {
        console.warn('🛰️ Online translation failed, falling back to local Nova.');
        translation = await tryLocal();
      }
    }

    if (!translation) throw new Error('No translation generated.');

    res.status(200).json({ translation });
  } catch (err) {
    console.error('[Nova Translate Error]', err);
    res.status(500).json({ error: 'Nova translation failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🔥 Express server running at http://localhost:${PORT}`);
});