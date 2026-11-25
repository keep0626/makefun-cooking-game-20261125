// Golden Ladle Bistro — all canvas drawing.
// Every picture in the game is drawn here from shapes: the kitchen, the
// counters, the food, the chef and the order tickets. No image files exist.

import {
  INGREDIENTS, STATIONS, VIEW_H, VIEW_W, preparedColor, preparedLabel,
  recipeById, recipeForItems,
} from './config.js';
import { holdingLabel } from './state.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, weight, align) {
  ctx.fillStyle = color || '#2b1d12';
  ctx.font = `${weight || 'bold'} ${size}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// One ingredient, drawn as a little picture: raw, chopped or cooked.
export function drawIngredient(ctx, id, x, y, r) {
  const base = id.replace('-chopped', '').replace('-cooked', '');
  const ing = INGREDIENTS[base];
  const chopped = id.endsWith('-chopped');
  const cooked = id.endsWith('-cooked');
  ctx.save();
  ctx.translate(x, y);
  if (base === 'tomato') {
    ctx.fillStyle = ing.color;
    ctx.beginPath(); ctx.arc(0, 1, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3f9e4d';
    ctx.beginPath();
    ctx.moveTo(0, -r + 2); ctx.lineTo(-7, -r - 5); ctx.lineTo(-2, -r + 2);
    ctx.lineTo(0, -r - 6); ctx.lineTo(2, -r + 2); ctx.lineTo(7, -r - 5); ctx.lineTo(0, -r + 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.35, r * 0.28, 0, Math.PI * 2); ctx.fill();
  } else if (base === 'lettuce') {
    ctx.fillStyle = ing.color;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45, r * 0.55, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#8ed19a';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2); ctx.fill();
  } else if (base === 'cheese') {
    ctx.fillStyle = ing.color;
    ctx.beginPath(); ctx.moveTo(-r, r * 0.6); ctx.lineTo(r, r * 0.6); ctx.lineTo(r * 0.7, -r * 0.7); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e8a91c';
    ctx.beginPath(); ctx.arc(-r * 0.2, r * 0.1, r * 0.16, 0, Math.PI * 2); ctx.arc(r * 0.35, r * 0.25, r * 0.12, 0, Math.PI * 2); ctx.fill();
  } else if (base === 'bread') {
    ctx.fillStyle = ing.color;
    rr(ctx, -r, -r * 0.6, r * 2, r * 1.2, r * 0.5); ctx.fill();
    ctx.strokeStyle = ing.dark; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-r * 0.4, -r * 0.45); ctx.lineTo(-r * 0.1, r * 0.3); ctx.moveTo(r * 0.2, -r * 0.45); ctx.lineTo(r * 0.5, r * 0.3); ctx.stroke();
  } else if (base === 'pasta') {
    ctx.strokeStyle = ing.color; ctx.lineWidth = r * 0.28; ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-r + i * 3, r * 0.5);
      ctx.quadraticCurveTo(-r * 0.4 + i * 6, -r * 0.7, r - i * 3, r * 0.5);
      ctx.stroke();
    }
  } else if (base === 'egg') {
    if (cooked) {
      ctx.fillStyle = '#fff8e6';
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f6b93b';
      ctx.beginPath(); ctx.arc(2, 1, r * 0.45, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = ing.color;
      ctx.beginPath(); ctx.ellipse(0, 0, r * 0.72, r, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.beginPath(); ctx.arc(-r * 0.2, -r * 0.4, r * 0.2, 0, Math.PI * 2); ctx.fill();
    }
  }
  if (chopped) {
    ctx.strokeStyle = 'rgba(43,29,18,0.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-r * 0.7, 0); ctx.lineTo(r * 0.7, 0); ctx.stroke();
    ctx.fillStyle = '#2b1d12';
    text(ctx, '✂', r * 0.75, -r * 0.75, r * 0.9, '#2b1d12', 'bold');
  }
  if (cooked && base !== 'egg') {
    ctx.strokeStyle = 'rgba(120,120,120,0.7)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-4, -r - 8); ctx.quadraticCurveTo(-8, -r - 14, -4, -r - 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(4, -r - 8); ctx.quadraticCurveTo(8, -r - 14, 4, -r - 20); ctx.stroke();
  }
  ctx.restore();
}

function progressBar(ctx, x, y, w, h, frac, color) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  rr(ctx, x, y, w, h, h / 2); ctx.fill();
  ctx.fillStyle = color;
  if (frac > 0.01) { rr(ctx, x + 1, y + 1, Math.max(4, (w - 2) * frac), h - 2, (h - 2) / 2); ctx.fill(); }
}

function drawFloor(ctx) {
  ctx.fillStyle = '#e9cba0';
  ctx.fillRect(0, 176, VIEW_W, VIEW_H - 176);
  ctx.fillStyle = '#dfbd8d';
  const t = 64;
  for (let y = 176; y < VIEW_H; y += t) {
    for (let x = ((y / t) % 2 ? 0 : t / 2); x < VIEW_W; x += t) {
      ctx.fillRect(x, y, t - 2, t - 2);
    }
  }
  // Back wall with a menu poster and a hanging pan.
  ctx.fillStyle = '#b4632e';
  ctx.fillRect(0, 176, VIEW_W, 28);
  ctx.fillStyle = '#f3e2c2';
  rr(ctx, 1060, 210, 180, 60, 8); ctx.fill();
  text(ctx, '★ TODAY: FRESH ★', 1150, 232, 15, '#b4632e', 'bold');
  text(ctx, 'salads · pasta · omelettes', 1150, 254, 12, '#7a4a22', 'normal');
}

function drawCounter(ctx, s, highlight) {
  ctx.save();
  if (highlight) {
    ctx.shadowColor = '#ffd94d'; ctx.shadowBlur = 22;
  }
  ctx.fillStyle = '#8a5a28';
  rr(ctx, s.x, s.y, s.w, s.h, 12); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#c98f4e';
  rr(ctx, s.x + 4, s.y + 4, s.w - 8, 26, 8); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(s.x + 8, s.y + s.h - 14, s.w - 16, 6);
  text(ctx, s.label, s.x + s.w / 2, s.y + s.h + 16, 15, '#fff7e8', 'bold');
  ctx.restore();
}

function drawCrate(ctx, s, highlight) {
  drawCounter(ctx, s, highlight);
  const ing = INGREDIENTS[s.ingredient];
  for (let i = 0; i < 3; i++) drawIngredient(ctx, s.ingredient, s.x + 34 + i * 40, s.y + 48, 15);
}

function drawBoard(ctx, game, highlight) {
  const s = STATIONS.find((st) => st.id === 'board');
  drawCounter(ctx, s, highlight);
  ctx.fillStyle = '#f3e2c2';
  rr(ctx, s.x + 18, s.y + 40, 150, 58, 8); ctx.fill();
  ctx.strokeStyle = '#8a5a28'; ctx.lineWidth = 2;
  rr(ctx, s.x + 18, s.y + 40, 150, 58, 8); ctx.stroke();
  // Knife.
  ctx.fillStyle = '#cfd6dd';
  ctx.beginPath(); ctx.moveTo(s.x + 185, s.y + 46); ctx.lineTo(s.x + 225, s.y + 46); ctx.lineTo(s.x + 225, s.y + 56); ctx.lineTo(s.x + 185, s.y + 56); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#5a3a1a'; ctx.fillRect(s.x + 225, s.y + 46, 14, 10);
  const slot = game.board;
  if (slot.item) {
    drawIngredient(ctx, slot.item, s.x + 70, s.y + 69, 20);
    if (slot.remaining > 0) {
      progressBar(ctx, s.x + 100, s.y + 62, 62, 12, 1 - slot.remaining / slot.total, '#58b368');
      text(ctx, `${Math.ceil(slot.remaining)}s`, s.x + 131, s.y + 86, 12, '#fff7e8', 'bold');
    } else {
      text(ctx, `${preparedLabel(preparedId(slot.item))} ✓`, s.x + 125, s.y + 69, 13, '#c8f5c8', 'bold');
    }
  } else {
    text(ctx, 'chop here', s.x + 93, s.y + 69, 13, '#a98d68', 'normal');
  }
}

function drawStove(ctx, game, highlight) {
  const s = STATIONS.find((st) => st.id === 'stove');
  drawCounter(ctx, s, highlight);
  ctx.fillStyle = '#3a3f46';
  rr(ctx, s.x + 14, s.y + 38, s.w - 28, 64, 10); ctx.fill();
  const slot = game.stove;
  for (let i = 0; i < 2; i++) {
    const bx = s.x + 62 + i * 150;
    ctx.fillStyle = '#22252a';
    ctx.beginPath(); ctx.arc(bx, s.y + 70, 34, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#6b7280'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(bx, s.y + 70, 34, 0, Math.PI * 2); ctx.stroke();
    if (slot.item && i === 0) {
      // Flame + pot.
      ctx.fillStyle = '#ff8c2e';
      ctx.beginPath();
      ctx.moveTo(bx - 18, s.y + 96); ctx.quadraticCurveTo(bx - 24, s.y + 78, bx, s.y + 70);
      ctx.quadraticCurveTo(bx + 24, s.y + 78, bx + 18, s.y + 96); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#9aa3ad';
      ctx.beginPath(); ctx.arc(bx, s.y + 66, 26, Math.PI, 0); ctx.fill();
      ctx.fillRect(bx - 26, s.y + 62, 52, 8);
      drawIngredient(ctx, slot.item, bx, s.y + 62, 12);
      if (slot.remaining > 0) {
        progressBar(ctx, bx - 30, s.y + 34, 60, 10, 1 - slot.remaining / slot.total, '#ff8c2e');
      } else {
        text(ctx, `${preparedLabel(preparedId(slot.item))} ✓`, bx, s.y + 34, 12, '#ffd9a8', 'bold');
      }
    }
  }
}

function drawAssembly(ctx, game, highlight) {
  const s = STATIONS.find((st) => st.id === 'assembly');
  drawCounter(ctx, s, highlight);
  for (let i = 0; i < 2; i++) {
    const px = s.x + 95 + i * 195;
    const py = s.y + 68;
    const items = game.plates[i];
    const recipe = recipeForItems(items);
    if (recipe) {
      ctx.shadowColor = '#ffd94d'; ctx.shadowBlur = 18;
    }
    ctx.fillStyle = '#fdf6e7';
    ctx.beginPath(); ctx.ellipse(px, py, 72, 30, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = recipe ? '#e8a91c' : '#cbb98d'; ctx.lineWidth = recipe ? 4 : 2;
    ctx.beginPath(); ctx.ellipse(px, py, 72, 30, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;
    items.forEach((it, j) => {
      const off = (j - (items.length - 1) / 2) * 42;
      drawIngredient(ctx, it, px + off, py - 2, 17);
    });
    if (recipe) {
      ctx.fillStyle = '#e8a91c';
      rr(ctx, px - 52, py - 44, 104, 20, 10); ctx.fill();
      text(ctx, `✓ ${recipe.name}`, px, py - 34, 12, '#2b1d12', 'bold');
    } else if (items.length === 0) {
      text(ctx, 'empty plate', px, py, 13, '#b09a7a', 'normal');
    }
  }
}

function drawTrash(ctx, highlight) {
  const s = STATIONS.find((st) => st.id === 'trash');
  drawCounter(ctx, s, highlight);
  ctx.fillStyle = '#7d838c';
  rr(ctx, s.x + 55, s.y + 34, 60, 52, 8); ctx.fill();
  ctx.fillStyle = '#5d636c';
  rr(ctx, s.x + 48, s.y + 28, 74, 12, 6); ctx.fill();
  text(ctx, 'drop to toss', s.x + 85, s.y + 66, 12, '#fff', 'bold');
}

function drawServe(ctx, game, highlight) {
  const s = STATIONS.find((st) => st.id === 'serve');
  const holdingPlate = game.chef.holding && game.chef.holding.kind === 'plate';
  drawCounter(ctx, s, holdingPlate || highlight);
  ctx.fillStyle = '#c0392b';
  rr(ctx, s.x + 10, s.y + 6, s.w - 20, 24, 8); ctx.fill();
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i % 2 ? '#f3e2c2' : '#c0392b';
    ctx.beginPath(); ctx.arc(s.x + 40 + i * 60, s.y + 30, 14, 0, Math.PI); ctx.fill();
  }
  // Service bell.
  ctx.fillStyle = '#f6c445';
  ctx.beginPath(); ctx.arc(s.x + s.w / 2, s.y + 62, 16, Math.PI, 0); ctx.fill();
  ctx.fillRect(s.x + s.w / 2 - 20, s.y + 62, 40, 5);
  ctx.fillStyle = '#2b1d12';
  ctx.beginPath(); ctx.arc(s.x + s.w / 2, s.y + 70, 4, 0, Math.PI * 2); ctx.fill();
  text(ctx, holdingPlate ? 'SERVE IT!  (E)' : 'serving window', s.x + s.w / 2, s.y + 84, 14, holdingPlate ? '#ffd94d' : '#fff7e8', 'bold');
}

function drawOrders(ctx, game) {
  ctx.fillStyle = '#5a3a1a';
  rr(ctx, 12, 64, VIEW_W - 24, 104, 12); ctx.fill();
  text(ctx, 'ORDER BOARD', 16, 82, 15, '#ffd94d', 'bold', 'left');
  text(ctx, 'serve before patience', 16, 102, 12, '#d9b98a', 'normal', 'left');
  text(ctx, 'runs out!', 16, 118, 12, '#d9b98a', 'normal', 'left');
  if (game.orders.length === 0) {
    text(ctx, 'No orders right now — a breather!', 640, 116, 16, '#f3e2c2', 'normal');
    return;
  }
  game.orders.forEach((o, i) => {
    const x = 250 + i * 330;
    const y = 72;
    const w = 310;
    const h = 88;
    const frac = o.patience / o.maxPatience;
    ctx.fillStyle = '#fdf6e7';
    rr(ctx, x, y, w, h, 10); ctx.fill();
    ctx.fillStyle = frac < 0.3 ? '#e2483d' : '#2b1d12';
    text(ctx, `#${o.id}  ${o.name}`, x + 14, y + 18, 16, frac < 0.3 ? '#e2483d' : '#2b1d12', 'bold', 'left');
    text(ctx, `$${o.reward} + tip`, x + w - 12, y + 18, 14, '#8a5a28', 'bold', 'right');
    o.items.forEach((it, j) => drawIngredient(ctx, it, x + 30 + j * 44, y + 52, 16));
    progressBar(ctx, x + 14, y + 74, w - 28, 8, frac, frac < 0.3 ? '#e2483d' : '#58b368');
  });
}

function drawHud(ctx, game) {
  ctx.fillStyle = '#2b1d12';
  ctx.fillRect(0, 0, VIEW_W, 60);
  text(ctx, 'Golden Ladle Bistro', 16, 30, 24, '#ffd94d', 'bold', 'left');
  const low = game.timeLeft < 30;
  text(ctx, `⏱ ${fmtTime(game.timeLeft)}`, 640, 30, 28, low ? '#ff6b5e' : '#fff7e8', 'bold');
  progressBar(ctx, 520, 48, 240, 6, game.timeLeft / 180, low ? '#e2483d' : '#58b368');
  text(ctx, `Score ${game.score}`, 960, 22, 18, '#fff7e8', 'bold', 'left');
  text(ctx, `Served ${game.served}   •   Combo x${game.combo}   •   Strikes ${'✕'.repeat(game.strikes)}${'○'.repeat(3 - game.strikes)}`, 960, 44, 14, '#d9b98a', 'normal', 'left');
}

function drawChef(ctx, game, now) {
  const c = game.chef;
  const bob = Math.sin(now / 160) * 1.5;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(c.x, c.y + 26, 22, 8, 0, 0, Math.PI * 2); ctx.fill();
  // Body / apron.
  ctx.fillStyle = '#fdf6e7';
  rr(ctx, c.x - 18, c.y - 6 + bob, 36, 34, 12); ctx.fill();
  ctx.fillStyle = '#3f9e4d';
  ctx.fillRect(c.x - 18, c.y + 12 + bob, 36, 6);
  // Head.
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath(); ctx.arc(c.x, c.y - 16 + bob, 15, 0, Math.PI * 2); ctx.fill();
  // Toque.
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(c.x - 9, c.y - 28 + bob, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(c.x, c.y - 32 + bob, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(c.x + 9, c.y - 28 + bob, 8, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(c.x - 14, c.y - 30 + bob, 28, 8);
  // Face.
  ctx.fillStyle = '#2b1d12';
  ctx.beginPath(); ctx.arc(c.x - 5 * c.face, c.y - 17 + bob, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(c.x + 5 * c.face, c.y - 17 + bob, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2b1d12'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(c.x + 2 * c.face, c.y - 11 + bob, 5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  // Carried item above the head.
  if (c.holding) {
    ctx.fillStyle = 'rgba(255,247,232,0.95)';
    ctx.beginPath(); ctx.arc(c.x, c.y - 58 + bob, 24, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c98f4e'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(c.x, c.y - 58 + bob, 24, 0, Math.PI * 2); ctx.stroke();
    if (c.holding.kind === 'plate') {
      const recipe = recipeById(c.holding.recipeId);
      recipe.items.forEach((it, j) => {
        const off = (j - (recipe.items.length - 1) / 2) * 15;
        drawIngredient(ctx, it, c.x + off, c.y - 58 + bob, 9);
      });
    } else {
      drawIngredient(ctx, c.holding.id, c.x, c.y - 58 + bob, 15);
    }
  }
}

function drawToasts(ctx, game) {
  game.toasts.forEach((t, i) => {
    ctx.globalAlpha = Math.min(1, t.ttl);
    ctx.fillStyle = 'rgba(43,29,18,0.92)';
    const w = Math.min(560, 24 + t.text.length * 8.4);
    rr(ctx, 640 - w / 2, 748 - i * 30, w, 26, 13); ctx.fill();
    text(ctx, t.text, 640, 762 - i * 30, 14, '#fff7e8', 'bold');
    ctx.globalAlpha = 1;
  });
  for (const p of game.popups) {
    ctx.globalAlpha = Math.min(1, p.ttl);
    text(ctx, p.text, p.x, p.y - (1.4 - p.ttl) * 40, 22, p.color, 'bold');
    ctx.globalAlpha = 1;
  }
}

function drawHint(ctx, game, nearest) {
  if (game.mode !== 'playing') return;
  const holding = game.chef.holding ? holdingLabel(game.chef.holding) : 'empty hands';
  const near = nearest ? nearest.label : 'walk to a counter';
  text(ctx, `Carrying: ${holding}    •    Nearest: ${near}  —  press E or click`, 640, 186, 14, '#5a3a1a', 'bold');
}

function overlay(ctx, title, lines, foot) {
  ctx.fillStyle = 'rgba(20,12,6,0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#fdf6e7';
  rr(ctx, 290, 170, 700, 440, 18); ctx.fill();
  ctx.strokeStyle = '#e8a91c'; ctx.lineWidth = 4;
  rr(ctx, 290, 170, 700, 440, 18); ctx.stroke();
  text(ctx, title, 640, 220, 40, '#b4632e', 'bold');
  lines.forEach((l, i) => text(ctx, l, 640, 280 + i * 34, 18, '#2b1d12', i === 0 ? 'bold' : 'normal'));
  text(ctx, foot, 640, 570, 16, '#8a5a28', 'bold');
}

export function render(ctx, game, nearest, now) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  drawFloor(ctx);
  drawHud(ctx, game);
  drawOrders(ctx, game);
  for (const s of STATIONS) {
    const hi = nearest && nearest.id === s.id;
    if (s.kind === 'crate') drawCrate(ctx, s, hi);
    else if (s.kind === 'board') drawBoard(ctx, game, hi);
    else if (s.kind === 'stove') drawStove(ctx, game, hi);
    else if (s.kind === 'assembly') drawAssembly(ctx, game, hi);
    else if (s.kind === 'trash') drawTrash(ctx, hi);
    else if (s.kind === 'serve') drawServe(ctx, game, hi);
  }
  drawChef(ctx, game, now);
  drawHint(ctx, game, nearest);
  drawToasts(ctx, game);

  if (game.mode === 'title') {
    overlay(ctx, 'Golden Ladle Bistro', [
      'A 3-minute dinner shift. Cook fast, serve faster.',
      'Move: WASD / arrows, or click the floor to walk.',
      'Use a counter: walk up and press E, or click the counter.',
      'Crates give ingredients · board chops · stove cooks ·',
      'plating counter builds the dish · window serves it.',
      'Three walked-out customers end the shift early.',
    ], 'Press Enter or click to start your shift');
  } else if (game.mode === 'paused') {
    overlay(ctx, 'Paused', ['Take a breath. The orders wait —', 'well, actually, they do not. Hurry back!'], 'Press P to resume');
  } else if (game.mode === 'over') {
    overlay(ctx, 'Shift Over!', [
      game.overReason,
      `Score: ${game.score}   •   Dishes served: ${game.served}   •   Best combo: x${game.bestCombo}`,
      `Walk-outs: ${game.expired}   •   Tips earned along the way are in the score.`,
      'Thanks for cooking at the Golden Ladle Bistro!',
    ], 'Press R to cook another shift');
  }
}
