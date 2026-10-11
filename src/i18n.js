import { read, write, KEYS } from './store.js';
import hi from './locales/hi.js';
import mr from './locales/mr.js';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
];

const dictionaries = { en: {}, hi, mr };
let current = LANGUAGES.some(l => l.code === read(KEYS.lang, 'en')) ? read(KEYS.lang, 'en') : 'en';

export const getLang = () => current;

export function setLang(code) {
  if (!dictionaries[code]) return;
  current = code;
  write(KEYS.lang, code);
  document.documentElement.lang = code;
}

/** English text is the key; Hindi and Marathi come from the central dictionaries. */
const missing = import.meta.env?.DEV ? (globalThis.__i18nMissing = new Set()) : null;

export function t(key, vars) {
  if (missing && dictionaries.hi[key] === undefined) missing.add(key);
  const text = dictionaries[current][key] ?? key;
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (_, name) => (vars[name] ?? `{${name}}`));
}
