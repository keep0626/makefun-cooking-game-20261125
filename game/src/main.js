// Golden Ladle Bistro — boot and the game loop.
// The loop ticks the state, drains its sound queue, and draws every frame.
// URL helpers: ?demo=1|2|3 opens a mid-shift scene for screenshots,
// ?selftest=1 plays one full order by itself and reports in the title.

import { VIEW_H, VIEW_W } from './config.js';
import { attachInput, createInput } from './input.js';
import { playSound, setMuted } from './audio.js';
import { render } from './render.js';
import { runSelfTest } from './selftest.js';
import { seedDemo } from './shots.js';
import { nearestStation, startShift, updateGame } from './state.js';
import { createGame } from './state.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const game = createGame();
const input = createInput();
window.__game = game;
window.__errors = [];
window.addEventListener('error', (e) => window.__errors.push(String(e.message || e.error)));
window.addEventListener('unhandledrejection', (e) => window.__errors.push(String(e.reason)));

attachInput(canvas, game, input, {
  onUseKey: () => {},
  onConfirm: () => {
    if (game.mode === 'title' || game.mode === 'over') startShift(game);
  },
  onPause: () => {
    if (game.mode === 'playing') game.mode = 'paused';
    else if (game.mode === 'paused') game.mode = 'playing';
  },
  onMute: () => setMuted(game.muted),
  onRestart: () => {
    if (game.mode === 'over') startShift(game);
  },
});

const params = new URLSearchParams(location.search);
if (params.has('selftest')) {
  requestAnimationFrame(() => runSelfTest(game));
} else if (params.get('demo')) {
  seedDemo(game, params.get('demo'));
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (game.mode === 'playing') {
    updateGame(game, input.keys, dt);
    while (game.sfx.length) playSound(game.sfx.shift());
  }
  render(ctx, game, game.mode === 'playing' ? nearestStation(game) : null, now);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
