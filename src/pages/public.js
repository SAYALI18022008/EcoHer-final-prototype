import { t } from '../i18n.js';
import { esc, inr, img, toast } from '../utils.js';
import { state, actions, modals, openModal, go } from '../state.js';
import { currentUser } from '../auth.js';
import { allProducts, allBusinesses, findBusiness, verificationFor, allMentors, mentorMatch, securityFor, userProducts } from '../catalog.js';
import { read, KEYS } from '../store.js';
import { CITIES, STATES, BUSINESS_CATEGORIES, SUSTAINABILITY_TYPES, EXPERTISE, LANGUAGE_OPTIONS, AVAILABILITY } from '../data.js';
import { nav, footer, opts, productCard, businessCard, badge, demoTag, empty, modalShell } from '../ui.js';
import { favsFor } from './customer.js';

const HERO = 'https://images.unsplash.com/photo-1614772887723-f43f45d455e1?auto=format&fit=crop&w=1500&q=88';

export function home() {
  const u = currentUser();
  const fav = u ? favsFor(u.id) : { products: [], businesses: [] };
  return `${nav()}<main>
  <section class="hero"><div class="hero-grid"><div class="hero-copy"><div class="eyebrow">${t('A growth ecosystem for good')}</div>
    <h1 class="serif">${t('Helping women-led sustainable businesses grow.')}</h1>
    <p>${t('Discover trusted businesses, connect with peer mentors, and turn sustainability into measurable impact — all in one place.')}</p>
    <div class="hero-actions"><a class="btn" href="#discover">${t('Explore Businesses')} →</a><a class="btn outline" href="#signup">${t('Join as an Entrepreneur')}</a></div>
    <div class="trustline"><span class="avatarstack"><i></i><i></i><i></i></span><span>${t('Grow with purpose. Build with trust.')}</span></div></div>
    <div class="hero-photo">${img(HERO, t('Indian woman artisan weaving fabric at her loom'))}<div class="photo-stamp"><b>${t('Good work,')}</b> ${t('made visible.')}</div><div class="photo-caption"><small>${t('Meet the makers shaping a better future')}</small><strong>${t('Her business. Her impact.')}</strong></div></div></div></section>
  <section class="section" id="how"><div class="section-inner"><div class="section-head"><div><div class="eyebrow">${t('From first discovery to lasting growth')}</div><h2 class="serif">${t('A little more than a marketplace.')}</h2></div><p>${t('We help the business behind the product build visibility, trust, skills and a path to grow.')}</p></div>
    <div class="journey">${[[t('01 / FIND'), 'Discover', 'Find sustainable businesses and the women building them.'], [t('02 / KNOW'), 'Verify', 'See what has been submitted and what is still unverified.'], [t('03 / CONNECT'), 'Learn', 'Meet peer mentors who understand your next challenge.'], [t('04 / SHOW'), 'Measure', 'Make your social and environmental impact visible.']].map(([n, h, p]) => `<article><span class="stepnum">${n}</span><h3>${t(h)}</h3><p>${t(p)}</p></article>`).join('')}</div></div></section>
  <section class="maker-gallery"><div class="maker-gallery-in"><div class="section-head"><div><div class="eyebrow">${t('Real work. Real women.')}</div><h2 class="serif">${t('Meet the hands behind the craft.')}</h2></div><p>${t('Every business has a person, a practice and a community behind it.')}</p></div>
    <div class="maker-grid">${[['/images/woman-weaving-loom.jpg', 'Made with care', 'Her skill, in every stitch.', 'Woman weaving at a handloom'], ['/images/lambani-embroidery.jpg', 'Small batches', 'Thoughtful from the start.', 'Women doing Lambani embroidery together'], ['/images/areca-press-entrepreneur.jpg', 'Local makers', 'Growing, together.', 'Woman pressing areca leaf plates'], ['/images/pottery-wheel.jpg', 'Rooted in craft', 'Shaped by hand.', 'Potter shaping clay on a wheel'], ['/images/women-shg-meeting.jpg', 'Community', 'Stronger together.', 'Women self-help group meeting']].map(([src, e, c, alt]) => `<figure>${img(src, t(alt))}<figcaption><span class="gallery-eyebrow">${t(e)}</span>${t(c)}</figcaption></figure>`).join('')}</div></div></section>
  <section class="promise"><div class="promise-in"><div><div class="eyebrow" style="color:#cfbd86">${t('The EcoHer difference')}</div><h2 class="serif">${t('Built for women. Designed for growth.')}</h2><p>${t('A business needs more than a product listing. EcoHer brings visibility, verification, mentorship and impact tracking together so the whole business can move forward.')}</p><a class="btn" style="background:#f3eddf;color:var(--forest)" href="#signup">${t('Find your place here')} →</a></div>
    <div class="pillars">${[[t('01 — VISIBILITY'), 'Be found for your work', 'Reach conscious buyers looking for your kind of business.'], [t('02 — TRUST'), 'Show what is verified', 'Clear status labels help customers make informed choices.'], [t('03 — MENTORSHIP'), 'Grow with your peers', 'Find practical support for the next step.'], [t('04 — IMPACT'), 'Make progress visible', 'Track estimates transparently, with the method behind them.']].map(([n, h, p]) => `<div class="pillar"><span>${n}</span><h3>${t(h)}</h3><p>${t(p)}</p></div>`).join('')}</div></div></section>
  <section class="section verify-section"><div class="section-inner"><div class="section-head"><div><div class="eyebrow">${t('Trust, with receipts')}</div><h2 class="serif">${t('Know what has been checked.')}</h2></div><p>${t('No vague “100% sustainable” claims. Each stage shows what was submitted and what is still waiting for review.')}</p></div>
    <div class="verify-cards">${[[t('01 / SUBMIT'), 'Information Submitted', 'The entrepreneur describes materials, packaging, sourcing and production.'], [t('02 / REVIEW'), 'Community Review Pending', 'In the full product, community members would review the details. In this prototype the review is simulated.'], [t('03 / PARTNER'), 'Partner Verification Pending', 'An SHG, NGO or institutional partner would confirm the information. Approval here is a demo only.']].map(([n, h, p], i) => `<article class="verify-card ${i === 1 ? 'active' : ''}"><span class="eyebrow" ${i === 1 ? 'style="color:#d7c38a"' : ''}>${n}</span><h3>${t(h)}</h3><p>${t(p)}</p></article>`).join('')}</div></div></section>
  <section class="section explore-section"><div class="section-inner"><div class="section-head"><div><div class="eyebrow">${t('Thoughtful businesses, closer than you think')}</div><h2 class="serif">${t('Meet the people behind it.')}</h2></div><a class="btn outline" href="#discover">${t('Explore all businesses')} →</a></div>
    <div class="business-grid">${allBusinesses().slice(0, 4).map(b => businessCard(b, { saved: fav.businesses.includes(b.id) })).join('')}</div></div></section>
  <section class="locationband"><div class="section-inner"><div class="eyebrow">${t('Good work, all over India')}</div><h2 class="serif" style="font-size:31px;color:var(--forest);margin:8px 0">${t('Find businesses near you.')}</h2>
    <div class="cities">${CITIES.map(c => `<button class="city" data-action="cityShortcut" data-city="${c}">${c} ↗</button>`).join('')}</div></div></section>
  <section class="section" style="padding-top:65px;padding-bottom:65px"><div class="section-inner" style="text-align:center"><div class="eyebrow">${t('Your next chapter starts here')}</div><h2 class="serif" style="font-size:42px;color:var(--forest);margin:12px auto;max-width:650px">${t('The business behind the product deserves to grow.')}</h2><a class="btn" href="#signup">${t('Join the EcoHer community')} →</a></div></section>
  </main>${footer()}`;
}

export function filterProducts(list, f) {
  const q = f.q.trim().toLowerCase();
  return list.filter(p => {
    const b = p.business;
    if (q && ![p.name, b.name, p.category, p.description, b.founder].join(' ').toLowerCase().includes(q)) return false;
    if (f.city && b.city !== f.city) return false;
    if (f.state && b.state !== f.state) return false;
    if (f.category && p.category !== f.category) return false;
    if (f.type && b.type !== f.type) return false;
    if (f.verification && verificationFor(p).status !== f.verification) return false;
    if (f.min !== '' && Number(p.price) < Number(f.min)) return false;
    if (f.max !== '' && Number(p.price) > Number(f.max)) return false;
    return true;
  });
}

export function productResults() {
  const u = currentUser();
  const fav = u?.role === 'Customer' ? favsFor(u.id) : { products: [] };
  const list = filterProducts(allProducts(), state.filters);
  return `<p class="results-meta" id="resultsMeta">${t('{n} products found', { n: list.length })} · ${t('Listings marked “Demo data” are sample businesses for this prototype.')}</p>
  ${list.length ? `<div class="product-grid">${list.map(p => productCard(p, { favourite: fav.products.includes(p.id) })).join('')}</div>` : empty('No products match these filters. Try clearing a filter.', `<button class="btn outline small" data-action="clearFilters">${t('Clear filters')}</button>`)}`;
}

export function marketplace() {
  const f = state.filters;
  const sel = (key, list, placeholder, translate = true) => `<select data-change="filter" data-key="${key}" aria-label="${t(placeholder)}">${opts(list, f[key], { placeholder, translate })}</select>`;
  return `<div class="searchbar"><input id="searchInput" data-input="filter" data-key="q" value="${esc(f.q)}" placeholder="${t('Search products or businesses...')}" aria-label="${t('Search products or businesses...')}"></div>
  <div class="filters">${sel('city', CITIES, 'All cities', false)}${sel('state', STATES, 'All states', false)}${sel('category', BUSINESS_CATEGORIES, 'All categories')}${sel('type', SUSTAINABILITY_TYPES, 'All sustainability types')}
  <select data-change="filter" data-key="verification" aria-label="${t('All verification statuses')}"><option value="">${t('All verification statuses')}</option>${['not_submitted', 'basic_pending', 'community_pending', 'partner_pending', 'approved'].map(s => `<option value="${s}" ${f.verification === s ? 'selected' : ''}>${t({ not_submitted: 'Not submitted', basic_pending: 'Basic Review Pending', community_pending: 'Community Review Pending', partner_pending: 'Partner Verification Pending', approved: 'Verification Approved (demo)' }[s])}</option>`).join('')}</select>
  <input type="number" min="0" data-input="filter" data-key="min" value="${esc(f.min)}" placeholder="${t('Min ₹')}" aria-label="${t('Min ₹')}"><input type="number" min="0" data-input="filter" data-key="max" value="${esc(f.max)}" placeholder="${t('Max ₹')}" aria-label="${t('Max ₹')}">
  <button class="btn outline small" data-action="clearFilters">${t('Clear filters')}</button></div>
  <div id="productResults">${productResults()}</div>`;
}

export function discover() {
  return `${nav()}<section class="market-intro"><div class="eyebrow">${t('Women-led · Thoughtfully made · Rooted in community')}</div><h1>${t('Discover businesses doing good.')}</h1><p>${t('Meet the makers and see what is behind every thoughtful product.')}</p></section>
  <main class="market-wrap">${marketplace()}</main>${footer()}`;
}

export function businessPage(id) {
  const u = currentUser();
  let b = findBusiness(id);
  let hiddenOwn = false;
  if (!b && u && id === 'biz-' + u.id) { b = read(KEYS.businesses, {})[u.id]; hiddenOwn = !!b; }
  if (!b) return `${nav()}<main class="access panel"><h1 class="serif">${t('Business not found')}</h1><p>${t('This business profile is not available or has been hidden by its owner.')}</p><a class="btn" href="#discover">${t('Back to marketplace')}</a></main>${footer()}`;
  const products = b.demo ? allProducts().filter(p => p.businessId === b.id) : userProducts(b.ownerId).map(p => ({ ...p, business: b }));
  const fav = u?.role === 'Customer' ? favsFor(u.id) : { products: [], businesses: [] };
  const approved = products.filter(p => verificationFor(p).status === 'approved').length;
  const contact = businessContact(b);
  return `${nav()}<section class="business-hero">${img(b.img, b.name)}<div class="overlay"><div><div class="eyebrow" style="color:#d8c78d">${esc(b.city)}, ${esc(b.state)} · ${esc(t(b.category))}</div><h1 class="serif">${esc(b.name)}</h1><p>${t('Founded by')} ${esc(b.founder)} ${b.demo ? demoTag() : ''}</p></div></div></section>
  <main class="section"><div class="section-inner">${hiddenOwn ? `<p class="warn">${t('Only you can see this page. Your profile is hidden from the public in Security settings.')}</p>` : ''}
  <div class="dash-grid"><div class="panel"><div class="eyebrow">${t('Our story')}</div><h3>${b.statement ? esc(b.statement) : t('Our story')}</h3><p class="muted" style="line-height:1.8">${b.story ? esc(b.story) : t('This entrepreneur has not added a story yet.')}</p>
    <div class="info-list"><div><span>${t('Location')}</span><b>${esc(b.location || b.city)}, ${esc(b.state)}</b></div><div><span>${t('Sustainability category')}</span><b>${esc(t(b.type))}</b></div><div><span>${t('Materials')}</span><b>${esc(b.materials) || '—'}</b></div><div><span>${t('Production methods')}</span><b>${esc(b.method) || '—'}</b></div><div><span>${t('Packaging')}</span><b>${esc(b.packaging) || '—'}</b></div><div><span>${t('Women employed or supported')}</span><b>${esc(b.women) || '—'}</b></div></div></div>
  <div class="panel"><div class="eyebrow">${t('Verification status')}</div><h3>${t('{a} of {n} products demo-approved', { a: approved, n: products.length })}</h3><p class="small muted">${t('Each product shows its own verification stage. Statuses are part of a prototype review flow, not real certification.')}</p>
    <div class="eyebrow" style="margin-top:18px">${t('Contact options')}</div>${contact}
    ${u?.role === 'Customer' ? `<button class="btn outline small" style="margin-top:10px" data-action="toggleFavBusiness" data-id="${esc(b.id)}">${fav.businesses.includes(b.id) ? '♥ ' + t('Saved') : '♡ ' + t('Save business')}</button>` : ''}</div></div>
  <h2 class="serif" style="color:var(--forest);margin-top:34px">${t('Products')}</h2>
  ${products.length ? `<div class="product-grid">${products.map(p => productCard(p, { favourite: fav.products.includes(p.id) })).join('')}</div>` : empty('No products listed yet.')}
  </div></main>${footer()}`;
}

function businessContact(b) {
  if (b.demo) return `<p class="small">${esc(b.contact)} <span class="muted">(${t('demo address — not monitored')})</span></p><button class="btn small" data-action="messageBusiness" data-id="${esc(b.id)}">${t('Send a message')}</button>`;
  const sec = securityFor(b.ownerId);
  const owner = read(KEYS.accounts, []).find(a => a && a.id === b.ownerId);
  if (sec.publicContact === 'none') return `<p class="small muted">${t('This business is not accepting contact right now.')}</p>`;
  const rows = [];
  if (sec.publicContact === 'business') {
    if (b.contactEmail && !(sec.hideEmail && b.contactEmail === owner?.email)) rows.push(esc(b.contactEmail));
    if (b.contactPhone && !(sec.hideMobile && b.contactPhone === owner?.profile?.mobile)) rows.push(esc(b.contactPhone));
  }
  return `${rows.length ? `<p class="small">${rows.join(' · ')}</p>` : `<p class="small muted">${t('Personal contact details are hidden. Use EcoHer messages.')}</p>`}<button class="btn small" data-action="messageBusiness" data-id="${esc(b.id)}">${t('Send a message')}</button>`;
}

export function mentorshipPage() {
  const u = currentUser();
  return `${nav()}<main><section class="market-intro"><div class="eyebrow">${t('Peer support that moves business forward')}</div><h1>${t('Good advice grows better together.')}</h1><p>${t('Find an experienced mentor for the challenge you are working through. Matches show their reasons, so you can choose with confidence.')}</p>
  <div class="hero-actions">${u?.role === 'Entrepreneur' ? `<a class="btn" href="#entrepreneur/mentors">${t('Find my mentor')}</a>` : `<a class="btn" href="#signup">${t('Join as an Entrepreneur')}</a>`}<a class="btn outline" href="#signup">${t('Offer mentorship')}</a></div></section>
  <section class="section" style="padding-top:30px"><div class="section-inner">${mentorFinder()}</div></section></main>${footer()}`;
}

export function mentorFinder() {
  const f = state.mentorFilters;
  const sel = (key, list, ph) => `<select data-change="mentorFilter" data-key="${key}" aria-label="${t(ph)}">${opts(list, f[key], { placeholder: ph, translate: key !== 'city' })}</select>`;
  const list = allMentors().filter(m => (!f.expertise || m.expertise.includes(f.expertise)) && (!f.city || m.city === f.city) && (!f.language || m.languages.includes(f.language)) && (!f.availability || m.availability === f.availability))
    .map(m => ({ m, match: mentorMatch(m, f) })).sort((a, b) => b.match.score - a.match.score);
  return `<div class="filters">${sel('expertise', EXPERTISE, 'All growth areas')}${sel('language', LANGUAGE_OPTIONS, 'Any language')}${sel('city', CITIES, 'Any location')}${sel('availability', AVAILABILITY, 'Any availability')}</div>
  <p class="results-meta">${t('Match score: expertise 40 + language 25 + city 20 + availability 15 points, based on the filters you choose.')}</p>
  ${list.length ? `<div class="mentor-grid">${list.map(({ m, match }) => `<article class="panel"><div class="mentor-card" style="margin:0;background:transparent;padding:0">${m.img ? `<div class="mentor-avatar" style="background-image:url('${esc(m.img)}')"></div>` : `<div class="mentor-avatar initials">${esc(m.name.charAt(0))}</div>`}<div><b>${esc(m.name)}</b><p>${t('{n} years experience', { n: m.years })} · ${esc(m.city)} ${m.demo ? demoTag() : ''}</p></div>${match.score ? `<span class="badge gold">${t('{n} match points', { n: match.score })}</span>` : ''}</div>
    <p class="small"><b>${t('Expertise')}:</b> ${m.expertise.map(x => esc(t(x))).join(', ') || '—'}</p><p class="small muted">${t('Languages')}: ${m.languages.map(x => esc(t(x))).join(', ') || '—'} · ${esc(t(m.availability))}</p>
    ${match.reasons.map(r => `<div class="rec">✓ ${t(r)}</div>`).join('')}
    <button class="btn small" style="margin-top:10px" data-action="requestMentor" data-id="${esc(m.id)}">${t('Request mentorship')}</button></article>`).join('')}</div>` : empty('No mentors match these filters. Try another skill, language or location.')}`;
}

export function impactPage() {
  return `${nav()}<main><section class="market-intro"><div class="eyebrow">${t('Every number has a story behind it')}</div><h1>${t('Make meaningful impact visible.')}</h1><p>${t('EcoHer’s Impact Passport helps businesses share social and environmental progress, with clear labels and transparent calculations.')}</p></section>
  <section class="section"><div class="section-inner"><div class="section-head"><div><div class="eyebrow">${t('Example Impact Passport')} ${demoTag()}</div><h2 class="serif">${t('Impact Passport')}</h2></div><p>${t('Example metrics for the demo business Asha Upcycles. Estimated numbers are clearly marked and based on information supplied by the entrepreneur.')}</p></div>
  <div class="impact-feature">${img('/images/kantha-stole.jpg', t('Upcycled textile product'))}<div class="impact-feature-copy"><div class="eyebrow">Asha Upcycles · Pune</div><h3>${t('Giving a second life to treasured textiles.')}</h3><p>${t('Impact starts with the people and practices behind each product. The Passport shares progress alongside the method used to calculate each estimate.')}</p></div></div>
  <div class="panel" style="background:var(--forest);color:#fff"><div class="impact-grid">${[['18 kg', 'Textile waste reused · Estimated'], [t('{n} units', { n: 42 }), 'Reusable packaging · Recorded'], ['3', 'Women supported · Reported'], ['5', 'Local suppliers · Reported']].map(x => `<div class="impact-box"><strong>${x[0]}</strong><small>${t(x[1])}</small></div>`).join('')}</div>
  <details style="margin-top:18px;background:#ffffff12;padding:15px"><summary style="cursor:pointer;color:#f1e6c4">${t('How is textile reuse calculated?')}</summary><p style="font-size:12px;line-height:1.8;color:#e0e6dc">${t('36 products × approximately 0.5 kg of textile per product = 18 kg estimated textile reused. This estimate uses entrepreneur-provided product counts and material weights. EcoHer does not show carbon-saving claims without a verified method.')}</p></details></div></div></section></main>${footer()}`;
}

Object.assign(actions, {
  scrollHow(el, e) { e.preventDefault(); if (state.route !== 'home') { go('home'); setTimeout(() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' }), 50); } else document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' }); },
  cityShortcut(el) { state.filters = { ...state.filters, city: el.dataset.city }; go('discover'); },
  filter(el) {
    state.filters[el.dataset.key] = el.value;
    const box = document.getElementById('productResults');
    if (box) box.innerHTML = productResults();
  },
  clearFilters() { state.filters = { q: '', city: '', state: '', category: '', type: '', verification: '', min: '', max: '' }; actions._rerenderKeep(); },
  mentorFilter(el) { state.mentorFilters[el.dataset.key] = el.value; actions._rerenderKeep(); },
  messageBusiness(el) {
    const u = currentUser();
    if (!u) { toast('Log in to send a message.'); return go('login'); }
    openModal('message', { businessId: el.dataset.id });
  },
});

modals.message = ({ businessId }) => {
  const b = findBusiness(businessId) || {};
  return modalShell(t('Message {name}', { name: esc(b.name || '') }), `<form data-submit="sendMessage" data-id="${esc(businessId)}" novalidate><div class="form-control"><label for="f-message">${t('Your message')}</label><textarea id="f-message" name="message" rows="4" maxlength="600"></textarea></div><p class="proto-note">${t('Messages are saved only in this browser. They are not emailed or delivered outside the prototype.')}</p><div class="form-actions"><button class="btn" type="submit">${t('Send message')}</button></div></form>`);
};
