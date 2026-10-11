import './styles/base.css';
import './styles/app.css';
import { state, actions, modals, setRenderer, closeModal } from './state.js';
import { t, setLang, getLang } from './i18n.js';
import { currentUser, dashRoute, loginPage, signupPage, migrateLegacy } from './auth.js';
import { home, discover, businessPage, mentorshipPage, impactPage } from './pages/public.js';
import { customerDashboard } from './pages/customer.js';
import { mentorDashboard } from './pages/mentor.js';
import { entrepreneurDashboard } from './pages/entrepreneur.js';
import './verification.js';
import { toast, FALLBACK_IMG } from './utils.js';

const root = document.getElementById('app');
const PROTECTED = { entrepreneur: 'Entrepreneur', mentor: 'Mentor', customer: 'Customer' };
let lastHash = null;

function guard(base) {
  const u = currentUser();
  if (base === 'dashboard' || PROTECTED[base]) {
    if (!u) { toast('Please log in to open your dashboard.'); return 'login'; }
    if (base === 'dashboard') return dashRoute(u.role);
    if (u.role !== PROTECTED[base]) { toast('Access blocked: this dashboard is only for {role} accounts.', { role: t(PROTECTED[base]) }); return dashRoute(u.role); }
  }
  if ((base === 'login' || base === 'signup') && u) return dashRoute(u.role);
  return null;
}

function page(base, param) {
  switch (base) {
    case 'discover': return discover();
    case 'login': return loginPage();
    case 'signup': return signupPage();
    case 'mentorship': return mentorshipPage();
    case 'impact': return impactPage();
    case 'business': return businessPage(param);
    case 'entrepreneur': return entrepreneurDashboard(param);
    case 'mentor': return mentorDashboard(param);
    case 'customer': return customerDashboard(param);
    default: return home();
  }
}

function snapshotForm() {
  return [...root.querySelectorAll('input,select,textarea')]
    .filter(el => (el.name || el.id) && el.type !== 'file' && el.type !== 'hidden' && el.id !== 'langSelect')
    .map(el => ({ key: `${el.closest('form')?.dataset.submit || ''}|${el.name || el.id}|${el.type === 'checkbox' ? el.value : ''}`, value: el.value, checked: el.checked, checkbox: el.type === 'checkbox' }));
}

function restoreForm(snapshot) {
  const els = [...root.querySelectorAll('input,select,textarea')];
  for (const s of snapshot) {
    const el = els.find(e => `${e.closest('form')?.dataset.submit || ''}|${e.name || e.id}|${e.type === 'checkbox' ? e.value : ''}` === s.key);
    if (!el) continue;
    if (s.checkbox) el.checked = s.checked; else el.value = s.value;
  }
}

function render({ keepScroll = false, preserveForm = false } = {}) {
  const hash = location.hash.slice(1) || 'home';
  const [base, param = ''] = hash.split('/');
  const redirect = guard(base);
  if (redirect && redirect !== hash) { location.replace('#' + redirect); return; }
  state.route = base;
  state.param = param;
  const snapshot = preserveForm ? snapshotForm() : null;
  const focusedId = preserveForm ? document.activeElement?.id : null;
  const modal = state.modal && modals[state.modal.type] ? modals[state.modal.type](state.modal.data) : '';
  root.innerHTML = `<div class="backend-notice">${t('Frontend prototype · Accounts and data are saved only in this browser (localStorage).')}</div>${page(base, param)}${modal}`;
  if (snapshot) restoreForm(snapshot);
  if (focusedId) document.getElementById(focusedId)?.focus();
  document.title = `EcoHer — ${t('Grow with purpose. Build with trust.')}`;
  const log = document.getElementById('chatLog');
  if (log) log.scrollTop = log.scrollHeight;
  if (!keepScroll && hash !== lastHash) window.scrollTo(0, 0);
  lastHash = hash;
}

setRenderer(render);

Object.assign(actions, {
  closeModal,
  _rerenderKeep: () => render({ keepScroll: true }),
  setLanguage(el) {
    setLang(el.value);
    render({ keepScroll: true, preserveForm: true });
    document.getElementById('langSelect')?.focus();
  },
});

function run(name, el, event) {
  const fn = actions[name];
  if (!fn) return;
  Promise.resolve().then(() => fn(el, event)).catch(err => { console.error(err); toast('Something went wrong. Please try again.'); });
}

document.addEventListener('click', e => {
  if (e.target.matches?.('[data-backdrop]')) return closeModal();
  const el = e.target.closest('[data-action]');
  if (el && !el.disabled) run(el.dataset.action, el, e);
});
document.addEventListener('submit', e => {
  const form = e.target.closest('form[data-submit]');
  if (!form) return;
  e.preventDefault();
  run(form.dataset.submit, form, e);
});
document.addEventListener('change', e => { const el = e.target.closest('[data-change]'); if (el) run(el.dataset.change, el, e); });
document.addEventListener('input', e => { const el = e.target.closest('[data-input]'); if (el) run(el.dataset.input, el, e); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && state.modal) closeModal(); });
document.addEventListener('error', e => {
  const el = e.target;
  if (el?.tagName === 'IMG' && el.dataset.fallback !== '1') { el.dataset.fallback = '1'; el.src = FALLBACK_IMG; }
}, true);
window.addEventListener('hashchange', () => { state.modal = null; render(); });

migrateLegacy();
setLang(getLang());
render();
