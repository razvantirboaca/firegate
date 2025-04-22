export default async function handler(req, res) {
  const { text, targetLang } = req.body;

  const prompt = `Translate the following UI label into ${targetLang}. Keep it short and clear, suitable for an app interface. Do not translate words like “Nova” or “Firegate”.\n\n"${text}"`;

  try {
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
    const translation = result.response?.trim();

    if (!translation) throw new Error('No translation returned.');

    res.status(200).json({ translation });
  } catch (err) {
    console.error('[Nova-Local Translation Error]', err);
    res.status(500).json({ error: 'Offline translation failed' });
  }
}