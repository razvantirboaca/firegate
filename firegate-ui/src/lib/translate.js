import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  const { text } = await req.json();

  const chat = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'Translate this text to the user\'s native language (auto-detect). Be clear, neutral, and avoid repetition.',
      },
      {
        role: 'user',
        content: text,
      },
    ],
  });

  return new Response(JSON.stringify({ translatedText: chat.choices[0].message.content }), {
    headers: { 'Content-Type': 'application/json' },
  });
}