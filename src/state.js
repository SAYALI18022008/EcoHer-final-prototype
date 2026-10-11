export const state = {
  route: 'home',
  param: '',
  modal: null,
  filters: { q: '', city: '', state: '', category: '', type: '', verification: '', min: '', max: '' },
  mentorFilters: { expertise: '', city: '', language: '', availability: '' },
  coachThinking: false,
};

export const actions = {};
let renderer = () => {};
export const setRenderer = fn => { renderer = fn; };
export const rerender = opts => renderer(opts);

export function openModal(type, data = {}) {
  state.modal = { type, data };
  rerender({ keepScroll: true });
}

export function closeModal() {
  state.modal = null;
  rerender({ keepScroll: true });
}

export function go(route) {
  if (location.hash.slice(1) === route) rerender();
  else location.hash = route;
}

/** Modal renderers registered by feature modules: modals[type](data) -> html */
export const modals = {};
