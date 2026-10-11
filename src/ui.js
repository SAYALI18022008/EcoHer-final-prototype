import { t, getLang, LANGUAGES } from './i18n.js';
import { esc, inr, img } from './utils.js';
import { readScoped, KEYS } from './store.js';
import { currentUser } from './auth.js';
import { verificationFor, verificationLabel } from './catalog.js';

export function opts(list, selected = '', { placeholder = '', translate = true } = {}) {
  const items = list.map(x => `<option value="${esc(x)}" ${String(x) === String(selected) ? 'selected' : ''}>${esc(translate ? t(x) : x)}</option>`).join('');
  return (placeholder ? `<option value="">${esc(t(placeholder))}</option>` : '') + items;
}

export function field(name, label, type = 'text', a = {}) {
  const { value = '', hint = '', textarea = false, ...attrs } = a;
  const extra = Object.entries(attrs).map(([k, v]) => `${k}="${esc(k === 'placeholder' ? t(v) : v)}"`).join(' ');
  const input = textarea
    ? `<textarea id="f-${name}" name="${name}" rows="3" ${extra}>${esc(value)}</textarea>`
    : `<input id="f-${name}" name="${name}" type="${type}" value="${esc(value)}" ${extra}>`;
  return `<div class="form-control"><label for="f-${name}">${t(label)}</label>${input}${hint ? `<small class="hint">${t(hint)}</small>` : ''}</div>`;
}

export function selectField(name, label, list, { value = '', placeholder = '', translate = true } = {}) {
  return `<div class="form-control"><label for="f-${name}">${t(label)}</label><select id="f-${name}" name="${name}">${opts(list, value, { placeholder, translate })}</select></div>`;
}

export const prototypeNote = () => `<div class="proto-note" role="note">${t('Prototype notice: accounts are stored only in this browser (localStorage). This is not secure production authentication — do not reuse a real password.')}</div>`;

export const cartFor = userId => readScoped(KEYS.cart, userId, []).filter(i => i && i.productId && i.qty > 0);

export function nav() {
  const u = currentUser();
  const cartCount = u?.role === 'Customer' ? cartFor(u.id).reduce((s, i) => s + i.qty, 0) : 0;
  const lang = `<select class="lang-select" id="langSelect" data-change="setLanguage" aria-label="${t('Language')}">${LANGUAGES.map(l => `<option value="${l.code}" ${l.code === getLang() ? 'selected' : ''}>${l.label}</option>`).join('')}</select>`;
  const right = u
    ? `${u.role === 'Customer' ? `<a class="cart-link" href="#customer/cart" aria-label="${t('Cart')}">${t('Cart')} <span class="count" id="cartCount">${cartCount}</span></a>` : ''}<a class="btn outline small" href="#dashboard">${t('My dashboard')}</a><button class="btn small" data-action="logout">${t('Log out')}</button>`
    : `<a class="btn outline small" href="#login">${t('Log in')}</a><a class="btn small" href="#signup">${t('Join EcoHer')}</a>`;
  return `<header class="topbar"><a class="brand" href="#home"><span class="brandmark">e</span> ecoher</a>
  <nav class="navlinks" aria-label="${t('Main')}"><a href="#home">${t('Home')}</a><a href="#discover">${t('Marketplace')}</a><a href="#home" data-action="scrollHow">${t('How it works')}</a><a href="#mentorship">${t('Mentorship')}</a><a href="#impact">${t('Impact')}</a></nav>
  <div class="navright">${lang}${right}</div></header>`;
}

export function footer() {
  return `<footer class="footer"><a class="brand" href="#home"><span class="brandmark">e</span> ecoher</a><span>${t('Grow with purpose. Build with trust.')}</span><span>${t('Frontend prototype · data stays in this browser')} · <a class="link-light" href="/images/CREDITS.md" target="_blank" rel="noopener">${t('Image credits')}</a></span></footer>`;
}

export function badge(product) {
  const v = verificationFor(product);
  const cls = v.status === 'approved' ? 'gold' : v.status === 'not_submitted' ? 'none' : 'pending';
  return `<span class="badge ${cls}" title="${esc(t('Verification status'))}">${esc(t(verificationLabel(v.status)))}</span>`;
}

export const demoTag = () => `<span class="demo-tag">${t('Demo data')}</span>`;

export function stockText(stock) {
  const n = Number(stock) || 0;
  if (n < 1) return `<span class="stock out">${t('Out of stock')}</span>`;
  if (n <= 5) return `<span class="stock low">${t('Only {n} left', { n })}</span>`;
  return `<span class="stock">${t('{n} in stock', { n })}</span>`;
}

export function productCard(p, { favourite = false, showActions = true } = {}) {
  const b = p.business;
  return `<article class="product-card"><div class="product-img">${img(p.img || b.img, p.name)}${badge(p)}</div>
  <div class="product-body"><div class="business-loc">${esc(b.city)}, ${esc(b.state)} · ${esc(t(p.category))}</div>
  <h3>${esc(p.name)}</h3><div class="muted small">${t('by')} <a class="link" href="#business/${esc(b.id)}">${esc(b.name)}</a> ${p.demo ? demoTag() : ''}</div>
  <div class="price-row"><b>${inr(p.price)}</b>${stockText(p.stock)}</div>
  ${showActions ? `<div class="card-actions"><button class="btn outline small" data-action="viewProduct" data-id="${esc(p.id)}">${t('View Details')}</button><button class="btn small" data-action="addToCart" data-id="${esc(p.id)}" ${Number(p.stock) < 1 ? 'disabled' : ''}>${t('Add to Cart')}</button><button class="icon-btn ${favourite ? 'on' : ''}" data-action="toggleFavProduct" data-id="${esc(p.id)}" aria-pressed="${favourite}" aria-label="${t('Add to Favourites')}" title="${t('Add to Favourites')}">${favourite ? '♥' : '♡'}</button></div>` : ''}
  </div></article>`;
}

export function businessCard(b, { saved = false } = {}) {
  return `<article class="business-card"><div class="business-img">${img(b.img, `${b.founder} — ${b.name}`)}<span class="badge gold">${esc(t(b.type))}</span></div>
  <div class="business-body"><div class="business-loc">${esc(b.city)}, ${esc(b.state)} · ${esc(t(b.category))}</div><h3>${esc(b.name)}</h3>
  <div class="muted small">${t('Founded by')} ${esc(b.founder)} ${b.demo ? demoTag() : ''}</div><p>${b.statement ? `“${esc(b.statement)}”` : ''}</p>
  <div class="business-actions"><a class="textbtn" href="#business/${esc(b.id)}">${t('View business')} →</a><button class="icon-btn ${saved ? 'on' : ''}" data-action="toggleFavBusiness" data-id="${esc(b.id)}" aria-pressed="${saved}" aria-label="${t('Save business')}">${saved ? '♥' : '♡'}</button></div></div></article>`;
}

export function modalShell(title, body, { wide = false } = {}) {
  return `<div class="modal-backdrop" data-backdrop><div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><button class="close" data-action="closeModal" aria-label="${t('Close')}">×</button><h2 class="serif modal-title" id="modalTitle">${title}</h2>${body}</div></div>`;
}

export const empty = (msg, action = '') => `<div class="empty-state"><p>${t(msg)}</p>${action}</div>`;

export function dashTop(eyebrow, title, sub = '', actionsHtml = '') {
  return `<div class="dash-top"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div><div class="dash-actions">${actionsHtml}</div></div>`;
}

export function dashShell(role, tabs, active, content) {
  const u = currentUser();
  const route = role.toLowerCase();
  return `${nav()}<div class="dash-shell"><aside class="sidebar"><div class="side-label">${t(role + ' workspace')}</div>
  ${tabs.map(([id, label, icon]) => `<a class="side-link ${id === active ? 'selected' : ''}" href="#${route}/${id}"><span class="side-icon">${icon}</span>${t(label)}</a>`).join('')}
  <div class="side-spacer"></div><div class="side-user"><b>${esc(u?.name)}</b><small>${esc(u?.email)}</small></div><button class="side-link" data-action="logout"><span class="side-icon">↩</span>${t('Log out')}</button></aside>
  <main class="dash-main" id="dashContent">${content}</main>
  <nav class="mobile-nav" aria-label="${t('Dashboard')}">${tabs.slice(0, 5).map(([id, label, icon]) => `<a href="#${route}/${id}" class="${id === active ? 'on' : ''}"><span>${icon}</span><span>${t(label)}</span></a>`).join('')}</nav></div>`;
}
