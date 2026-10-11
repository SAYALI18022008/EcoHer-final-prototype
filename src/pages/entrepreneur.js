import { t } from '../i18n.js';
import { esc, inr, img, toast, uid, formData, showErrors, fmtDate, todayISO, readImageFile, isEmail, isMobile } from '../utils.js';
import { read, write, readScoped, writeScoped, KEYS } from '../store.js';
import { state, actions, modals, openModal, closeModal, rerender, go } from '../state.js';
import { currentUser, ensureBusiness, changePassword, accounts } from '../auth.js';
import { userProducts, verificationFor, verificationLabel, securityFor, allMentors, mentorMatch } from '../catalog.js';
import { BUSINESS_CATEGORIES, SUSTAINABILITY_TYPES, PACKAGING, END_OF_LIFE, EXPENSE_CATEGORIES, SALE_CATEGORIES, STATES, CITIES, EXPERTISE, LANGUAGE_OPTIONS } from '../data.js';
import { dashShell, dashTop, empty, field, selectField, opts, modalShell, badge, stockText, demoTag } from '../ui.js';
import { verificationPanel } from '../verification.js';
import { mentorFinder } from './public.js';
import { SUGGESTED, detectIntent, respond } from '../coach.js';

const TABS = [['overview', 'Overview', '◈'], ['business', 'Business profile', '⌂'], ['products', 'Products', '◇'], ['finance', 'Finance', '₹'], ['verification', 'Verification', '✓'], ['impact', 'Impact', '❋'], ['mentors', 'Mentors', '◎'], ['coach', 'AI Business Coach', '✦'], ['security', 'Security & privacy', '◍']];
const LANG_NAME = { en: 'English', hi: 'Hindi', mr: 'Marathi' };
const LOW_STOCK = 5;

const myBusiness = u => read(KEYS.businesses, {})[u.id] || ensureBusiness(u.id, u);
const txFor = u => readScoped(KEYS.finance, u.id, []).filter(x => x && x.id && ['sale', 'expense'].includes(x.type));
function totals(list) {
  const revenue = list.filter(x => x.type === 'sale').reduce((s, x) => s + Number(x.amount), 0);
  const expenses = list.filter(x => x.type === 'expense').reduce((s, x) => s + Number(x.amount), 0);
  return { revenue, expenses, profit: revenue - expenses };
}
const lowStock = products => products.filter(p => Number(p.stock) <= LOW_STOCK);
const unverifiedCount = products => products.filter(p => verificationFor(p).status === 'not_submitted').length;

export function entrepreneurDashboard(tab) {
  const u = currentUser();
  const active = TABS.some(x => x[0] === tab) ? tab : 'overview';
  const views = { overview, business, products, finance, verification, impact, mentors, coach, security };
  return dashShell('Entrepreneur', TABS, active, views[active](u));
}

function lowStockWarnings(products) {
  const low = lowStock(products);
  return low.map(p => `<div class="warn">${Number(p.stock) < 1 ? t('{product} is out of stock.', { product: esc(p.name) }) : t('Low stock: {product} has only {n} left.', { product: esc(p.name), n: p.stock })}</div>`).join('');
}

function interest(u, b, products) {
  const ids = new Set(products.map(p => p.id));
  const favs = read(KEYS.favourites, {});
  let favProducts = 0, savedBiz = 0;
  Object.values(favs).forEach(f => { if (!f) return; favProducts += (f.products || []).filter(id => ids.has(id)).length; if ((f.businesses || []).includes(b.id)) savedBiz += 1; });
  let units = 0;
  Object.values(read(KEYS.orders, {})).forEach(list => (Array.isArray(list) ? list : []).forEach(o => (o.items || []).forEach(i => { if (ids.has(i.productId)) units += i.qty; })));
  const blocked = securityFor(u.id).blocked.map(x => x.email.toLowerCase());
  const messages = read(KEYS.messages, []).filter(m => m && m.businessId === b.id && !blocked.includes(String(m.fromEmail).toLowerCase()));
  return { favProducts, savedBiz, units, messages };
}

function overview(u) {
  const b = myBusiness(u);
  const products = userProducts(u.id);
  const tot = totals(txFor(u));
  const i = interest(u, b, products);
  const top = allMentors().map(m => ({ m, s: mentorMatch(m, { city: u.city, language: LANG_NAME[u.language] }) })).sort((a, c) => c.s.score - a.s.score).slice(0, 2);
  return `${dashTop(t('Entrepreneur workspace'), esc(b.name), t('Welcome back, {name}. Here is your business at a glance.', { name: esc(u.name.split(' ')[0]) }), `<button class="btn small" data-action="newProduct">+ ${t('Add product')}</button>`)}
  <div class="stat-grid"><div class="stat"><label>${t('Total revenue')}</label><strong id="statRevenue">${inr(tot.revenue)}</strong><small>${t('From your sale records')}</small></div><div class="stat"><label>${t('Total expenses')}</label><strong>${inr(tot.expenses)}</strong><small>${t('From your expense records')}</small></div><div class="stat"><label>${t('Estimated profit')}</label><strong id="statProfit">${inr(tot.profit)}</strong><small>${t('Revenue − expenses')}</small></div><div class="stat"><label>${t('Products')}</label><strong>${products.length}</strong><small>${t('{n} low on stock', { n: lowStock(products).length })}</small></div></div>
  ${lowStockWarnings(products)}
  <div class="dash-grid"><div class="panel"><div class="panel-head"><h3>${t('Product verification')}</h3><a class="link small" href="#entrepreneur/verification">${t('Open')}</a></div>
    ${products.length ? products.map(p => `<div class="list-row"><div><h4>${esc(p.name)}</h4><p>${inr(p.price)} · ${stockText(p.stock)}</p></div>${badge(p)}</div>`).join('') : empty('You have not added any products yet.', `<button class="btn small" data-action="newProduct">${t('Add your first product')}</button>`)}</div>
  <div class="panel"><h3>${t('Customer interest')}</h3><div class="info-list"><div><span>${t('Times your products were favourited')}</span><b>${i.favProducts}</b></div><div><span>${t('Customers who saved your business')}</span><b>${i.savedBiz}</b></div><div><span>${t('Units in demo orders')}</span><b>${i.units}</b></div><div><span>${t('Messages')}</span><b>${i.messages.length}</b></div></div>
    ${i.messages.slice(-3).reverse().map(m => `<div class="rec"><span><b>${esc(m.fromName)}</b>: ${esc(m.text)}</span><small class="muted">${fmtDate(m.at)}</small></div>`).join('')}
    <p class="small muted">${t('Counts come from activity in this browser only.')}</p></div></div>
  <div class="dash-grid" style="margin-top:14px"><div class="panel"><h3>${t('Recommended mentors')}</h3>${top.map(({ m, s }) => `<div class="mentor-card"><div class="mentor-avatar initials">${esc(m.name.charAt(0))}</div><div><b>${esc(m.name)}</b><p>${esc(m.city)} · ${m.expertise.map(x => esc(t(x))).join(', ')}</p><p>${s.reasons.map(r => t(r)).join(' · ')}</p></div><button class="btn small" data-action="requestMentor" data-id="${esc(m.id)}">${t('Request')}</button></div>`).join('')}</div>
  <div class="panel verified-panel"><div><div class="eyebrow" style="color:#d8c78d">${t('EcoHer AI Business Coach')}</div><h3>${t('Ask for practical advice')}</h3><p>${t('Rule-based tips that use your saved products, prices, stock and finance records.')}</p><a class="btn gold small" style="margin-top:12px;display:inline-block" href="#entrepreneur/coach">${t('Open coach')}</a></div></div></div>`;
}

function business(u) {
  const b = myBusiness(u);
  return `${dashTop(t('Entrepreneur workspace'), t('Business profile'), t('This information appears on your public business page.'), `<a class="btn outline small" href="#business/${esc(b.id)}">${t('View public profile')}</a>`)}
  <form class="panel" data-submit="saveBusiness" novalidate><div class="form-grid">
  ${field('name', 'Business name', 'text', { value: b.name })}${field('founder', 'Founder name', 'text', { value: b.founder })}
  ${selectField('category', 'Business category', BUSINESS_CATEGORIES, { value: b.category })}${selectField('type', 'Sustainability category', SUSTAINABILITY_TYPES, { value: b.type })}
  ${selectField('city', 'City', CITIES, { value: b.city, translate: false })}${selectField('state', 'State', STATES, { value: b.state, translate: false })}
  ${field('location', 'Business location', 'text', { value: b.location })}${field('women', 'Women employed or supported', 'number', { value: b.women, min: 0 })}
  ${field('contactEmail', 'Business contact email', 'email', { value: b.contactEmail })}${field('contactPhone', 'Business contact number', 'tel', { value: b.contactPhone })}</div>
  ${field('statement', 'One-line description', 'text', { value: b.statement, maxlength: 120 })}${field('story', 'Business story', 'text', { textarea: true, value: b.story })}
  <div class="form-grid">${field('materials', 'Materials', 'text', { value: b.materials })}${field('method', 'Production methods', 'text', { value: b.method })}</div>
  ${field('packaging', 'Sustainable packaging details', 'text', { value: b.packaging })}
  <div class="form-grid">${field('image', 'Business image', 'file', { accept: 'image/*' })}${field('imageUrl', 'or image URL', 'url', { value: b.img && !b.img.startsWith('data:') ? b.img : '' })}</div>
  ${b.img ? `<div style="max-width:220px">${img(b.img, b.name)}</div>` : ''}
  <div class="form-actions"><button class="btn" type="submit">${t('Save business profile')}</button></div></form>`;
}

function products(u) {
  const list = userProducts(u.id);
  return `${dashTop(t('Entrepreneur workspace'), t('Products'), t('Add, edit and remove products. Each new product opens the sustainability verification form.'), `<button class="btn small" data-action="newProduct">+ ${t('Add product')}</button>`)}
  ${lowStockWarnings(list)}
  ${list.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th></th><th>${t('Product')}</th><th>${t('Category')}</th><th class="num">${t('Price')}</th><th>${t('Stock')}</th><th>${t('Verification')}</th><th></th></tr></thead><tbody>
  ${list.map(p => `<tr><td style="width:60px">${img(p.img, p.name, 'thumb')}</td><td><b>${esc(p.name)}</b><div class="small muted">${esc(p.materials)}</div></td><td>${esc(t(p.category))}</td><td class="num">${inr(p.price)}</td><td>${stockText(p.stock)}</td><td>${badge(p)}</td>
  <td><div class="row-actions"><button class="btn outline small" data-action="editProduct" data-id="${esc(p.id)}">${t('Edit')}</button><button class="btn outline small" data-action="openVerify" data-id="${esc(p.id)}">${t('Verify')}</button><button class="btn danger small" data-action="deleteProduct" data-id="${esc(p.id)}">${t('Delete')}</button></div></td></tr>`).join('')}</tbody></table></div>`
    : empty('You have not added any products yet.', `<button class="btn small" data-action="newProduct">${t('Add your first product')}</button>`)}`;
}

modals.productForm = ({ id }) => {
  const u = currentUser();
  const p = (id && userProducts(u.id).find(x => x.id === id)) || {};
  return modalShell(id ? t('Edit product') : t('Add product'), `<form data-submit="saveProduct" data-id="${esc(id || '')}" novalidate>
  <div class="form-grid">${field('name', 'Product name', 'text', { value: p.name || '' })}${selectField('category', 'Category', BUSINESS_CATEGORIES, { value: p.category, placeholder: 'Select category' })}
  ${field('price', 'Price (₹)', 'number', { value: p.price ?? '', min: 1, step: '0.01' })}${field('stock', 'Stock quantity', 'number', { value: p.stock ?? '', min: 0, step: 1 })}</div>
  ${field('description', 'Description', 'text', { textarea: true, value: p.description || '' })}
  <div class="form-grid">${field('materials', 'Materials', 'text', { value: p.materials || '' })}${field('method', 'Production method', 'text', { value: p.method || '' })}
  ${selectField('packaging', 'Packaging type', PACKAGING, { value: p.packaging, placeholder: 'Select' })}${selectField('endOfLife', 'Reusable / recyclable information', END_OF_LIFE, { value: p.endOfLife, placeholder: 'Select' })}</div>
  ${field('evidence', 'Sustainability evidence or explanation', 'text', { textarea: true, value: p.evidence || '' })}
  <div class="form-grid">${field('image', 'Product image', 'file', { accept: 'image/*' })}${field('imageUrl', 'or image URL', 'url', { value: p.img && !String(p.img).startsWith('data:') ? p.img : '' })}</div>
  <div class="form-actions"><button type="button" class="btn outline" data-action="closeModal">${t('Cancel')}</button><button class="btn" type="submit">${id ? t('Save changes') : t('Save and continue to verification')}</button></div></form>`, { wide: true });
};

function finance(u) {
  const list = txFor(u).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const tot = totals(list);
  return `${dashTop(t('Entrepreneur workspace'), t('Sales & expenses'), t('Record every sale and expense. Totals update immediately.'))}
  <div class="stat-grid"><div class="stat"><label>${t('Total revenue')}</label><strong id="finRevenue">${inr(tot.revenue)}</strong></div><div class="stat"><label>${t('Total expenses')}</label><strong id="finExpenses">${inr(tot.expenses)}</strong></div><div class="stat"><label>${t('Estimated profit')}</label><strong id="finProfit">${inr(tot.profit)}</strong><small>${t('Revenue − expenses')}</small></div><div class="stat"><label>${t('Transactions')}</label><strong>${list.length}</strong></div></div>
  ${lowStockWarnings(userProducts(u.id))}
  <div class="dash-grid"><div class="panel"><h3>${t('Add a transaction')}</h3>${txForm({})}</div><div class="panel"><h3>${t('Revenue and expenses by month')}</h3>${chart(list)}</div></div>
  <div class="panel" style="margin-top:14px"><h3>${t('Transaction history')}</h3>${list.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>${t('Date')}</th><th>${t('Type')}</th><th>${t('Description')}</th><th>${t('Category')}</th><th class="num">${t('Amount')}</th><th></th></tr></thead><tbody>
  ${list.map(x => `<tr><td>${fmtDate(x.date)}</td><td>${t(x.type === 'sale' ? 'Sale' : 'Expense')}</td><td>${esc(x.description)}${x.type === 'sale' && x.units ? ` <span class="muted small">(${t('{n} units', { n: x.units })})</span>` : ''}</td><td>${esc(t(x.category))}</td><td class="num ${x.type === 'sale' ? 'amount-sale' : 'amount-expense'}">${x.type === 'sale' ? '+' : '−'}${inr(x.amount)}</td>
  <td><div class="row-actions"><button class="btn outline small" data-action="editTx" data-id="${esc(x.id)}">${t('Edit')}</button><button class="btn danger small" data-action="deleteTx" data-id="${esc(x.id)}">${t('Delete')}</button></div></td></tr>`).join('')}</tbody></table></div>` : empty('No transactions yet. Add your first sale or expense above.')}</div>`;
}

function txForm(x) {
  const type = x.type || 'sale';
  return `<form data-submit="saveTx" data-id="${esc(x.id || '')}" novalidate><div class="form-grid">
  <div class="form-control"><label for="f-type">${t('Type')}</label><select id="f-type" name="type"><option value="sale" ${type === 'sale' ? 'selected' : ''}>${t('Sale')}</option><option value="expense" ${type === 'expense' ? 'selected' : ''}>${t('Expense')}</option></select></div>
  <div class="form-control"><label for="f-category">${t('Category')}</label><select id="f-category" name="category">${opts([...SALE_CATEGORIES, ...EXPENSE_CATEGORIES.filter(c => c !== 'Other')], x.category, { placeholder: 'Select category' })}</select></div>
  ${field('amount', 'Amount (₹)', 'number', { value: x.amount ?? '', min: 1, step: '0.01' })}${field('date', 'Date', 'date', { value: x.date || todayISO(), max: todayISO() })}</div>
  ${field('description', 'Description', 'text', { value: x.description || '' })}${field('units', 'Units sold (sales only)', 'number', { value: x.units ?? '', min: 0, step: 1 })}
  <div class="form-actions"><button class="btn" type="submit">${x.id ? t('Save changes') : t('Add transaction')}</button></div></form>`;
}

modals.txForm = ({ id }) => {
  const x = txFor(currentUser()).find(r => r.id === id);
  return x ? modalShell(t('Edit transaction'), txForm(x)) : modalShell(t('Not found'), '');
};

function chart(list) {
  if (!list.length) return empty('Your chart will appear after you add transactions.');
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) { const d = new Date(now.getFullYear(), now.getMonth() - i, 1); months.push({ key: d.toISOString().slice(0, 7), label: d.toLocaleDateString('en-IN', { month: 'short' }), rev: 0, exp: 0 }); }
  list.forEach(x => { const m = months.find(m => m.key === String(x.date).slice(0, 7)); if (m) m[x.type === 'sale' ? 'rev' : 'exp'] += Number(x.amount); });
  const max = Math.max(1, ...months.flatMap(m => [m.rev, m.exp]));
  return `<div class="bar-chart" role="img" aria-label="${t('Revenue and expenses by month')}">${months.map(m => `<div class="bar-group"><div class="bar-pair"><div class="bar rev" style="height:${(m.rev / max) * 100}%" title="${t('Revenue')} ${inr(m.rev)}"></div><div class="bar exp" style="height:${(m.exp / max) * 100}%" title="${t('Expenses')} ${inr(m.exp)}"></div></div><small>${m.label}</small></div>`).join('')}</div>
  <div class="legend"><span><i style="background:var(--forest-light)"></i>${t('Revenue')}</span><span><i style="background:var(--gold)"></i>${t('Expenses')}</span><span>${t('Last 6 months')}</span></div>`;
}

function verification(u) {
  const list = userProducts(u.id);
  return `${dashTop(t('Entrepreneur workspace'), t('Product verification'), t('See what you have provided and what remains unverified for each product.'))}
  <p class="proto-note">${t('Prototype review simulation: there is no real reviewer. Use the demo buttons to move a submission through each stage. Approval is only possible after the earlier stages and an explicit confirmation.')}</p>
  ${list.length ? list.map(p => { const v = verificationFor(p); return `<div class="panel" style="margin-bottom:12px"><div class="panel-head"><div><h3 style="margin:0">${esc(p.name)}</h3><span class="small muted">${t('Current status')}: <b data-status="${esc(v.status)}">${t(verificationLabel(v.status))}</b></span></div>${badge(p)}</div>${verificationPanel(p)}
  <div class="form-actions" style="justify-content:flex-start">${v.status === 'not_submitted' ? `<button class="btn small" data-action="openVerify" data-id="${esc(p.id)}">${t('Submit verification information')}</button>` : `<button class="btn outline small" data-action="openVerify" data-id="${esc(p.id)}">${t('Update information')}</button>`}
  ${['basic_pending', 'community_pending'].includes(v.status) ? `<button class="btn outline small" data-action="advanceReview" data-id="${esc(p.id)}">${t('Simulate next review stage')}</button>` : ''}
  ${v.status === 'partner_pending' ? `<button class="btn gold small" data-action="approveReview" data-id="${esc(p.id)}">${t('Mark demo review approved')}</button>` : ''}</div></div>`; }).join('') : empty('You have not added any products yet.', `<button class="btn small" data-action="newProduct">${t('Add your first product')}</button>`)}`;
}

function impact(u) {
  const b = myBusiness(u);
  const rec = readScoped(KEYS.impact, u.id, {});
  const sold = txFor(u).filter(x => x.type === 'sale').reduce((s, x) => s + (Number(x.units) || 0), 0);
  const val = (v, unit) => (v === undefined || v === '' || v === null ? `<strong>—</strong><small>${t('Not recorded yet')}</small>` : `<strong>${esc(v)} ${unit}</strong>`);
  return `${dashTop(t('Entrepreneur workspace'), t('Impact'), t('Share only what you can back up. Every number here comes from your own records.'))}
  <div class="impact-grid">
  <div class="impact-box">${val(sold || '', t('units'))}<small>${t('Products sold · calculated from units in your sale records')}</small></div>
  <div class="impact-box">${val(rec.packaging, t('units'))}<small>${t('Reusable packaging units · recorded by you')}</small></div>
  <div class="impact-box">${val(rec.wasteKg, 'kg')}<small>${t('Waste reused · estimated by you')}</small></div>
  <div class="impact-box">${val(b.women, t('women'))}<small>${t('Women employed or supported · from your business profile')}</small></div>
  <div class="impact-box">${val(rec.suppliers, t('suppliers'))}<small>${t('Local suppliers supported · recorded by you')}</small></div></div>
  <p class="small muted" style="margin:12px 0">${t('Waste reused is an estimate: number of products × approximate material weight per product. EcoHer does not show carbon-saving figures because there is no verified calculation method in this prototype.')}</p>
  <form class="panel" data-submit="saveImpact" novalidate><h3>${t('Update impact records')}</h3><div class="form-grid">${field('packaging', 'Reusable packaging units', 'number', { value: rec.packaging ?? '', min: 0, step: 1 })}${field('wasteKg', 'Waste reused (kg, estimated)', 'number', { value: rec.wasteKg ?? '', min: 0, step: '0.1' })}${field('suppliers', 'Local suppliers supported', 'number', { value: rec.suppliers ?? '', min: 0, step: 1 })}</div>
  ${field('method', 'How did you calculate these numbers?', 'text', { textarea: true, value: rec.method || '' })}<div class="form-actions"><button class="btn" type="submit">${t('Save impact records')}</button></div></form>`;
}

function mentors(u) {
  if (!state.mentorFiltersInit) { state.mentorFilters = { ...state.mentorFilters, city: u.city, language: LANG_NAME[u.language] || '' }; state.mentorFiltersInit = true; }
  const mine = read(KEYS.mentorRequests, []).filter(r => r && r.entrepreneurId === u.id);
  return `${dashTop(t('Entrepreneur workspace'), t('Find a mentor'), t('Matches consider expertise, city, language and availability.'))}
  <div class="panel" style="margin-bottom:14px"><h3>${t('My mentorship requests')}</h3>${mine.length ? mine.map(r => `<div class="list-row"><div><h4>${esc(r.mentorName)}</h4><p>${esc(t(r.goal))} · ${fmtDate(r.createdAt)}</p></div><span class="status ${esc(r.status)}">${t({ pending: 'Pending', accepted: 'Accepted', rejected: 'Declined' }[r.status])}</span></div>`).join('') : `<p class="small muted">${t('You have not requested a mentor yet.')}</p>`}</div>
  ${mentorFinder()}`;
}

modals.mentorRequest = ({ mentorId }) => {
  const m = allMentors().find(x => x.id === mentorId);
  const u = currentUser();
  if (!m) return modalShell(t('Not found'), '');
  return modalShell(t('Request mentorship from {name}', { name: esc(m.name) }), `<form data-submit="sendMentorRequest" data-id="${esc(m.id)}" novalidate>
  ${selectField('goal', 'What do you need help with?', EXPERTISE, { value: state.mentorFilters.expertise || m.expertise[0], placeholder: 'Select' })}
  ${selectField('language', 'Preferred language', LANGUAGE_OPTIONS, { value: LANG_NAME[u.language] })}
  ${field('message', 'Message', 'text', { textarea: true, maxlength: 500 })}
  ${m.demo ? `<p class="proto-note">${t('This is a demo mentor. The request is saved, but no real person will reply.')}</p>` : ''}
  <div class="form-actions"><button class="btn" type="submit">${t('Send request')}</button></div></form>`);
};

function coach(u) {
  const chat = readScoped(KEYS.chat, u.id, []);
  return `${dashTop(t('Entrepreneur workspace'), t('EcoHer AI Business Coach'), t('Rule-based prototype assistant. It runs in your browser, uses your saved business data, and is not a connected AI model.'))}
  <div class="chat"><div class="chat-head"><b>${t('EcoHer AI Business Coach')}</b><button class="btn outline small" data-action="coachClear" ${chat.length ? '' : 'disabled'}>${t('Clear chat')}</button></div>
  <div class="chat-log" id="chatLog" aria-live="polite">${chat.length ? chat.map(m => `<div class="msg ${m.role === 'user' ? 'user' : 'assistant'}">${esc(m.text)}</div>`).join('') : `<div class="msg assistant">${t('Namaste! Ask me a question about your business, or pick a suggestion below.')}</div>`}
  ${state.coachThinking ? `<div class="msg assistant thinking">${t('Thinking…')}</div>` : ''}${state.coachError ? `<div class="msg assistant" role="alert">${t(state.coachError)}</div>` : ''}</div>
  <form class="chat-form" data-submit="coachAsk" novalidate><input name="question" id="coachInput" placeholder="${t('Type your question…')}" aria-label="${t('Type your question…')}" maxlength="300" autocomplete="off"><button class="btn" type="submit" ${state.coachThinking ? 'disabled' : ''}>${t('Send')}</button></form></div>
  <div class="suggestions">${SUGGESTED.map(([intent, q]) => `<button class="chip" data-action="coachSuggest" data-intent="${intent}">${t(q)}</button>`).join('')}</div>`;
}

function askCoach(u, text, intent) {
  const key = u.id;
  const chat = readScoped(KEYS.chat, key, []);
  chat.push({ role: 'user', text, at: new Date().toISOString() });
  writeScoped(KEYS.chat, key, chat);
  state.coachThinking = true;
  state.coachError = '';
  rerender({ keepScroll: true });
  setTimeout(() => {
    try {
      const products = userProducts(u.id);
      const fin = txFor(u);
      const reply = respond(intent || detectIntent(text), { business: myBusiness(u), products, finance: fin, totals: totals(fin), lowStock: lowStock(products), unverified: unverifiedCount(products) });
      writeScoped(KEYS.chat, key, [...readScoped(KEYS.chat, key, []), { role: 'assistant', text: reply, at: new Date().toISOString() }]);
    } catch (err) {
      console.error(err);
      state.coachError = 'The coach could not answer right now. Please try again.';
    }
    state.coachThinking = false;
    if (location.hash === '#entrepreneur/coach') rerender({ keepScroll: true });
  }, 450);
}

function security(u) {
  const s = securityFor(u.id);
  const toggle = (key, label, help) => `<div class="toggle-row"><div><b>${t(label)}</b><p>${t(help)}</p></div><input type="checkbox" data-change="secToggle" data-key="${key}" ${s[key] ? 'checked' : ''} aria-label="${t(label)}"></div>`;
  return `${dashTop(t('Entrepreneur workspace'), t('Security & privacy'), t('Control what customers can see. Settings are saved in this browser.'))}
  <p class="proto-note">${t('Prototype limits: data is stored unencrypted in this browser’s localStorage. There is no server-side security, identity verification, moderation team or emergency response in this prototype.')}</p>
  <div class="dash-grid"><div class="panel"><h3>${t('Privacy settings')}</h3>
  ${toggle('profileVisible', 'Public business profile', 'When off, your business and products are hidden from the marketplace.')}
  ${toggle('hideMobile', 'Hide personal mobile number', 'Your registration mobile number is never shown publicly while this is on.')}
  ${toggle('hideEmail', 'Hide personal email', 'Your login email is never shown publicly while this is on.')}
  <div class="toggle-row"><div><b>${t('Public business contact preference')}</b><p>${t('Choose how customers can reach you.')}</p></div><select data-change="secContact" aria-label="${t('Public business contact preference')}">${[['business', 'Show business contact details'], ['message', 'EcoHer messages only'], ['none', 'Do not accept contact']].map(([v, l]) => `<option value="${v}" ${s.publicContact === v ? 'selected' : ''}>${t(l)}</option>`).join('')}</select></div>
  <h4 style="margin-top:18px">${t('What is public and what is private?')}</h4><ul class="small muted" style="line-height:1.8"><li>${t('Public: business name, story, city, products, verification status and the contact option you choose.')}</li><li>${t('Private: your password, finance records, AI chat, blocked list, reports and hidden personal details.')}</li></ul></div>
  <div class="panel"><h3>${t('Session information')}</h3><div class="info-list"><div><span>${t('Signed in as')}</span><b>${esc(u.email)}</b></div><div><span>${t('Session started')}</span><b>${esc(new Date(u.session.startedAt).toLocaleString('en-IN'))}</b></div><div><span>${t('Browser')}</span><b class="small">${esc(u.session.userAgent || '—')}</b></div><div><span>${t('Storage')}</span><b>${t('This browser only')}</b></div></div>
  <button class="btn outline small" style="margin-top:12px" data-action="logout">${t('Log out')}</button>
  <h4 style="margin-top:20px">${t('Change password')}</h4><form data-submit="changePassword" novalidate>${field('current', 'Current password', 'password', { autocomplete: 'current-password' })}${field('next', 'New password', 'password', { autocomplete: 'new-password' })}<button class="btn small" type="submit">${t('Update password')}</button></form></div></div>
  <div class="dash-grid" style="margin-top:14px"><div class="panel"><h3>${t('Blocked users')}</h3>${s.blocked.length ? s.blocked.map((x, i) => `<div class="list-row"><div><h4>${esc(x.email)}</h4><p>${esc(x.reason)} · ${fmtDate(x.at)}</p></div><button class="btn outline small" data-action="unblock" data-index="${i}">${t('Unblock')}</button></div>`).join('') : `<p class="small muted">${t('You have not blocked anyone.')}</p>`}
  <form data-submit="blockUser" novalidate>${field('email', 'Email of user to block', 'email')}${field('reason', 'Reason', 'text')}<button class="btn danger small" type="submit">${t('Block user')}</button></form></div>
  <div class="panel"><h3>${t('Report suspicious activity')}</h3>${s.reports.length ? s.reports.map(r => `<div class="rec"><span><b>${esc(r.subject)}</b> — ${esc(r.details)}</span><small class="muted">${fmtDate(r.at)}</small></div>`).join('') : ''}
  <form data-submit="reportActivity" novalidate>${field('subject', 'What happened?', 'text')}${field('details', 'Details', 'text', { textarea: true })}<p class="small muted">${t('Reports are saved in this browser only. They are not sent to a moderation team in this prototype.')}</p><button class="btn small" type="submit">${t('Save report')}</button></form></div></div>`;
}

function saveSecurity(u, patch) {
  writeScoped(KEYS.security, u.id, { ...securityFor(u.id), ...patch });
}

function needEntrepreneur() {
  const u = currentUser();
  if (u?.role === 'Entrepreneur') return u;
  toast(u ? 'This action is only available to entrepreneurs.' : 'Log in as an entrepreneur to continue.');
  if (!u) go('login');
  return null;
}

const num = v => (v === '' || v === undefined ? NaN : Number(v));

Object.assign(actions, {
  newProduct() { if (needEntrepreneur()) openModal('productForm', {}); },
  editProduct(el) { if (needEntrepreneur()) openModal('productForm', { id: el.dataset.id }); },
  async saveProduct(form) {
    const u = needEntrepreneur();
    if (!u) return;
    const d = formData(form);
    const errors = {};
    for (const k of ['name', 'category', 'description', 'materials', 'packaging', 'endOfLife']) if (!d[k]) errors[k] = 'This field is required.';
    const price = num(d.price), stock = num(d.stock);
    if (!Number.isFinite(price) || price <= 0 || price > 10000000) errors.price = 'Enter a price greater than ₹0.';
    if (!Number.isInteger(stock) || stock < 0 || stock > 100000) errors.stock = 'Enter a whole number of 0 or more.';
    if (d.imageUrl && !/^https?:\/\//i.test(d.imageUrl)) errors.imageUrl = 'Enter a web address starting with http:// or https://';
    if (!showErrors(form, errors)) return;
    let image = '';
    try { image = await readImageFile(form.querySelector('[name=image]').files[0]); } catch (e) { return showErrors(form, { image: e.message }); }
    const list = userProducts(u.id);
    const id = form.dataset.id;
    const existing = id && list.find(p => p.id === id);
    const b = myBusiness(u);
    const record = { name: d.name, category: d.category, description: d.description, price, stock, materials: d.materials, method: d.method, packaging: d.packaging, endOfLife: d.endOfLife, evidence: d.evidence, img: image || d.imageUrl || existing?.img || '' };
    if (existing) Object.assign(existing, record, { updatedAt: new Date().toISOString() });
    else list.push({ id: uid('prod'), ownerId: u.id, businessId: b.id, createdAt: new Date().toISOString(), ...record });
    if (!writeScoped(KEYS.products, u.id, list)) return toast('Could not save. Browser storage may be full — try a smaller image.');
    if (existing) { closeModal(); toast('Product updated.'); }
    else { toast('Product added. Now complete the sustainability verification.'); openModal('verify', { productId: list[list.length - 1].id }); }
  },
  deleteProduct(el) {
    const u = needEntrepreneur();
    if (!u) return;
    const p = userProducts(u.id).find(x => x.id === el.dataset.id);
    if (!p || !confirm(t('Delete “{product}”? This cannot be undone.', { product: p.name }))) return;
    writeScoped(KEYS.products, u.id, userProducts(u.id).filter(x => x.id !== p.id));
    const v = read(KEYS.verifications, {}); delete v[p.id]; write(KEYS.verifications, v);
    toast('Product deleted.');
    rerender({ keepScroll: true });
  },
  async saveBusiness(form) {
    const u = needEntrepreneur();
    if (!u) return;
    const d = formData(form);
    const errors = {};
    for (const k of ['name', 'founder', 'category', 'type', 'city', 'state']) if (!d[k]) errors[k] = 'This field is required.';
    if (d.contactEmail && !isEmail(d.contactEmail)) errors.contactEmail = 'Enter a valid email address.';
    if (d.contactPhone && !isMobile(d.contactPhone)) errors.contactPhone = 'Enter a valid 10-digit Indian mobile number.';
    if (d.women && (!Number.isInteger(Number(d.women)) || Number(d.women) < 0)) errors.women = 'Enter a whole number of 0 or more.';
    if (d.imageUrl && !/^https?:\/\//i.test(d.imageUrl)) errors.imageUrl = 'Enter a web address starting with http:// or https://';
    if (!showErrors(form, errors)) return;
    let image = '';
    try { image = await readImageFile(form.querySelector('[name=image]').files[0]); } catch (e) { return showErrors(form, { image: e.message }); }
    const all = read(KEYS.businesses, {});
    const b = myBusiness(u);
    const { image: _i, imageUrl, ...rest } = d;
    all[u.id] = { ...b, ...rest, img: image || imageUrl || (b.img?.startsWith('data:') ? b.img : '') };
    if (!write(KEYS.businesses, all)) return toast('Could not save. Browser storage may be full — try a smaller image.');
    toast('Business profile saved.');
    rerender({ keepScroll: true });
  },
  saveTx(form) {
    const u = needEntrepreneur();
    if (!u) return;
    const d = formData(form);
    const errors = {};
    const amount = num(d.amount);
    if (!['sale', 'expense'].includes(d.type)) errors.type = 'This field is required.';
    if (!d.category) errors.category = 'This field is required.';
    if (!d.description) errors.description = 'This field is required.';
    if (!Number.isFinite(amount) || amount <= 0) errors.amount = 'Enter an amount greater than ₹0.';
    else if (amount > 10000000) errors.amount = 'Amount looks too large. Check the number.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date || '')) errors.date = 'This field is required.';
    else if (d.date > todayISO()) errors.date = 'Date cannot be in the future.';
    if (d.units !== '' && (!Number.isInteger(Number(d.units)) || Number(d.units) < 0)) errors.units = 'Enter a whole number of 0 or more.';
    if (!showErrors(form, errors)) return;
    const list = txFor(u);
    const rec = { type: d.type, category: d.category, description: d.description, amount: Math.round(amount * 100) / 100, date: d.date, units: d.type === 'sale' && d.units !== '' ? Number(d.units) : 0 };
    const existing = form.dataset.id && list.find(x => x.id === form.dataset.id);
    if (existing) Object.assign(existing, rec); else list.push({ id: uid('tx'), ...rec });
    writeScoped(KEYS.finance, u.id, list);
    toast(existing ? 'Transaction updated.' : d.type === 'sale' ? 'Sale recorded.' : 'Expense recorded.');
    if (state.modal) closeModal(); else rerender({ keepScroll: true });
  },
  editTx(el) { if (needEntrepreneur()) openModal('txForm', { id: el.dataset.id }); },
  deleteTx(el) {
    const u = needEntrepreneur();
    if (!u || !confirm(t('Delete this transaction?'))) return;
    writeScoped(KEYS.finance, u.id, txFor(u).filter(x => x.id !== el.dataset.id));
    toast('Transaction deleted.');
    rerender({ keepScroll: true });
  },
  saveImpact(form) {
    const u = needEntrepreneur();
    if (!u) return;
    const d = formData(form);
    const errors = {};
    for (const k of ['packaging', 'wasteKg', 'suppliers']) if (d[k] !== '' && (!Number.isFinite(Number(d[k])) || Number(d[k]) < 0)) errors[k] = 'Enter a number of 0 or more.';
    if (!showErrors(form, errors)) return;
    writeScoped(KEYS.impact, u.id, { packaging: d.packaging, wasteKg: d.wasteKg, suppliers: d.suppliers, method: d.method, updatedAt: new Date().toISOString() });
    toast('Impact records saved.');
    rerender({ keepScroll: true });
  },
  requestMentor(el) {
    const u = currentUser();
    if (u?.role !== 'Entrepreneur') { toast('Log in as an entrepreneur to request a mentor.'); if (!u) go('login'); return; }
    openModal('mentorRequest', { mentorId: el.dataset.id });
  },
  sendMentorRequest(form) {
    const u = needEntrepreneur();
    if (!u) return;
    const d = formData(form);
    const errors = {};
    if (!d.goal) errors.goal = 'This field is required.';
    if (!d.message) errors.message = 'This field is required.';
    if (!showErrors(form, errors)) return;
    const m = allMentors().find(x => x.id === form.dataset.id);
    const all = read(KEYS.mentorRequests, []);
    if (all.some(r => r && r.entrepreneurId === u.id && r.mentorId === m.id && r.status === 'pending')) { closeModal(); return toast('You already have a pending request with this mentor.'); }
    const b = myBusiness(u);
    all.push({ id: uid('req'), entrepreneurId: u.id, entrepreneurName: u.name, businessName: b.name, mentorId: m.id, mentorName: m.name, city: u.city, language: d.language, goal: d.goal, message: d.message, status: 'pending', notes: [], createdAt: new Date().toISOString() });
    write(KEYS.mentorRequests, all);
    closeModal();
    toast('Mentorship request sent to {name}.', { name: m.name });
  },
  coachAsk(form) {
    const u = needEntrepreneur();
    const q = form.question.value.trim();
    if (!u || state.coachThinking) return;
    if (!q) return toast('Type a question first.');
    askCoach(u, q);
  },
  coachSuggest(el) {
    const u = needEntrepreneur();
    if (!u || state.coachThinking) return;
    askCoach(u, el.textContent.trim(), el.dataset.intent);
  },
  coachClear() {
    const u = needEntrepreneur();
    if (!u || !confirm(t('Clear the whole chat history?'))) return;
    writeScoped(KEYS.chat, u.id, []);
    state.coachError = '';
    rerender({ keepScroll: true });
  },
  secToggle(el) { const u = needEntrepreneur(); if (!u) return; saveSecurity(u, { [el.dataset.key]: el.checked }); toast('Privacy setting saved.'); },
  secContact(el) { const u = needEntrepreneur(); if (!u) return; saveSecurity(u, { publicContact: el.value }); toast('Privacy setting saved.'); },
  blockUser(form) {
    const u = needEntrepreneur();
    if (!u) return;
    const d = formData(form);
    const errors = {};
    if (!isEmail(d.email || '')) errors.email = 'Enter a valid email address.';
    if (!showErrors(form, errors)) return;
    if (!confirm(t('Block {email}? Their messages will be hidden from your dashboard.', { email: d.email }))) return;
    const s = securityFor(u.id);
    saveSecurity(u, { blocked: [...s.blocked.filter(x => x.email !== d.email.toLowerCase()), { email: d.email.toLowerCase(), reason: d.reason || '', at: new Date().toISOString() }] });
    toast('User blocked.');
    rerender({ keepScroll: true });
  },
  unblock(el) {
    const u = needEntrepreneur();
    if (!u) return;
    const s = securityFor(u.id);
    s.blocked.splice(Number(el.dataset.index), 1);
    saveSecurity(u, { blocked: s.blocked });
    toast('User unblocked.');
    rerender({ keepScroll: true });
  },
  reportActivity(form) {
    const u = needEntrepreneur();
    if (!u) return;
    const d = formData(form);
    const errors = {};
    if (!d.subject) errors.subject = 'This field is required.';
    if (!d.details) errors.details = 'This field is required.';
    if (!showErrors(form, errors)) return;
    if (!confirm(t('Save this report? It stays in this browser and is not sent to anyone.'))) return;
    const s = securityFor(u.id);
    saveSecurity(u, { reports: [...s.reports, { subject: d.subject, details: d.details, at: new Date().toISOString() }] });
    toast('Report saved locally.');
    rerender({ keepScroll: true });
  },
  async changePassword(form) {
    const u = currentUser();
    if (!u) return;
    const d = formData(form);
    const errors = {};
    if (!d.current) errors.current = 'This field is required.';
    if (!d.next || d.next.length < 8) errors.next = 'Password must be at least 8 characters.';
    if (!showErrors(form, errors)) return;
    const err = await changePassword(u.id, d.current, d.next);
    if (err) return showErrors(form, { current: err });
    form.reset();
    toast('Password updated.');
  },
});
