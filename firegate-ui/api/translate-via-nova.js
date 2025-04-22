export default async function handler(req, res) {
  const { text, targetLang } = req.body;

  const prompt = `Translate the following UI label into ${targetLang}. Keep it short and clear, suitable for an app interface. Do not translate words like “Nova” or “Firegate”.\n\n"${text}"`;

  try {
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
    const translation = data.choices?.[0]?.message?.content?.trim();

    if (!translation) throw new Error('No translation returned.');

    res.status(200).json({ translation });
  } catch (err) {
    console.error('[Nova Translation Error]', err);
    res.status(500).json({ error: 'Translation failed' });
  }
}