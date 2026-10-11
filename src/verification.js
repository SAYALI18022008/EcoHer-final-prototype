import { t } from './i18n.js';
import { esc, toast, formData, showErrors } from './utils.js';
import { read, write, KEYS } from './store.js';
import { actions, modals, openModal, closeModal, rerender } from './state.js';
import { currentUser } from './auth.js';
import { verificationFor, verificationLabel, userProducts } from './catalog.js';
import { END_OF_LIFE } from './data.js';
import { modalShell, field, selectField } from './ui.js';

const FLOW = ['submitted', 'basic_pending', 'community_pending', 'partner_pending', 'approved'];
const YES_NO = ['Yes', 'Partly', 'No'];

export function stepper(status) {
  const idx = status === 'not_submitted' ? -1 : FLOW.indexOf(status);
  return `<ol class="stepper" aria-label="${t('Verification progress')}">${FLOW.map((s, i) => {
    const cls = i < idx || (i === idx && s === 'approved') || (s === 'submitted' && idx >= 0) ? 'done' : i === idx ? 'current' : '';
    return `<li class="${cls}">${i + 1}. ${t(verificationLabel(s))}</li>`;
  }).join('')}</ol>`;
}

function checklist(answers) {
  const a = answers || {};
  const rows = [
    ['Material composition', a.composition],
    ['Recycled / upcycled materials', a.recycled && `${t(a.recycled)}${a.recycledDetail ? ' — ' + esc(a.recycledDetail) : ''}`],
    ['Plastic-free packaging', a.plasticFree && t(a.plasticFree)],
    ['Local sourcing', a.localSourcing && t(a.localSourcing)],
    ['Reusable / recyclable / biodegradable', a.endOfLife && a.endOfLife !== 'Not specified' && t(a.endOfLife)],
    ['Production details', a.production],
    ['Evidence or certification details', a.evidence],
  ];
  return `<div class="checklist">${rows.map(([label, v]) => `<div><span class="${v ? 'ok' : 'no'}">${v ? '✓' : '✕'}</span><span><b>${t(label)}:</b> ${v ? (label === 'Material composition' || label === 'Production details' || label === 'Evidence or certification details' ? esc(v) : v) : t('Not provided')}</span></div>`).join('')}</div>`;
}

export function verificationPanel(product) {
  const v = verificationFor(product);
  const approved = v.status === 'approved';
  let body = stepper(v.status);
  if (v.demo) body += `<p class="small muted">${t('Demo listing: this status is sample data for the prototype and does not represent a real review.')}</p>`;
  else if (v.status === 'not_submitted') body += `<p class="small muted">${t('No sustainability information has been submitted for this product yet.')}</p>`;
  else body += `<h4>${t('What has been provided')}</h4>${checklist(v.answers)}`;
  body += `<p class="warn small">${approved
    ? t('Demo approval only: a simulated reviewer marked this information as approved inside the prototype. It is not a real certification or independent verification.')
    : t('Still unverified: the information above is self-reported. Selecting options does not make a product sustainable, and EcoHer has not independently checked these claims.')}</p>`;
  return body;
}

modals.verify = ({ productId }) => {
  const u = currentUser();
  const p = userProducts(u?.id).find(x => x.id === productId);
  if (!p) return modalShell(t('Product not found'), `<p>${t('This product is no longer available.')}</p>`);
  const a = verificationFor(p).answers || {};
  return modalShell(t('Product Sustainability Verification'), `<p class="muted">${t('Tell customers what this product is made of and how. Your answers are shown as self-reported information until a demo review is completed.')}</p>
  <p><b>${esc(p.name)}</b></p>
  <form data-submit="submitVerification" data-id="${esc(p.id)}" novalidate>
    ${field('composition', 'Material composition', 'text', { value: a.composition || p.materials || '', placeholder: 'e.g. 80% reclaimed cotton, 20% jute' })}
    <div class="form-grid">${selectField('recycled', 'Recycled or upcycled materials used?', YES_NO, { value: a.recycled, placeholder: 'Select' })}
    ${field('recycledDetail', 'Which recycled or upcycled materials?', 'text', { value: a.recycledDetail || '' })}
    ${selectField('plasticFree', 'Plastic-free packaging?', YES_NO, { value: a.plasticFree, placeholder: 'Select' })}
    ${selectField('localSourcing', 'Locally sourced materials?', YES_NO, { value: a.localSourcing, placeholder: 'Select' })}</div>
    ${selectField('endOfLife', 'Reusable, recyclable or biodegradable?', END_OF_LIFE, { value: a.endOfLife || p.endOfLife, placeholder: 'Select' })}
    ${field('production', 'Production details', 'text', { textarea: true, value: a.production || p.method || '' })}
    ${field('evidence', 'Evidence or certification details', 'text', { textarea: true, value: a.evidence || p.evidence || '', hint: 'Describe supplier bills, photos, or certificates you hold. Files are not uploaded in this prototype.' })}
    <p class="proto-note">${t('Submitting does not certify your product. It starts a simulated review so you can see how the verification flow would work.')}</p>
    <div class="form-actions"><button type="button" class="btn outline" data-action="closeModal">${t('Do this later')}</button><button class="btn" type="submit">${t('Submit for review')}</button></div>
  </form>`, { wide: true });
};

function saveVerification(productId, update) {
  const all = read(KEYS.verifications, {});
  all[productId] = { status: 'not_submitted', history: [], ...(all[productId] || {}), ...update };
  write(KEYS.verifications, all);
  return all[productId];
}

function ownsProduct(id) {
  const u = currentUser();
  return u?.role === 'Entrepreneur' && userProducts(u.id).some(p => p.id === id);
}

Object.assign(actions, {
  openVerify(el) { if (ownsProduct(el.dataset.id)) openModal('verify', { productId: el.dataset.id }); },
  submitVerification(form) {
    const id = form.dataset.id;
    if (!ownsProduct(id)) return toast('You can only verify your own products.');
    const d = formData(form);
    const errors = {};
    for (const k of ['composition', 'recycled', 'plasticFree', 'localSourcing', 'endOfLife', 'production']) if (!d[k]) errors[k] = 'This field is required.';
    if (!showErrors(form, errors)) return;
    const now = new Date().toISOString();
    saveVerification(id, { status: 'basic_pending', answers: d, submittedAt: now, history: [{ status: 'submitted', at: now }, { status: 'basic_pending', at: now }] });
    closeModal();
    toast('Information submitted. Status: Basic Review Pending.');
  },
  advanceReview(el) {
    const id = el.dataset.id;
    if (!ownsProduct(id)) return;
    const all = read(KEYS.verifications, {});
    const current = all[id]?.status;
    const next = { basic_pending: 'community_pending', community_pending: 'partner_pending' }[current];
    if (!next) return;
    saveVerification(id, { status: next, history: [...(all[id].history || []), { status: next, at: new Date().toISOString() }] });
    toast('Demo review moved to: {status}', { status: t(verificationLabel(next)) });
    rerender({ keepScroll: true });
  },
  approveReview(el) {
    const id = el.dataset.id;
    if (!ownsProduct(id)) return;
    const all = read(KEYS.verifications, {});
    if (all[id]?.status !== 'partner_pending') return toast('Complete the earlier review stages first.');
    if (!confirm(t('Mark this demo review as approved? This simulates a reviewer decision and is not a real certification.'))) return;
    saveVerification(id, { status: 'approved', approvedAt: new Date().toISOString(), history: [...(all[id].history || []), { status: 'approved', at: new Date().toISOString() }] });
    toast('Demo review approved.');
    rerender({ keepScroll: true });
  },
});
