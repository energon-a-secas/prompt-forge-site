import { state, saveState } from './state.js';
import { renderMode, renderCharacterOutput, renderTagOutput, applyPreset } from './render.js';

function bindInput(id, path, callback) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', () => {
    const value = el.type === 'checkbox' ? el.checked : el.value;
    setPath(state, path, value);
    saveState();
    if (callback) callback();
  });
}

function setPath(obj, path, value) {
  const keys = path.split('.');
  let target = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    target = target[keys[i]];
  }
  const last = keys[keys.length - 1];
  if (typeof target[last] === 'number') {
    target[last] = Number(value);
  } else {
    target[last] = value;
  }
}

async function copyTextarea(id, buttonId, doneText = 'Copied') {
  const textarea = document.getElementById(id);
  const button = buttonId ? document.getElementById(buttonId) : null;
  try {
    await navigator.clipboard.writeText(textarea.value);
    if (button) {
      const original = button.textContent;
      button.textContent = doneText;
      setTimeout(() => button.textContent = original, 1200);
    }
  } catch (e) {
    textarea.select();
    if (button) button.textContent = 'Select & copy';
  }
}

function downloadTextarea(id, filename) {
  const textarea = document.getElementById(id);
  const blob = new Blob([textarea.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function bindEvents() {
  // Mode nav
  document.getElementById('navCharacter').addEventListener('click', () => {
    state.mode = 'character';
    saveState();
    renderMode();
  });
  document.getElementById('navTags').addEventListener('click', () => {
    state.mode = 'tags';
    saveState();
    renderMode();
  });

  // Preset selector
  const presetSelect = document.getElementById('charPreset');
  if (presetSelect) {
    presetSelect.addEventListener('change', () => {
      applyPreset(presetSelect.value);
      saveState();
    });
  }

  // Character fields
  const charFields = [
    { id: 'charName', path: 'character.name' },
    { id: 'charRole', path: 'character.role' },
    { id: 'charAppearance', path: 'character.appearance' },
    { id: 'charPersonality', path: 'character.personality' },
    { id: 'charBackground', path: 'character.background' },
    { id: 'charSpeech', path: 'character.speech' },
    { id: 'charExamples', path: 'character.examples' },
    { id: 'charExtra', path: 'character.extra' },
    { id: 'narration', path: 'character.narration' },
    { id: 'bluntness', path: 'character.bluntness' },
    { id: 'initiative', path: 'character.initiative' },
    { id: 'emotion', path: 'character.emotion' },
    { id: 'avoidCliches', path: 'character.avoidCliches' },
    { id: 'avoidLoops', path: 'character.avoidLoops' },
    { id: 'stayInCharacter', path: 'character.stayInCharacter' },
    { id: 'overNarrate', path: 'character.overNarrate' },
    { id: 'charFormat', path: 'character.format' }
  ];
  charFields.forEach(f => bindInput(f.id, f.path, () => {
    if (f.path.startsWith('character.narration') ||
        f.path.startsWith('character.bluntness') ||
        f.path.startsWith('character.initiative') ||
        f.path.startsWith('character.emotion')) {
      // label will update on next render; re-render all fields for labels
      renderCharacterOutput();
      // re-render fields to update slider labels without losing focus hack
      const c = state.character;
      document.getElementById('narrationLabel').textContent = getSliderLabel('narration', c.narration);
      document.getElementById('bluntnessLabel').textContent = getSliderLabel('bluntness', c.bluntness);
      document.getElementById('initiativeLabel').textContent = getSliderLabel('initiative', c.initiative);
      document.getElementById('emotionLabel').textContent = getSliderLabel('emotion', c.emotion);
    } else {
      renderCharacterOutput();
    }
  }));

  // Tag fields
  const tagFields = [
    { id: 'tagInput', path: 'tags.input' },
    { id: 'tagNormalize', path: 'tags.normalize' },
    { id: 'tagDedupe', path: 'tags.dedupe' },
    { id: 'tagQuality', path: 'tags.quality' },
    { id: 'tagUncensored', path: 'tags.uncensored' },
    { id: 'tagQualityList', path: 'tags.qualityList' },
    { id: 'tagNegative', path: 'tags.negative' }
  ];
  tagFields.forEach(f => bindInput(f.id, f.path, renderTagOutput));

  // Copy / download actions
  document.getElementById('copyCharBtn').addEventListener('click', () => copyTextarea('charOutput', 'copyCharBtn'));
  document.getElementById('downloadCharBtn').addEventListener('click', () => {
    const ext = state.character.format === 'markdown' ? 'md' : 'json';
    const name = state.character.name || 'character';
    downloadTextarea('charOutput', `${name.toLowerCase().replace(/\s+/g, '-')}.${ext}`);
  });
  document.getElementById('copyTagsBtn').addEventListener('click', () => copyTextarea('tagsOutput', 'copyTagsBtn'));
  document.getElementById('downloadTagsBtn').addEventListener('click', () => downloadTextarea('tagsOutput', 'tags.txt'));
  document.getElementById('copyNegBtn').addEventListener('click', () => copyTextarea('negOutput', 'copyNegBtn'));
}

function getSliderLabel(key, value) {
  const map = {
    narration: ['Concise', 'Balanced', 'Detailed', 'Over-narrated'],
    bluntness: ['Soft', 'Balanced', 'Direct', 'Blunt'],
    initiative: ['Passive', 'Reactive', 'Proactive', 'Leading'],
    emotion: ['Muted', 'Balanced', 'Expressive', 'Intense']
  };
  return (map[key] || [])[value] || 'Balanced';
}
