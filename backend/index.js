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

// 🔑 REAL NovaKey Endpoint
app.post('/api/nova-key', async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'nova-egg',
        prompt: prompt,
        stream: false,
      }),
    });

    const data = await response.json();

    if (!data.response) {
      return res.status(500).json({ novaReply: 'Nova is silent. Something went wrong.' });
    }

    res.json({ novaReply: data.response.trim() });
  } catch (err) {
    console.error('❌ Nova-key error:', err);
    res.status(500).json({ novaReply: 'Nova could not process your request right now.' });
  }
});

// 🔮 Upgraded Nova Endpoint with Contact Level & Reason
app.post('/api/nova', async (req, res) => {
  const { prompt } = req.body;

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

  try {
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
    // Attempt to extract and normalize a JSON object from the model's raw response
    let raw = result.response || '';
    // Strip out code fences if the model wrapped JSON in ``` or ```json
    raw = raw.replace(/```(?:json)?/g, '').trim();
    // Pull out the first {...} block
    const match = raw.match(/\{[\s\S]*\}/);
    let jsonText = match ? match[0] : raw;
    // Remove any trailing commas before closing braces or brackets to allow JSON.parse
    jsonText = jsonText
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']');
    try {
      const parsed = JSON.parse(jsonText);
      // Ensure reply is trimmed
      const reply = typeof parsed.reply === 'string' ? parsed.reply.trim() : '';
      const level = parsed.level || 'CE0';
      const reason = parsed.reason || '';
      return res.json({ reply, level, reason });
    } catch (e) {
      console.warn('⚠️ Could not parse JSON from Nova, returning raw response.');
      return res.json({ reply: raw.trim(), level: 'CE0', reason: 'Could not auto-parse contact level.' });
    }

  } catch (err) {
    console.error('Nova backend error:', err.message);
    res.status(500).json({ error: 'Nova backend failed.' });
  }
});

// 🌍 Translate Route (still OpenAI)
app.post('/api/autotranslate', async (req, res) => {
  const { text, sourceLang, targetLang } = req.body;

  try {
    const prompt = `Translate this from ${sourceLang} to ${targetLang}:\n\n"${text}"`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const translation = data.choices?.[0]?.message?.content || 'Translation failed';
    res.json({ translation });

  } catch (err) {
    console.error('[Translate Error]', err.message);
    res.status(500).json({ error: 'Translation failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🔥 Express server running at http://localhost:${PORT}`);
});