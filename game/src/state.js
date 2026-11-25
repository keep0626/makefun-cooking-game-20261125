// Golden Ladle Bistro — the whole game state and its rules.
// Nothing here touches the canvas or the network: it only moves numbers and
// items around, so the self-test can drive a full order through it directly.

import {
  CHEF_RADIUS, CHEF_SPEED, INGREDIENTS, INTERACT_RANGE, MAX_ORDERS,
  MAX_STRIKES, ORDER_PATIENCE, ORDER_SPAWN_SECONDS, RECIPES, SHIFT_SECONDS,
  SOLIDS, STATIONS, preparedId, recipeById, recipeForItems,
} from './config.js';

let orderSeq = 0;

export function createGame() {
  return {
    mode: 'title', // 'title' | 'playing' | 'paused' | 'over'
    timeLeft: SHIFT_SECONDS,
    score: 0,
    served: 0,
    expired: 0,
    strikes: 0,
    combo: 0,
    bestCombo: 0,
    orders: [],
    spawnTimer: 6,
    chef: { x: 640, y: 540, tx: null, ty: null, holding: null, pendingStation: null, face: 1 },
    board: { item: null, remaining: 0, total: 0 },
    stove: { item: null, remaining: 0, total: 0 },
    // Two plating spots on the assembly counter; each holds prepared items
    // until they match a recipe, when the plate turns "ready to serve".
    plates: [[], []],
    toasts: [],
    popups: [],
    sfx: [],
    muted: false,
    overReason: '',
    elapsed: 0,
  };
}

// A carried thing: { kind: 'item', id } for a raw or prepared ingredient,
// or { kind: 'plate', recipeId } for a finished dish ready to serve.
export function holdingLabel(holding) {
  if (!holding) return '';
  if (holding.kind === 'plate') return `${recipeById(holding.recipeId).name} (ready!)`;
  const ing = INGREDIENTS[holding.id];
  if (ing) return ing.label;
  return holding.id.replace('-chopped', ' (chopped)').replace('-cooked', ' (cooked)');
}

export function toast(game, text) {
  game.toasts.push({ text, ttl: 2.2 });
  if (game.toasts.length > 3) game.toasts.shift();
}

export function popup(game, x, y, text, color) {
  game.popups.push({ x, y, text, color: color || '#ffd94d', ttl: 1.4 });
}

function pickRecipe(excludeId) {
  const pool = RECIPES.filter((r) => r.id !== excludeId);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function spawnOrder(game, recipeId) {
  if (game.orders.length >= MAX_ORDERS) return null;
  const recipe = recipeId ? recipeById(recipeId) : pickRecipe(
    game.orders.length ? game.orders[game.orders.length - 1].recipeId : null,
  );
  const order = {
    id: ++orderSeq,
    recipeId: recipe.id,
    name: recipe.name,
    items: recipe.items,
    reward: recipe.reward,
    patience: ORDER_PATIENCE,
    maxPatience: ORDER_PATIENCE,
  };
  game.orders.push(order);
  return order;
}

export function startShift(game) {
  const fresh = createGame();
  Object.assign(game, fresh, { mode: 'playing', muted: game.muted });
  spawnOrder(game, 'salad');
  spawnOrder(game, 'omelette');
  game.spawnTimer = ORDER_SPAWN_SECONDS;
  game.sfx.push('start');
}

function distanceToStation(chef, station) {
  const cx = Math.max(station.x, Math.min(chef.x, station.x + station.w));
  const cy = Math.max(station.y, Math.min(chef.y, station.y + station.h));
  return Math.hypot(chef.x - cx, chef.y - cy);
}

export function nearestStation(game) {
  let best = null;
  let bestD = Infinity;
  for (const s of STATIONS) {
    const d = distanceToStation(game.chef, s);
    if (d < bestD) { bestD = d; best = s; }
  }
  return bestD <= INTERACT_RANGE + CHEF_RADIUS ? best : null;
}

export function setChefPos(game, x, y) {
  game.chef.x = x;
  game.chef.y = y;
  game.chef.tx = null;
  game.chef.ty = null;
  game.chef.pendingStation = null;
}

// The chef walks to a point; on arrival, if a station was clicked, use it.
export function walkTo(game, x, y, stationId) {
  game.chef.tx = x;
  game.chef.ty = y;
  game.chef.pendingStation = stationId || null;
}

function resolveSolids(game) {
  const c = game.chef;
  c.x = Math.max(24, Math.min(1256, c.x));
  c.y = Math.max(196, Math.min(776, c.y));
  for (const s of SOLIDS) {
    const nx = Math.max(s.x - CHEF_RADIUS, Math.min(c.x, s.x + s.w + CHEF_RADIUS));
    const ny = Math.max(s.y - CHEF_RADIUS, Math.min(c.y, s.y + s.h + CHEF_RADIUS));
    const dx = c.x - nx;
    const dy = c.y - ny;
    const d = Math.hypot(dx, dy);
    if (d < CHEF_RADIUS && d > 0.001) {
      c.x = nx + (dx / d) * CHEF_RADIUS;
      c.y = ny + (dy / d) * CHEF_RADIUS;
    } else if (d <= 0.001 && c.x > s.x - CHEF_RADIUS && c.x < s.x + s.w + CHEF_RADIUS
      && c.y > s.y - CHEF_RADIUS && c.y < s.y + s.h + CHEF_RADIUS) {
      c.y = s.y + s.h + CHEF_RADIUS;
    }
  }
}

function moveChef(game, dx, dy, dt) {
  const c = game.chef;
  if (dx === 0 && dy === 0) return;
  const len = Math.hypot(dx, dy);
  c.x += (dx / len) * CHEF_SPEED * dt;
  c.y += (dy / len) * CHEF_SPEED * dt;
  c.face = dx < 0 ? -1 : dx > 0 ? 1 : c.face;
  resolveSolids(game);
}

function updateMovement(game, keys, dt) {
  const c = game.chef;
  let dx = 0;
  let dy = 0;
  if (keys.has('arrowleft') || keys.has('a')) dx -= 1;
  if (keys.has('arrowright') || keys.has('d')) dx += 1;
  if (keys.has('arrowup') || keys.has('w')) dy -= 1;
  if (keys.has('arrowdown') || keys.has('s')) dy += 1;
  if (dx !== 0 || dy !== 0) {
    c.tx = null; c.ty = null; c.pendingStation = null;
    moveChef(game, dx, dy, dt);
    return;
  }
  if (c.tx !== null && c.ty !== null) {
    const d = Math.hypot(c.tx - c.x, c.ty - c.y);
    if (d < 8) {
      c.tx = null; c.ty = null;
      if (c.pendingStation) {
        const station = STATIONS.find((s) => s.id === c.pendingStation);
        c.pendingStation = null;
        if (station) interactWith(game, station);
      }
      return;
    }
    moveChef(game, c.tx - c.x, c.ty - c.y, dt);
  }
}

// One interaction with a station, from the keyboard or a mouse click.
export function interactWith(game, station) {
  const chef = game.chef;
  const holding = chef.holding;

  if (station.kind === 'crate') {
    if (holding) { toast(game, 'Hands full — serve or trash something first'); game.sfx.push('error'); return; }
    chef.holding = { kind: 'item', id: station.ingredient };
    game.sfx.push('pickup');
    return;
  }

  if (station.kind === 'board' || station.kind === 'stove') {
    const slot = station.kind === 'board' ? game.board : game.stove;
    const wantPrep = station.kind === 'board' ? 'chop' : 'cook';
    if (slot.item && slot.remaining <= 0) {
      if (holding) { toast(game, 'Hands full — put this down first'); game.sfx.push('error'); return; }
      chef.holding = { kind: 'item', id: preparedId(slot.item) };
      slot.item = null;
      game.sfx.push('pickup');
      return;
    }
    if (slot.item) { toast(game, 'Still working — wait for the timer'); return; }
    if (!holding || holding.kind !== 'item') { toast(game, station.kind === 'board' ? 'Bring something to chop' : 'Bring something to cook'); return; }
    const ing = INGREDIENTS[holding.id];
    if (!ing || ing.prep !== wantPrep) {
      toast(game, ing && ing.prep === 'none'
        ? `${ing.label} needs no ${wantPrep === 'chop' ? 'chopping' : 'cooking'} — plate it straight away`
        : `The ${station.kind === 'board' ? 'board' : 'stove'} can't take that`);
      game.sfx.push('error');
      return;
    }
    slot.item = holding.id;
    slot.total = ing.prepSeconds;
    slot.remaining = ing.prepSeconds;
    chef.holding = null;
    game.sfx.push(wantPrep === 'chop' ? 'chop' : 'sizzle');
    return;
  }

  if (station.kind === 'assembly') {
    if (holding && holding.kind === 'item') {
      const prepared = holding.id;
      const isPrepared = prepared.includes('-') || INGREDIENTS[prepared].prep === 'none';
      if (!isPrepared) {
        toast(game, `${INGREDIENTS[prepared].label} still needs ${INGREDIENTS[prepared].prep === 'chop' ? 'chopping' : 'cooking'} first`);
        game.sfx.push('error');
        return;
      }
      // Add to the first plating spot that is not already a finished dish.
      let slot = game.plates.find((p) => !recipeForItems(p) && p.length < 3);
      if (!slot) { toast(game, 'Both plating spots are full'); game.sfx.push('error'); return; }
      slot.push(prepared);
      chef.holding = null;
      const done = recipeForItems(slot);
      game.sfx.push(done ? 'ding' : 'place');
      if (done) toast(game, `${done.name} is ready — pick it up and serve it!`);
      return;
    }
    if (holding && holding.kind === 'plate') { toast(game, 'Serve that plate at the window first'); return; }
    // Empty hands: pick up a finished plate, or take the last item back.
    const readyIdx = game.plates.findIndex((p) => recipeForItems(p));
    if (readyIdx >= 0) {
      const recipe = recipeForItems(game.plates[readyIdx]);
      game.plates[readyIdx] = [];
      chef.holding = { kind: 'plate', recipeId: recipe.id };
      game.sfx.push('pickup');
      return;
    }
    const filledIdx = game.plates.findIndex((p) => p.length > 0);
    if (filledIdx >= 0) {
      chef.holding = { kind: 'item', id: game.plates[filledIdx].pop() };
      game.sfx.push('pickup');
      return;
    }
    toast(game, 'Plating counter is empty — bring prepared food');
    return;
  }

  if (station.kind === 'serve') {
    if (!holding || holding.kind !== 'plate') {
      toast(game, 'Bring a finished plate to the serving window');
      game.sfx.push('error');
      return;
    }
    const idx = game.orders.findIndex((o) => o.recipeId === holding.recipeId);
    if (idx < 0) { toast(game, 'Nobody ordered that dish right now'); game.sfx.push('error'); return; }
    const order = game.orders[idx];
    game.orders.splice(idx, 1);
    const tip = Math.max(0, Math.round((order.patience / order.maxPatience) * 10));
    const earned = order.reward + tip;
    game.score += earned;
    game.served += 1;
    game.combo += 1;
    game.bestCombo = Math.max(game.bestCombo, game.combo);
    const bonus = game.combo >= 3 ? 5 : 0;
    game.score += bonus;
    popup(game, station.x + 60, station.y - 14, `+${earned}${bonus ? ` (+${bonus} combo!)` : ''}`, '#ffd94d');
    game.sfx.push('coin');
    chef.holding = null;
    return;
  }

  if (station.kind === 'trash') {
    if (!holding) { toast(game, 'Nothing to throw away'); return; }
    chef.holding = null;
    game.sfx.push('trash');
    return;
  }
}

export function interact(game) {
  const station = nearestStation(game);
  if (!station) { toast(game, 'Walk up to a counter first'); return; }
  interactWith(game, station);
}

function endShift(game, reason) {
  game.mode = 'over';
  game.overReason = reason;
  game.sfx.push('over');
}

export function updateGame(game, keys, dt) {
  if (game.mode !== 'playing') return;
  game.elapsed += dt;
  game.timeLeft -= dt;
  if (game.timeLeft <= 0) {
    game.timeLeft = 0;
    endShift(game, 'Shift over! The dinner rush is done.');
    return;
  }
  updateMovement(game, keys, dt);

  // Workstations finish their timers.
  for (const slot of [game.board, game.stove]) {
    if (slot.item && slot.remaining > 0) {
      slot.remaining -= dt;
      if (slot.remaining <= 0) {
        slot.remaining = 0;
        game.sfx.push('ding');
        popup(game, 300, 330, `${preparedId(slot.item)} ready!`, '#8be28b');
      }
    }
  }

  // New orders walk in while there is room on the board.
  game.spawnTimer -= dt;
  if (game.spawnTimer <= 0) {
    game.spawnTimer = ORDER_SPAWN_SECONDS;
    spawnOrder(game);
  }

  // Orders lose patience; an expired order is a strike.
  for (let i = game.orders.length - 1; i >= 0; i--) {
    const o = game.orders[i];
    o.patience -= dt;
    if (o.patience <= 0) {
      game.orders.splice(i, 1);
      game.expired += 1;
      game.strikes += 1;
      game.combo = 0;
      game.score = Math.max(0, game.score - 10);
      toast(game, `${o.name} walked out! (-10, strike ${game.strikes}/${MAX_STRIKES})`);
      game.sfx.push('error');
      if (game.strikes >= MAX_STRIKES) {
        endShift(game, 'Three customers walked out — the bistro closes early.');
        return;
      }
    }
  }

  for (const t of game.toasts) t.ttl -= dt;
  game.toasts = game.toasts.filter((t) => t.ttl > 0);
  for (const p of game.popups) p.ttl -= dt;
  game.popups = game.popups.filter((p) => p.ttl > 0);
}
