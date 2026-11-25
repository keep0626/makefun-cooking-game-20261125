// Golden Ladle Bistro — keyboard and mouse controls.
// Keyboard moves the chef and uses the nearest counter; the mouse walks the
// chef to a clicked spot and uses a clicked station on arrival.

import { STATIONS, VIEW_H, VIEW_W } from './config.js';
import { interact, nearestStation, walkTo } from './state.js';

export function createInput() {
  return { keys: new Set() };
}

function toGameCoords(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * VIEW_W,
    y: ((clientY - rect.top) / rect.height) * VIEW_H,
  };
}

export function attachInput(canvas, game, input, hooks) {
  const keyName = (e) => e.key.toLowerCase();

  window.addEventListener('keydown', (e) => {
    const k = keyName(e);
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (e.repeat) return;
    input.keys.add(k);
    if (k === 'e' || k === ' ') {
      if (game.mode === 'playing') interact(game);
      hooks.onUseKey();
    }
    if (k === 'enter') hooks.onConfirm();
    if (k === 'p') hooks.onPause();
    if (k === 'm') { game.muted = !game.muted; hooks.onMute(); }
    if (k === 'r') hooks.onRestart();
  });
  window.addEventListener('keyup', (e) => input.keys.delete(keyName(e)));
  window.addEventListener('blur', () => input.keys.clear());

  canvas.addEventListener('click', (e) => {
    if (game.mode !== 'playing') { hooks.onConfirm(); return; }
    const p = toGameCoords(canvas, e.clientX, e.clientY);
    const station = STATIONS.find((s) => p.x >= s.x && p.x <= s.x + s.w && p.y >= s.y && p.y <= s.y + s.h);
    if (station) {
      // Walk to the station's near edge, then use it.
      const cx = Math.max(station.x, Math.min(game.chef.x, station.x + station.w));
      const cy = Math.max(station.y, Math.min(game.chef.y, station.y + station.h));
      const dx = game.chef.x - cx;
      const dy = game.chef.y - cy;
      const d = Math.hypot(dx, dy) || 1;
      const stand = 46;
      walkTo(game, cx + (dx / d) * stand, cy + (dy / d) * stand, station.id);
    } else {
      walkTo(game, p.x, p.y, null);
    }
    hooks.onUseKey();
  });

  return { nearestStation: () => nearestStation(game) };
}
