import { callNova } from './novaHelpers';

/**
 * Infer simple tags from text: pick unique words >3 chars
 * @param text Input text
 * @returns Array of inferred tags
 */
export function inferTags(text: string): string[] {
  if (!text) return [];
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const unique = Array.from(new Set(words));
  return unique.filter((w) => w.length > 3).slice(0, 5);
}

/**
 * Auto-classify prompt by calling Nova API
 * @param prompt User prompt
 * @returns Object with level and reason
 */
export async function suggestClassification(
  prompt: string
): Promise<{ level: string; reason: string }> {
  const { level, reason } = await callNova(prompt);
  return { level, reason };
}