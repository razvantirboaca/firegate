// Abstractions for calling Nova and translation APIs
export async function callNova(prompt) {
  // TODO: implement Nova API call
  return fetch('/api/nova', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  }).then((r) => r.json());
}
export async function autoTranslate(text, source, target) {
  // TODO: implement translation
  return fetch('/api/autotranslate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, sourceLang: source, targetLang: target }),
  }).then((r) => r.json());
}