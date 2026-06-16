import { state, loadSaved, saveState } from './state.js';
import { render, renderTagFields } from './render.js';
import { bindEvents } from './events.js';

function init() {
  loadSaved();
  render();
  renderTagFields();
  bindEvents();
  saveState();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
