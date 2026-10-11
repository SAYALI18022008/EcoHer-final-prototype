import { t } from './i18n.js';

export const FALLBACK_IMG = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#e3eae2"/><path d="M0 230 C90 190 160 250 250 205 S360 190 400 210 V300 H0Z" fill="#c3d3c4"/><circle cx="300" cy="90" r="34" fill="#e9e6d8"/><text x="200" y="160" text-anchor="middle" font-family="Georgia,serif" font-size="30" fill="#2f6254">EcoHer</text></svg>`
);

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export const uid = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function inr(amount) {
  const n = Number(amount) || 0;
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: n % 1 ? 2 : 0 });
}

export const todayISO = () => new Date().toISOString().slice(0, 10);

export function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export async function hashPassword(value) {
  if (globalThis.crypto?.subtle) {
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return [...new Uint8Array(bytes)].map(x => x.toString(16).padStart(2, '0')).join('');
  }
  return 'local:' + value;
}

export const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());
export const isMobile = v => /^(\+91[\s-]?)?[6-9]\d{9}$/.test(String(v).replace(/\s/g, ''));

export function img(src, alt, cls = '') {
  return `<img class="${cls}" src="${esc(src || FALLBACK_IMG)}" alt="${esc(alt)}" loading="lazy">`;
}

export function toast(msg, vars) {
  document.querySelectorAll('.toast').forEach(x => x.remove());
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.textContent = t(msg, vars);
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

export function formData(form) {
  return Object.fromEntries([...new FormData(form).entries()].map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]));
}

export function showErrors(form, errors) {
  form.querySelectorAll('.field-error').forEach(e => e.remove());
  form.querySelectorAll('.invalid').forEach(e => e.classList.remove('invalid'));
  const entries = Object.entries(errors);
  for (const [name, msg] of entries) {
    const field = form.querySelector(`[name="${name}"]`);
    const holder = field?.closest('.form-control') || field?.parentElement;
    if (!holder) continue;
    field.classList.add('invalid');
    holder.insertAdjacentHTML('beforeend', `<small class="field-error" data-i18n-err="${esc(msg)}">${esc(t(msg))}</small>`);
  }
  if (entries.length) {
    form.querySelector('.invalid')?.focus();
    toast('Please fix the highlighted fields.');
  }
  return entries.length === 0;
}

export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.size) return resolve('');
    if (!file.type.startsWith('image/')) return reject(new Error('Choose an image file.'));
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, 900 / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      image.onerror = () => reject(new Error('Could not read that image.'));
      image.src = reader.result;
    };
    reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.readAsDataURL(file);
  });
}
