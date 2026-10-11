import { read, write, KEYS, readScoped } from './store.js';
import { DEMO_BUSINESSES, DEMO_PRODUCTS, DEMO_MENTORS, VERIFICATION_LABELS } from './data.js';
import { accounts } from './auth.js';

export function securityFor(userId) {
  return { profileVisible: true, hideMobile: true, hideEmail: true, publicContact: 'business', blocked: [], reports: [], ...readScoped(KEYS.security, userId, {}) };
}

export function userBusinesses() {
  const all = read(KEYS.businesses, {});
  return Object.values(all).filter(b => b && b.id && b.ownerId && securityFor(b.ownerId).profileVisible);
}

export function allBusinesses() {
  return [...DEMO_BUSINESSES.map(b => ({ ...b, demo: true })), ...userBusinesses()];
}

export const findBusiness = id => allBusinesses().find(b => b.id === id) || null;

export function verificationFor(product) {
  if (product.demo) return { status: product.verification, demo: true, answers: null, history: [] };
  return { status: 'not_submitted', answers: null, history: [], ...(read(KEYS.verifications, {})[product.id] || {}) };
}

export const verificationLabel = status => VERIFICATION_LABELS[status] || VERIFICATION_LABELS.not_submitted;

export function userProducts(userId) {
  return readScoped(KEYS.products, userId, []).filter(p => p && p.id);
}

export function allProducts() {
  const overrides = read(KEYS.stock, {});
  const demo = DEMO_PRODUCTS.map(p => ({ ...p, stock: overrides[p.id] ?? p.stock }));
  const visibleOwners = new Set(userBusinesses().map(b => b.ownerId));
  const mine = Object.entries(read(KEYS.products, {}))
    .filter(([owner]) => visibleOwners.has(owner))
    .flatMap(([, list]) => (Array.isArray(list) ? list : []).filter(p => p && p.id));
  return [...demo, ...mine].map(p => ({ ...p, business: findBusiness(p.businessId) })).filter(p => p.business);
}

export const findProduct = id => allProducts().find(p => p.id === id) || null;

export function decrementStock(productId, qty) {
  const demo = DEMO_PRODUCTS.find(p => p.id === productId);
  if (demo) {
    const overrides = read(KEYS.stock, {});
    overrides[productId] = Math.max(0, (overrides[productId] ?? demo.stock) - qty);
    write(KEYS.stock, overrides);
    return;
  }
  const all = read(KEYS.products, {});
  for (const list of Object.values(all)) {
    const p = Array.isArray(list) && list.find(x => x.id === productId);
    if (p) p.stock = Math.max(0, (Number(p.stock) || 0) - qty);
  }
  write(KEYS.products, all);
}

export function allMentors() {
  const registered = accounts().filter(a => a.profile.role === 'Mentor').map(a => ({
    id: a.id,
    name: a.profile.name,
    city: a.profile.city,
    expertise: a.profile.mentor?.expertise || [],
    languages: a.profile.mentor?.languages || [],
    availability: a.profile.mentor?.availability || '',
    years: a.profile.mentor?.years || 0,
    bio: a.profile.mentor?.bio || '',
    img: '',
  }));
  return [...registered, ...DEMO_MENTORS];
}

/** Transparent rule-based score: each matching factor adds a fixed number of points. */
export function mentorMatch(mentor, wants) {
  const reasons = [];
  let score = 0;
  if (wants.expertise && mentor.expertise.includes(wants.expertise)) { score += 40; reasons.push('Expertise matches your goal'); }
  if (wants.language && mentor.languages.includes(wants.language)) { score += 25; reasons.push('Speaks your preferred language'); }
  if (wants.city && mentor.city === wants.city) { score += 20; reasons.push('Same city'); }
  if (wants.availability && mentor.availability === wants.availability) { score += 15; reasons.push('Availability fits'); }
  return { score, reasons };
}
