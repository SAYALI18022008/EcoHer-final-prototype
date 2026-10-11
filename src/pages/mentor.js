import { t } from '../i18n.js';
import { esc, toast, formData, showErrors, fmtDate, uid } from '../utils.js';
import { read, write, KEYS } from '../store.js';
import { actions, rerender, state } from '../state.js';
import { currentUser, updateProfile } from '../auth.js';
import { EXPERTISE, LANGUAGE_OPTIONS, AVAILABILITY, CITIES } from '../data.js';
import { dashShell, dashTop, empty, field, selectField, demoTag } from '../ui.js';

const TABS = [['overview', 'Overview', '◈'], ['requests', 'Incoming requests', '✉'], ['active', 'Accepted mentees', '✓'], ['history', 'History', '↺'], ['profile', 'My profile', '◎']];

const myRequests = u => read(KEYS.mentorRequests, []).filter(r => r && r.mentorId === u.id);
const statusTag = s => `<span class="status ${esc(s)}">${t({ pending: 'Pending', accepted: 'Accepted', rejected: 'Declined' }[s] || s)}</span>`;

export function mentorDashboard(tab) {
  const u = currentUser();
  const active = TABS.some(x => x[0] === tab) ? tab : 'overview';
  const views = { overview, requests, active: accepted, history, profile };
  return dashShell('Mentor', TABS, active, views[active](u));
}

function requestCard(r, withActions) {
  return `<article class="panel" style="margin-bottom:10px"><div class="panel-head"><div><b>${esc(r.entrepreneurName)}</b> · ${esc(r.businessName)} ${r.demo ? demoTag() : ''}<div class="small muted">${esc(r.city)} · ${t('Prefers')} ${esc(t(r.language))} · ${t('Goal')}: ${esc(t(r.goal))} · ${fmtDate(r.createdAt)}</div></div>${statusTag(r.status)}</div>
  <p class="small">“${esc(r.message)}”</p>${withActions ? `<div class="form-actions" style="justify-content:flex-start"><button class="btn small" data-action="acceptRequest" data-id="${esc(r.id)}">${t('Accept')}</button><button class="btn outline small" data-action="rejectRequest" data-id="${esc(r.id)}">${t('Decline')}</button></div>` : ''}</article>`;
}

function overview(u) {
  const list = myRequests(u);
  const count = s => list.filter(r => r.status === s).length;
  const m = u.mentor || {};
  return `${dashTop(t('Mentor workspace'), t('Namaste, {name}', { name: esc(u.name.split(' ')[0]) }), t('Share what you know with women building sustainable businesses.'))}
  <div class="stat-grid"><div class="stat"><label>${t('Pending requests')}</label><strong>${count('pending')}</strong></div><div class="stat"><label>${t('Accepted mentees')}</label><strong>${count('accepted')}</strong></div><div class="stat"><label>${t('Declined')}</label><strong>${count('rejected')}</strong></div><div class="stat"><label>${t('Years of experience')}</label><strong>${esc(m.years ?? 0)}</strong></div></div>
  <div class="dash-grid"><div class="panel"><h3>${t('Latest requests')}</h3>${list.filter(r => r.status === 'pending').slice(0, 2).map(r => requestCard(r, true)).join('') || empty('No pending requests right now.')}</div>
  <div class="panel"><h3>${t('Your mentor profile')}</h3><div class="info-list"><div><span>${t('City')}</span><b>${esc(u.city)}</b></div><div><span>${t('Expertise')}</span><b>${(m.expertise || []).map(x => esc(t(x))).join(', ') || '—'}</b></div><div><span>${t('Languages')}</span><b>${(m.languages || []).map(x => esc(t(x))).join(', ') || '—'}</b></div><div><span>${t('Availability')}</span><b>${esc(t(m.availability || '')) || '—'}</b></div></div><a class="btn outline small" style="margin-top:12px" href="#mentor/profile">${t('Edit profile')}</a></div></div>`;
}

function requests(u) {
  const list = myRequests(u).filter(r => r.status === 'pending');
  return `${dashTop(t('Mentor workspace'), t('Incoming requests'), t('Requests marked “Demo data” are sample mentees added so you can try the flow.'))}${list.map(r => requestCard(r, true)).join('') || empty('No pending requests right now.')}`;
}

function accepted(u) {
  const list = myRequests(u).filter(r => r.status === 'accepted');
  return `${dashTop(t('Mentor workspace'), t('Accepted mentees'), t('Keep guidance notes for each mentee. Notes stay in this browser.'))}
  ${list.map(r => `${requestCard(r, false)}<div class="panel" style="margin:-10px 0 14px"><h4>${t('Guidance notes')}</h4>${(r.notes || []).map(n => `<div class="rec"><span>${esc(n.text)}</span><small class="muted">${fmtDate(n.at)}</small></div>`).join('') || `<p class="small muted">${t('No notes yet.')}</p>`}
  <form class="chat-form" style="padding:0;border:0" data-submit="mentorNote" data-id="${esc(r.id)}" novalidate><input name="note" placeholder="${t('Add a guidance note')}" aria-label="${t('Add a guidance note')}" maxlength="400"><button class="btn small" type="submit">${t('Save note')}</button></form></div>`).join('') || empty('You have not accepted any requests yet.')}`;
}

function history(u) {
  const list = myRequests(u).filter(r => r.status !== 'pending').sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  return `${dashTop(t('Mentor workspace'), t('Mentorship history'), '')}
  ${list.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>${t('Entrepreneur')}</th><th>${t('Business')}</th><th>${t('Goal')}</th><th>${t('Status')}</th><th>${t('Updated')}</th><th>${t('Notes')}</th></tr></thead><tbody>${list.map(r => `<tr><td>${esc(r.entrepreneurName)}</td><td>${esc(r.businessName)}</td><td>${esc(t(r.goal))}</td><td>${statusTag(r.status)}</td><td>${fmtDate(r.updatedAt)}</td><td>${(r.notes || []).length}</td></tr>`).join('')}</tbody></table></div>` : empty('No mentorship history yet.')}`;
}

function profile(u) {
  const m = u.mentor || {};
  const checks = (name, list, sel) => `<div class="check-grid">${list.map(x => `<label class="check"><input type="checkbox" name="${name}" value="${esc(x)}" ${(sel || []).includes(x) ? 'checked' : ''}> ${esc(t(x))}</label>`).join('')}</div>`;
  return `${dashTop(t('Mentor workspace'), t('My profile'), t('Entrepreneurs see your expertise, languages, city and availability when looking for a mentor.'))}
  <form class="panel" data-submit="saveMentorProfile" novalidate><div class="form-grid">${field('name', 'Full name', 'text', { value: u.name })}${selectField('city', 'City', CITIES, { value: u.city, translate: false })}${field('years', 'Years of experience', 'number', { value: m.years ?? 0, min: 0, max: 60 })}${selectField('availability', 'Availability', AVAILABILITY, { value: m.availability })}</div>
  <div class="form-control"><label>${t('Areas of expertise')}</label>${checks('expertise', EXPERTISE, m.expertise)}<input type="hidden" name="expertiseCheck"></div>
  <div class="form-control"><label>${t('Languages spoken')}</label>${checks('mentorLanguages', LANGUAGE_OPTIONS, m.languages)}<input type="hidden" name="languagesCheck"></div>
  ${field('bio', 'Short bio', 'text', { textarea: true, value: m.bio || '' })}
  <div class="form-actions"><button class="btn" type="submit">${t('Save profile')}</button></div></form>`;
}

function updateRequest(id, fn) {
  const u = currentUser();
  const all = read(KEYS.mentorRequests, []);
  const r = all.find(x => x && x.id === id && x.mentorId === u?.id);
  if (!r) { toast('Request not found.'); return null; }
  fn(r);
  r.updatedAt = new Date().toISOString();
  write(KEYS.mentorRequests, all);
  return r;
}

Object.assign(actions, {
  acceptRequest(el) {
    if (updateRequest(el.dataset.id, r => { r.status = 'accepted'; })) { toast('Request accepted.'); rerender({ keepScroll: true }); }
  },
  rejectRequest(el) {
    if (!confirm(t('Decline this mentorship request?'))) return;
    if (updateRequest(el.dataset.id, r => { r.status = 'rejected'; })) { toast('Request declined.'); rerender({ keepScroll: true }); }
  },
  mentorNote(form) {
    const d = formData(form);
    if (!showErrors(form, d.note ? {} : { note: 'This field is required.' })) return;
    if (updateRequest(form.dataset.id, r => { r.notes = [...(r.notes || []), { id: uid('note'), text: d.note, at: new Date().toISOString() }]; })) { toast('Note saved.'); rerender({ keepScroll: true }); }
  },
  saveMentorProfile(form) {
    const u = currentUser();
    const d = formData(form);
    const fd = new FormData(form);
    const errors = {};
    if (!d.name) errors.name = 'This field is required.';
    const years = Number(d.years);
    if (d.years === '' || !Number.isFinite(years) || years < 0 || years > 60) errors.years = 'Enter years of experience between 0 and 60.';
    if (!fd.getAll('expertise').length) errors.expertiseCheck = 'Select at least one area of expertise.';
    if (!fd.getAll('mentorLanguages').length) errors.languagesCheck = 'Select at least one language.';
    if (!showErrors(form, errors)) return;
    updateProfile(u.id, { name: d.name, city: d.city, mentor: { ...u.mentor, years, availability: d.availability, expertise: fd.getAll('expertise'), languages: fd.getAll('mentorLanguages'), bio: d.bio } });
    toast('Profile saved.');
    rerender({ keepScroll: true });
  },
});
