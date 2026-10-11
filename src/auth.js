import { read, write, remove, KEYS } from './store.js';
import { t, setLang, getLang, LANGUAGES } from './i18n.js';
import { esc, uid, hashPassword, isEmail, isMobile, toast, formData, showErrors } from './utils.js';
import { state, actions, go } from './state.js';
import { CITIES, STATES, BUSINESS_CATEGORIES, SUSTAINABILITY_TYPES, LANGUAGE_OPTIONS, EXPERTISE, AVAILABILITY, DEMO_MENTEE_REQUESTS } from './data.js';
import { nav, opts, prototypeNote, field, selectField } from './ui.js';

export const ROLES = ['Entrepreneur', 'Mentor', 'Customer'];
export const dashRoute = role => ({ Entrepreneur: 'entrepreneur', Mentor: 'mentor', Customer: 'customer' }[role] || 'home');

export function accounts() {
  return read(KEYS.accounts, []).filter(a => a && typeof a.id === 'string' && typeof a.email === 'string' && a.profile && ROLES.includes(a.profile.role));
}

export function currentUser() {
  const session = read(KEYS.session, null);
  if (!session || typeof session.userId !== 'string') return null;
  const account = accounts().find(a => a.id === session.userId);
  if (!account) { remove(KEYS.session); return null; }
  return { ...account.profile, id: account.id, email: account.email, session };
}

export function updateProfile(userId, patch) {
  const list = read(KEYS.accounts, []);
  const account = list.find(a => a && a.id === userId);
  if (!account) return false;
  account.profile = { ...account.profile, ...patch };
  return write(KEYS.accounts, list);
}

export async function changePassword(userId, current, next) {
  const list = read(KEYS.accounts, []);
  const account = list.find(a => a && a.id === userId);
  if (!account || account.passwordHash !== await hashPassword(current)) return 'Your current password is incorrect.';
  if (next.length < 8) return 'Password must be at least 8 characters.';
  account.passwordHash = await hashPassword(next);
  write(KEYS.accounts, list);
  return '';
}

export function ensureBusiness(userId, profile) {
  const all = read(KEYS.businesses, {});
  if (all[userId]) return all[userId];
  const e = profile.entrepreneur || {};
  all[userId] = {
    id: 'biz-' + userId, ownerId: userId, name: e.businessName || `${profile.name} Studio`, founder: profile.name,
    statement: '', story: '', city: profile.city, state: profile.state, location: e.businessLocation || profile.city,
    category: e.businessCategory || BUSINESS_CATEGORIES[0], type: e.sustainabilityCategory || SUSTAINABILITY_TYPES[0],
    contactEmail: profile.email, contactPhone: profile.mobile, materials: '', method: '', packaging: '', women: '', img: '',
  };
  write(KEYS.businesses, all);
  return all[userId];
}

/** Carries accounts from the first version of the prototype (ecoher-accounts) into the new store once. */
export function migrateLegacy() {
  if (read(KEYS.accounts, []).length) return;
  let old = [];
  try { old = JSON.parse(localStorage.getItem('ecoher-accounts') || '[]'); } catch { old = []; }
  if (!Array.isArray(old) || !old.length) return;
  const migrated = old.filter(o => o && o.email && o.passwordHash && o.user).map(o => {
    const role = ROLES.includes(o.user.role) ? o.user.role : 'Customer';
    const profile = { name: o.user.name || o.email, email: o.email, mobile: '', city: o.user.city || '', state: '', language: 'en', role };
    if (role === 'Entrepreneur') profile.entrepreneur = { businessName: o.user.business || '', businessCategory: '', sustainabilityCategory: '', businessLocation: o.user.city || '' };
    if (role === 'Mentor') profile.mentor = { expertise: [], years: 0, languages: [], availability: '' };
    return { id: uid('user'), email: o.email, passwordHash: o.passwordHash, createdAt: new Date().toISOString(), profile };
  });
  write(KEYS.accounts, migrated);
  migrated.filter(a => a.profile.role === 'Entrepreneur').forEach(a => ensureBusiness(a.id, a.profile));
}

function startSession(userId) {
  write(KEYS.session, { userId, startedAt: new Date().toISOString(), userAgent: navigator.userAgent.slice(0, 120) });
}

export function loginPage() {
  return `${nav()}<main class="auth-wrap"><div class="auth-image"><div><div class="eyebrow" style="color:#e9e6d8">${t('Welcome back')}</div><h2 class="serif">${t('Grow with purpose. Build with trust.')}</h2></div></div>
  <div class="auth-form"><form class="auth-card" data-submit="login" novalidate>
    <div class="eyebrow">${t('Log in')}</div><h1>${t('Welcome back.')}</h1><p>${t('Log in with the email and password you registered in this browser.')}</p>
    ${prototypeNote()}
    ${field('email', 'Email address', 'email', { autocomplete: 'email' })}
    ${field('password', 'Password', 'password', { autocomplete: 'current-password' })}
    <p class="form-alert hide" id="loginError" role="alert"></p>
    <button class="btn full" type="submit">${t('Log in')}</button>
    <p class="muted small center">${t('New to EcoHer?')} <a href="#signup" class="link">${t('Create an account')}</a></p>
  </form></div></main>`;
}

export function signupPage() {
  const role = state.signupRole || '';
  const hidden = r => (role === r ? '' : 'hide');
  const checks = (name, list) => `<div class="check-grid">${list.map(x => `<label class="check"><input type="checkbox" name="${name}" value="${esc(x)}"> ${esc(t(x))}</label>`).join('')}</div>`;
  return `${nav()}<main class="auth-wrap signup"><div class="auth-image"><div><div class="eyebrow" style="color:#e9e6d8">${t('Join EcoHer')}</div><h2 class="serif">${t('Grow with purpose. Build with trust.')}</h2></div></div>
  <div class="auth-form"><form class="auth-card wide" data-submit="signup" novalidate>
    <div class="eyebrow">${t('Create your account')}</div><h1>${t('Join EcoHer')}</h1><p>${t('Choose your role. Each role gets its own dashboard.')}</p>
    ${prototypeNote()}
    <div class="form-grid">
      ${field('name', 'Full name', 'text', { autocomplete: 'name' })}
      ${field('email', 'Email address', 'email', { autocomplete: 'email' })}
      ${field('mobile', 'Mobile number', 'tel', { placeholder: '98765 43210', autocomplete: 'tel' })}
      ${selectField('city', 'City', CITIES, { placeholder: 'Select city', translate: false })}
      ${selectField('state', 'State', STATES, { placeholder: 'Select state', translate: false })}
      <div class="form-control"><label for="f-language">${t('Preferred language')}</label><select id="f-language" name="language">${LANGUAGES.map(l => `<option value="${l.code}" ${l.code === getLang() ? 'selected' : ''}>${l.label}</option>`).join('')}</select></div>
      ${field('password', 'Password', 'password', { autocomplete: 'new-password', hint: 'At least 8 characters.' })}
      ${field('confirm', 'Confirm password', 'password', { autocomplete: 'new-password' })}
    </div>
    <div class="form-control"><label for="f-role">${t('I am joining as')}</label><select id="f-role" name="role" data-change="signupRole"><option value="">${t('Select your role')}</option>${ROLES.map(r => `<option value="${r}" ${r === role ? 'selected' : ''}>${t(r)}</option>`).join('')}</select></div>
    <fieldset class="role-fields ${hidden('Entrepreneur')}" data-role-section="Entrepreneur"><legend>${t('Business details')}</legend><div class="form-grid">
      ${field('businessName', 'Business name', 'text')}
      ${selectField('businessCategory', 'Business category', BUSINESS_CATEGORIES, { placeholder: 'Select category' })}
      ${selectField('sustainabilityCategory', 'Sustainability category', SUSTAINABILITY_TYPES, { placeholder: 'Select category' })}
      ${field('businessLocation', 'Business location', 'text', { placeholder: 'Area, city' })}
    </div></fieldset>
    <fieldset class="role-fields ${hidden('Mentor')}" data-role-section="Mentor"><legend>${t('Mentor details')}</legend>
      <div class="form-control"><label>${t('Areas of expertise')}</label>${checks('expertise', EXPERTISE)}<input type="hidden" name="expertiseCheck"></div>
      <div class="form-grid">${field('years', 'Years of experience', 'number', { min: 0, max: 60 })}${selectField('availability', 'Availability', AVAILABILITY, { placeholder: 'Select availability' })}</div>
      <div class="form-control"><label>${t('Languages spoken')}</label>${checks('mentorLanguages', LANGUAGE_OPTIONS)}<input type="hidden" name="languagesCheck"></div>
    </fieldset>
    <p class="muted small ${hidden('Customer')}" data-role-section="Customer">${t('Customers only need the details above. You can browse, save favourites and place demo orders.')}</p>
    <button class="btn full" type="submit">${t('Create account')}</button>
    <p class="muted small center">${t('Already have an account?')} <a href="#login" class="link">${t('Log in')}</a></p>
  </form></div></main>`;
}

Object.assign(actions, {
  signupRole(el) {
    state.signupRole = el.value;
    document.querySelectorAll('[data-role-section]').forEach(s => s.classList.toggle('hide', s.dataset.roleSection !== el.value));
  },

  async signup(form) {
    const d = formData(form);
    const fd = new FormData(form);
    const errors = {};
    for (const k of ['name', 'email', 'mobile', 'city', 'state', 'language', 'password', 'confirm']) if (!d[k]) errors[k] = 'This field is required.';
    if (d.email && !isEmail(d.email)) errors.email = 'Enter a valid email address.';
    if (d.mobile && !isMobile(d.mobile)) errors.mobile = 'Enter a valid 10-digit Indian mobile number.';
    if (d.password && d.password.length < 8) errors.password = 'Password must be at least 8 characters.';
    if (d.confirm && d.password !== d.confirm) errors.confirm = 'Passwords do not match.';
    if (!ROLES.includes(d.role)) errors.role = 'Select a role.';
    if (d.role === 'Entrepreneur') for (const k of ['businessName', 'businessCategory', 'sustainabilityCategory', 'businessLocation']) if (!d[k]) errors[k] = 'This field is required.';
    if (d.role === 'Mentor') {
      if (!fd.getAll('expertise').length) errors.expertiseCheck = 'Select at least one area of expertise.';
      if (!fd.getAll('mentorLanguages').length) errors.languagesCheck = 'Select at least one language.';
      const years = Number(d.years);
      if (d.years === '' || !Number.isFinite(years) || years < 0 || years > 60) errors.years = 'Enter years of experience between 0 and 60.';
      if (!d.availability) errors.availability = 'This field is required.';
    }
    const email = (d.email || '').toLowerCase();
    if (!errors.email && accounts().some(a => a.email === email)) errors.email = 'An account with this email already exists. Log in instead.';
    if (!showErrors(form, errors)) return;

    const profile = { name: d.name, email, mobile: d.mobile.replace(/\s/g, ''), city: d.city, state: d.state, language: d.language, role: d.role };
    if (d.role === 'Entrepreneur') profile.entrepreneur = { businessName: d.businessName, businessCategory: d.businessCategory, sustainabilityCategory: d.sustainabilityCategory, businessLocation: d.businessLocation };
    if (d.role === 'Mentor') profile.mentor = { expertise: fd.getAll('expertise'), years: Number(d.years), languages: fd.getAll('mentorLanguages'), availability: d.availability, bio: '' };
    const account = { id: uid('user'), email, passwordHash: await hashPassword(d.password), createdAt: new Date().toISOString(), profile };
    const list = read(KEYS.accounts, []);
    list.push(account);
    if (!write(KEYS.accounts, list)) { toast('Could not save your account in this browser.'); return; }
    if (d.role === 'Entrepreneur') ensureBusiness(account.id, profile);
    if (d.role === 'Mentor') {
      const requests = read(KEYS.mentorRequests, []);
      DEMO_MENTEE_REQUESTS.forEach(r => requests.push({ ...r, id: uid('req'), mentorId: account.id, mentorName: profile.name, entrepreneurId: 'demo', demo: true, status: 'pending', notes: [], createdAt: new Date().toISOString() }));
      write(KEYS.mentorRequests, requests);
    }
    startSession(account.id);
    setLang(d.language);
    state.signupRole = '';
    toast('Account created. Welcome to EcoHer, {name}.', { name: profile.name.split(' ')[0] });
    go(dashRoute(d.role));
  },

  async login(form) {
    const d = formData(form);
    const box = form.querySelector('#loginError');
    const fail = msg => { box.textContent = t(msg); box.dataset.msg = msg; box.classList.remove('hide'); toast(msg); };
    if (!d.email || !d.password) return fail('Enter your email and password.');
    const account = accounts().find(a => a.email === d.email.toLowerCase());
    if (!account) return fail('No account found for this email. Create an account first.');
    if (account.passwordHash !== await hashPassword(d.password)) return fail('Incorrect password. Please try again.');
    startSession(account.id);
    toast('Welcome back, {name}.', { name: account.profile.name.split(' ')[0] });
    go(dashRoute(account.profile.role));
  },

  logout() {
    remove(KEYS.session);
    state.modal = null;
    toast('You have logged out. Your account is still saved in this browser.');
    go('home');
  },
});
