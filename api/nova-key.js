// /api/nova-key.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { prompt, tags = [], operator = 'anon' } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid prompt' });
  }

  // Fake Nova logic — replace with real call later
  const novaReply = `🔥 Nova received: "${prompt}"`;

  // Metadata generation — simple for now
  const metadata = {
    tags,
    tokens: prompt.split(/\s+/).length,
  };

  // You could log this in Firestore if needed

  return res.status(200).json({
    prompt,
    novaReply,
    metadata,
    operator,
  });
}