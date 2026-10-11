import { t } from '../i18n.js';
import { esc, inr, img, toast, uid, formData, showErrors, isMobile, fmtDate } from '../utils.js';
import { read, write, readScoped, writeScoped, KEYS } from '../store.js';
import { state, actions, modals, openModal, closeModal, rerender, go } from '../state.js';
import { currentUser } from '../auth.js';
import { findProduct, allBusinesses, findBusiness, decrementStock } from '../catalog.js';
import { CITIES } from '../data.js';
import { dashShell, dashTop, productCard, businessCard, empty, modalShell, cartFor, badge, stockText, demoTag, field, selectField } from '../ui.js';
import { verificationPanel } from '../verification.js';
import { marketplace } from './public.js';

export function favsFor(userId) {
  const f = readScoped(KEYS.favourites, userId, { products: [], businesses: [] });
  return { products: Array.isArray(f.products) ? f.products : [], businesses: Array.isArray(f.businesses) ? f.businesses : [] };
}

function requireCustomer() {
  const u = currentUser();
  if (u?.role === 'Customer') return u;
  if (!u) { toast('Log in with a customer account to use the cart and favourites.'); go('login'); }
  else toast('The cart and favourites are available for customer accounts.');
  return null;
}

const cartLines = userId => cartFor(userId).map(i => ({ ...i, product: findProduct(i.productId) })).filter(i => i.product);
const cartTotal = lines => lines.reduce((s, i) => s + i.qty * Number(i.product.price), 0);

const TABS = [['browse', 'Marketplace', '◇'], ['businesses', 'Businesses', '⌂'], ['favourites', 'Favourites', '♡'], ['cart', 'Cart', '▣'], ['orders', 'Demo orders', '✓']];

export function customerDashboard(tab) {
  const u = currentUser();
  const active = TABS.some(x => x[0] === tab) ? tab : 'browse';
  const views = { browse, businesses, favourites, cart: cartView, orders };
  return dashShell('Customer', TABS, active, views[active](u));
}

function browse(u) {
  return `${dashTop(t('Customer workspace'), t('Namaste, {name}', { name: esc(u.name.split(' ')[0]) }), t('Browse women-led sustainable businesses. Filter by city, category, verification status and price.'))}${marketplace()}`;
}

function businesses(u) {
  const fav = favsFor(u.id);
  const q = (state.bizQuery || '').toLowerCase();
  const list = allBusinesses().filter(b => !q || [b.name, b.founder, b.city, b.category].join(' ').toLowerCase().includes(q));
  return `${dashTop(t('Customer workspace'), t('Businesses'), t('Read the stories of the entrepreneurs behind each product.'))}
  <div class="searchbar"><input data-input="bizSearch" value="${esc(state.bizQuery || '')}" placeholder="${t('Search businesses by name, founder or city')}" aria-label="${t('Search businesses by name, founder or city')}"></div>
  <div id="bizResults" class="business-grid" style="margin-top:16px">${list.map(b => businessCard(b, { saved: fav.businesses.includes(b.id) })).join('') || empty('No businesses match your search.')}</div>`;
}

function favourites(u) {
  const fav = favsFor(u.id);
  const products = fav.products.map(findProduct).filter(Boolean);
  const bizs = fav.businesses.map(findBusiness).filter(Boolean);
  return `${dashTop(t('Customer workspace'), t('Favourites'), t('Products and businesses you saved.'))}
  <h3 class="serif">${t('Favourite products')}</h3>${products.length ? `<div class="product-grid">${products.map(p => productCard(p, { favourite: true })).join('')}</div>` : empty('You have not saved any products yet.', `<a class="btn small" href="#customer/browse">${t('Browse products')}</a>`)}
  <h3 class="serif" style="margin-top:26px">${t('Saved businesses')}</h3>${bizs.length ? `<div class="business-grid">${bizs.map(b => businessCard(b, { saved: true })).join('')}</div>` : empty('You have not saved any businesses yet.')}`;
}

function cartView(u) {
  const lines = cartLines(u.id);
  return `${dashTop(t('Customer workspace'), t('Your cart'), t('Checkout is simulated. No payment is collected.'))}
  ${lines.length ? `<div class="panel">${lines.map(i => `<div class="cart-row">${img(i.product.img || i.product.business.img, i.product.name)}<div><b>${esc(i.product.name)}</b><div class="small muted">${esc(i.product.business.name)} · ${inr(i.product.price)}</div>${Number(i.product.stock) < i.qty ? `<div class="small" style="color:#a0442f">${t('Only {n} left', { n: i.product.stock })}</div>` : ''}</div>
    <div class="qty"><button data-action="cartQty" data-id="${esc(i.productId)}" data-delta="-1" aria-label="${t('Decrease quantity')}">−</button><span>${i.qty}</span><button data-action="cartQty" data-id="${esc(i.productId)}" data-delta="1" aria-label="${t('Increase quantity')}">+</button></div>
    <b>${inr(i.qty * i.product.price)}</b><button class="textbtn" data-action="removeFromCart" data-id="${esc(i.productId)}">${t('Remove')}</button></div>`).join('')}
    <div class="tableline" style="font-size:15px"><span>${t('Total')}</span><b id="cartTotal">${inr(cartTotal(lines))}</b></div>
    <div class="form-actions"><button class="btn outline" data-action="clearCart">${t('Clear cart')}</button><button class="btn" data-action="openCheckout">${t('Proceed to demo checkout')}</button></div></div>`
    : empty('Your cart is empty.', `<a class="btn small" href="#customer/browse">${t('Browse products')}</a>`)}`;
}

function orders(u) {
  const list = readScoped(KEYS.orders, u.id, []).slice().reverse();
  return `${dashTop(t('Customer workspace'), t('Demo orders'), t('Orders placed through the simulated checkout. No real purchase or payment took place.'))}
  ${list.length ? list.map(o => `<div class="panel" style="margin-bottom:10px"><div class="panel-head"><div><b>${esc(o.id)}</b><div class="small muted">${fmtDate(o.createdAt)} · ${esc(o.city)}</div></div><span class="status accepted">${t('Demo order placed')}</span></div>
    ${o.items.map(i => `<div class="tableline"><span>${esc(i.name)} × ${i.qty} <span class="muted">· ${esc(i.businessName)}</span></span><b>${inr(i.price * i.qty)}</b></div>`).join('')}<div class="tableline"><span>${t('Total')}</span><b>${inr(o.total)}</b></div></div>`).join('')
    : empty('No demo orders yet.')}`;
}

modals.product = ({ id, qty = 1 }) => {
  const p = findProduct(id);
  if (!p) return modalShell(t('Product not found'), `<p>${t('This product is no longer available.')}</p>`);
  const b = p.business;
  const u = currentUser();
  const fav = u?.role === 'Customer' && favsFor(u.id).products.includes(p.id);
  return modalShell(esc(p.name), `<div class="detail-grid"><div>${img(p.img || b.img, p.name)}<div style="margin-top:10px">${badge(p)} ${p.demo ? demoTag() : ''}</div></div>
  <div><div class="business-loc">${esc(b.city)}, ${esc(b.state)} · ${esc(t(p.category))}</div><p style="font-size:24px;color:var(--forest);margin:6px 0"><b>${inr(p.price)}</b></p>${stockText(p.stock)}
  <p>${esc(p.description)}</p>
  <div class="info-list"><div><span>${t('Materials')}</span><b>${esc(p.materials) || '—'}</b></div><div><span>${t('Production method')}</span><b>${esc(p.method) || '—'}</b></div><div><span>${t('Packaging')}</span><b>${esc(t(p.packaging)) || '—'}</b></div><div><span>${t('End of life')}</span><b>${esc(t(p.endOfLife)) || '—'}</b></div></div>
  <div class="form-actions" style="justify-content:flex-start;align-items:center"><div class="qty"><button data-action="detailQty" data-delta="-1" aria-label="${t('Decrease quantity')}">−</button><span id="detailQty">${qty}</span><button data-action="detailQty" data-delta="1" aria-label="${t('Increase quantity')}">+</button></div>
  <button class="btn" data-action="addToCart" data-id="${esc(p.id)}" data-qty="${qty}" ${Number(p.stock) < 1 ? 'disabled' : ''}>${t('Add to Cart')}</button><button class="icon-btn ${fav ? 'on' : ''}" data-action="toggleFavProduct" data-id="${esc(p.id)}" aria-label="${t('Add to Favourites')}">${fav ? '♥' : '♡'}</button></div></div></div>
  <h3 class="serif" style="margin-top:22px">${t('Sustainability verification')}</h3>${verificationPanel(p)}
  <h3 class="serif">${t('About {name}', { name: esc(b.name) })}</h3><p class="muted">${esc(b.story) || t('This entrepreneur has not added a story yet.')}</p><a class="link" href="#business/${esc(b.id)}">${t('Visit business profile')} →</a>`, { wide: true });
};

modals.checkout = () => {
  const u = currentUser();
  const lines = cartLines(u.id);
  return modalShell(t('Demo checkout'), `<p class="proto-note">${t('This is a simulated checkout. No payment details are collected and no real order or payment is made.')}</p>
  ${lines.map(i => `<div class="tableline"><span>${esc(i.product.name)} × ${i.qty}</span><b>${inr(i.qty * i.product.price)}</b></div>`).join('')}<div class="tableline"><span>${t('Total')}</span><b>${inr(cartTotal(lines))}</b></div>
  <form data-submit="placeOrder" novalidate><div class="form-grid">${field('shipName', 'Full name', 'text', { value: u.name })}${field('shipMobile', 'Mobile number', 'tel', { value: u.mobile || '' })}</div>
  ${field('shipAddress', 'Delivery address (demo)', 'text', { textarea: true })}${selectField('shipCity', 'City', CITIES, { value: u.city, placeholder: 'Select city', translate: false })}
  <div class="form-actions"><button type="button" class="btn outline" data-action="closeModal">${t('Cancel')}</button><button class="btn" type="submit">${t('Place demo order')}</button></div></form>`);
};

modals.orderPlaced = ({ id, total }) => modalShell(t('Demo order confirmed'), `<p>${t('Your demo order {id} for {total} has been saved in this browser.', { id: esc(id), total: inr(total) })}</p><p class="warn small">${t('No payment was taken and nothing will be shipped — this is a prototype.')}</p><div class="form-actions"><a class="btn" href="#customer/orders">${t('View demo orders')}</a></div>`);

Object.assign(actions, {
  viewProduct(el) { openModal('product', { id: el.dataset.id, qty: 1 }); },
  detailQty(el) {
    const m = state.modal;
    const p = findProduct(m.data.id);
    m.data.qty = Math.max(1, Math.min(Number(p?.stock) || 1, (m.data.qty || 1) + Number(el.dataset.delta)));
    rerender({ keepScroll: true });
  },
  addToCart(el) {
    const u = requireCustomer();
    if (!u) return;
    const p = findProduct(el.dataset.id);
    if (!p) return toast('This product is no longer available.');
    const qty = Math.max(1, Number(el.dataset.qty) || 1);
    const cart = cartFor(u.id);
    const line = cart.find(i => i.productId === p.id);
    const newQty = (line?.qty || 0) + qty;
    if (newQty > Number(p.stock)) return toast('Only {n} left in stock.', { n: p.stock });
    if (line) line.qty = newQty; else cart.push({ productId: p.id, qty });
    writeScoped(KEYS.cart, u.id, cart);
    toast('Added {product} to your cart.', { product: p.name });
    rerender({ keepScroll: true });
  },
  cartQty(el) {
    const u = requireCustomer();
    if (!u) return;
    const cart = cartFor(u.id);
    const line = cart.find(i => i.productId === el.dataset.id);
    const p = findProduct(el.dataset.id);
    if (!line || !p) return;
    const next = line.qty + Number(el.dataset.delta);
    if (next > Number(p.stock)) return toast('Only {n} left in stock.', { n: p.stock });
    line.qty = next;
    writeScoped(KEYS.cart, u.id, cart.filter(i => i.qty > 0));
    rerender({ keepScroll: true });
  },
  removeFromCart(el) {
    const u = requireCustomer();
    if (!u) return;
    writeScoped(KEYS.cart, u.id, cartFor(u.id).filter(i => i.productId !== el.dataset.id));
    toast('Removed from cart.');
    rerender({ keepScroll: true });
  },
  clearCart() {
    const u = requireCustomer();
    if (!u || !confirm(t('Remove all items from your cart?'))) return;
    writeScoped(KEYS.cart, u.id, []);
    rerender({ keepScroll: true });
  },
  openCheckout() {
    const u = requireCustomer();
    if (!u) return;
    if (!cartLines(u.id).length) return toast('Your cart is empty.');
    openModal('checkout');
  },
  placeOrder(form) {
    const u = requireCustomer();
    if (!u) return;
    const d = formData(form);
    const errors = {};
    for (const k of ['shipName', 'shipMobile', 'shipAddress', 'shipCity']) if (!d[k]) errors[k] = 'This field is required.';
    if (d.shipMobile && !isMobile(d.shipMobile)) errors.shipMobile = 'Enter a valid 10-digit Indian mobile number.';
    if (!showErrors(form, errors)) return;
    const lines = cartLines(u.id);
    if (!lines.length) return toast('Your cart is empty.');
    const short = lines.find(i => i.qty > Number(i.product.stock));
    if (short) return toast('Only {n} left in stock.', { n: short.product.stock });
    const order = { id: 'DEMO-' + Date.now().toString(36).toUpperCase(), createdAt: new Date().toISOString(), city: d.shipCity, items: lines.map(i => ({ productId: i.productId, name: i.product.name, businessId: i.product.businessId, businessName: i.product.business.name, price: Number(i.product.price), qty: i.qty })), total: cartTotal(lines), status: 'demo' };
    writeScoped(KEYS.orders, u.id, [...readScoped(KEYS.orders, u.id, []), order]);
    lines.forEach(i => decrementStock(i.productId, i.qty));
    writeScoped(KEYS.cart, u.id, []);
    openModal('orderPlaced', { id: order.id, total: order.total });
    toast('Demo order placed.');
  },
  toggleFavProduct(el) { toggleFav('products', el.dataset.id); },
  toggleFavBusiness(el) { toggleFav('businesses', el.dataset.id); },
  bizSearch(el) {
    state.bizQuery = el.value;
    const u = currentUser();
    const fav = favsFor(u.id);
    const q = el.value.toLowerCase();
    const list = allBusinesses().filter(b => !q || [b.name, b.founder, b.city, b.category].join(' ').toLowerCase().includes(q));
    document.getElementById('bizResults').innerHTML = list.map(b => businessCard(b, { saved: fav.businesses.includes(b.id) })).join('') || empty('No businesses match your search.');
  },
  sendMessage(form) {
    const u = currentUser();
    const d = formData(form);
    if (!showErrors(form, d.message ? {} : { message: 'This field is required.' })) return;
    const all = read(KEYS.messages, []);
    all.push({ id: uid('msg'), businessId: form.dataset.id, fromId: u.id, fromName: u.name, fromEmail: u.email, text: d.message, at: new Date().toISOString() });
    write(KEYS.messages, all);
    closeModal();
    toast('Message saved. The entrepreneur can see it in their dashboard.');
  },
});

function toggleFav(kind, id) {
  const u = requireCustomer();
  if (!u) return;
  const fav = favsFor(u.id);
  const on = fav[kind].includes(id);
  fav[kind] = on ? fav[kind].filter(x => x !== id) : [...fav[kind], id];
  writeScoped(KEYS.favourites, u.id, fav);
  toast(on ? 'Removed from favourites.' : 'Added to favourites.');
  rerender({ keepScroll: true });
}
