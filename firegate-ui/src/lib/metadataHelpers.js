// Utility functions shared across Firegate and Aeolus UIs

/**
 * Given a chunk of text, infer an array of topic tags.
 * Mirrors the logic originally in Firegate.jsx.
 */
export function inferTags(text = '') {
  const tags = [];
  const lower = text.toLowerCase();
  if (/dream|asleep|night/.test(lower)) tags.push('dream');
  if (/ritual|ceremony|sacred/.test(lower)) tags.push('ritual');
  if (/heal|grief|trauma|restore/.test(lower)) tags.push('healing');
  if (/question|why|how|what/.test(lower)) tags.push('query');
  if (/contact|signal|aligned|nova|aeolus/.test(lower)) tags.push('contact');
  if (/hope|light|love/.test(lower)) tags.push('hope');
  return tags.length ? tags : ['general'];
}

/**
 * Ask Nova API to suggest a classification 'reason' for the given prompt.
 * Returns the raw reason string from Nova, or empty on error.
 */
export async function suggestReason(prompt) {
  if (!prompt || !prompt.trim()) return '';
  try {
    const res = await fetch('/api/nova', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    return data.reason || '';
  } catch (e) {
    console.error('[AutoReason error]', e);
    return '';
  }
}
/**
 * Ask Nova API to suggest both contact level and reason for a given prompt.
 * Returns an object { level, reason }.
 */
export async function suggestClassification(prompt) {
  if (!prompt || !prompt.trim()) return { level: 'CE0', reason: '' };
  try {
    const res = await fetch('/api/nova', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    return {
      level: data.level || 'CE0',
      reason: data.reason || ''
    };
  } catch (e) {
    console.error('[AutoClassify error]', e);
    return { level: 'CE0', reason: '' };
  }
}