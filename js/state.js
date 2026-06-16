const STORAGE_KEY = 'prompt-forge-state';

export const state = {
  mode: 'character',
  character: {
    preset: 'blank',
    name: '',
    role: '',
    appearance: '',
    personality: '',
    background: '',
    speech: '',
    examples: '',
    narration: 1,
    bluntness: 1,
    initiative: 1,
    emotion: 1,
    avoidCliches: true,
    avoidLoops: true,
    stayInCharacter: true,
    overNarrate: false,
    extra: '',
    format: 'markdown'
  },
  tags: {
    input: '',
    normalize: true,
    dedupe: true,
    quality: true,
    uncensored: false,
    qualityList: 'masterpiece, best quality, highly detailed',
    negative: ''
  }
};

export function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.mode) state.mode = saved.mode;
    if (saved.character) Object.assign(state.character, saved.character);
    if (saved.tags) Object.assign(state.tags, saved.tags);
  } catch (e) {
    // ignore corrupt storage
  }
}

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // ignore storage errors
  }
}
