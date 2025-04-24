import en from './en.json';
import es from './es.json';
import ro from './ro.json';

const locales = { en, es, ro };
export function t(key, locale = 'en') {
  return locales[locale]?.[key] ?? locales['en'][key] ?? key;
}
export default locales;