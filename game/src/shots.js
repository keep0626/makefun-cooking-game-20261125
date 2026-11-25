// Golden Ladle Bistro — deterministic mid-shift scenes for the screenshots.
// These only pre-fill the same state a real shift reaches (orders on the
// board, food on the board and stove, plates mid-assembly and ready); the
// game then runs on from there with its normal timers.

import { spawnOrder } from './state.js';

function baseScene(game, timeLeft, score, served, combo) {
  game.mode = 'playing';
  game.timeLeft = timeLeft;
  game.score = score;
  game.served = served;
  game.combo = combo;
  game.bestCombo = Math.max(game.bestCombo, combo);
  game.orders = [];
  game.spawnTimer = 60;
  game.plates = [[], []];
  game.board = { item: null, remaining: 0, total: 0 };
  game.stove = { item: null, remaining: 0, total: 0 };
  game.toasts = [];
  game.popups = [];
}

export function seedDemo(game, variant) {
  if (variant === '1') {
    // Cover: everything at once — orders, chopping, cooking, a dish
    // mid-assembly, a finished plate ready to serve, and the timer running.
    baseScene(game, 142, 120, 3, 2);
    spawnOrder(game, 'pasta');
    spawnOrder(game, 'salad');
    spawnOrder(game, 'omelette');
    game.orders[0].patience = 55;
    game.orders[1].patience = 40;
    game.orders[2].patience = 62;
    game.board = { item: 'tomato', remaining: 1.1, total: 2.5 };
    game.stove = { item: 'pasta', remaining: 1.6, total: 3 };
    game.plates = [['tomato-chopped', 'cheese'], ['tomato-chopped', 'lettuce-chopped']];
    game.chef.x = 1130;
    game.chef.y = 540;
    game.chef.holding = { kind: 'item', id: 'lettuce-chopped' };
    game.popups = [{ x: 1060, y: 560, text: '+40', color: '#ffd94d', ttl: 1.4 }];
  } else if (variant === '2') {
    // The rush: one order about to walk out, egg on the stove, a finished
    // omelette waiting on the plating counter.
    baseScene(game, 68, 215, 6, 3);
    spawnOrder(game, 'breakfast');
    spawnOrder(game, 'pasta');
    spawnOrder(game, 'melt');
    game.orders[0].patience = 12;
    game.orders[1].patience = 30;
    game.orders[2].patience = 55;
    game.board = { item: 'lettuce', remaining: 0.8, total: 2.5 };
    game.stove = { item: 'egg', remaining: 1.2, total: 3 };
    game.plates = [['egg-cooked', 'cheese'], ['bread']];
    game.chef.x = 560;
    game.chef.y = 520;
    game.chef.holding = { kind: 'item', id: 'egg' };
  } else {
    // Serving: the chef carries a finished Sunrise Plate to the window
    // while another dish waits mid-assembly on the counter.
    baseScene(game, 95, 180, 5, 2);
    spawnOrder(game, 'salad');
    spawnOrder(game, 'breakfast');
    game.orders[0].patience = 60;
    game.orders[1].patience = 45;
    game.plates = [['egg-cooked', 'bread', 'tomato-chopped'], ['tomato-chopped']];
    game.chef.x = 940;
    game.chef.y = 740;
    game.chef.holding = { kind: 'plate', recipeId: 'breakfast' };
    game.popups = [{ x: 1060, y: 560, text: '+45', color: '#ffd94d', ttl: 1.4 }];
    game.toasts = [{ text: 'Sunrise Plate is ready — serve it at the window!', ttl: 2.2 }];
  }
}
