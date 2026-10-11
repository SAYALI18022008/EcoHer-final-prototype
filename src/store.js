const PREFIX = 'ecoher.v2.';

export const KEYS = {
  accounts: 'accounts',
  session: 'session',
  lang: 'language',
  businesses: 'businessProfiles',
  products: 'products',
  verifications: 'productVerifications',
  finance: 'financeRecords',
  mentorRequests: 'mentorshipRequests',
  cart: 'carts',
  favourites: 'favourites',
  orders: 'demoOrders',
  security: 'securityPreferences',
  chat: 'coachChatHistory',
  impact: 'impactRecords',
  messages: 'businessMessages',
  notifications: 'notifications',
  stock: 'demoStockOverrides',
};

export function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw === null || raw === '') return structuredClone(fallback);
    const value = JSON.parse(raw);
    if (value === null || typeof value !== typeof fallback || Array.isArray(value) !== Array.isArray(fallback)) return structuredClone(fallback);
    return value;
  } catch {
    return structuredClone(fallback);
  }
}

export function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function remove(key) {
  localStorage.removeItem(PREFIX + key);
}

/** Records keyed by user (or business) id inside one storage key. */
export function readScoped(key, scopeId, fallback) {
  const all = read(key, {});
  const value = all[scopeId];
  if (value === undefined || value === null || typeof value !== typeof fallback || Array.isArray(value) !== Array.isArray(fallback)) return structuredClone(fallback);
  return value;
}

export function writeScoped(key, scopeId, value) {
  const all = read(key, {});
  all[scopeId] = value;
  return write(key, all);
}
