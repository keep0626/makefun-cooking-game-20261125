// Golden Ladle Bistro — scripted playthrough used by ?selftest=1.
// It drives the same state functions the player uses (walk to a counter,
// use it, let time pass) through one full order — tomato and lettuce in,
// chopped, plated as a Garden Salad, served — plus a stove check — and
// reports PASS or FAIL in the document title for headless verification.

import { stationById } from './config.js';
import { interactWith, setChefPos, spawnOrder, startShift, updateGame } from './state.js';

function check(cond, what) {
  if (!cond) throw new Error(`selftest failed at: ${what}`);
}

export function runSelfTest(game) {
  try {
    startShift(game);
    check(game.mode === 'playing', 'shift starts');
    game.orders = [];
    spawnOrder(game, 'salad');
    check(game.orders.length === 1 && game.orders[0].recipeId === 'salad', 'salad order on the board');

    // Tomato: crate -> board -> chop -> pick up -> plate it.
    setChefPos(game, 110, 310);
    interactWith(game, stationById('crate-tomato'));
    check(game.chef.holding && game.chef.holding.id === 'tomato', 'holding raw tomato');
    setChefPos(game, 185, 490);
    interactWith(game, stationById('board'));
    check(game.board.item === 'tomato' && game.board.remaining > 0, 'tomato chopping');
    updateGame(game, new Set(), 3);
    check(game.board.remaining === 0, 'chopping finished');
    interactWith(game, stationById('board'));
    check(game.chef.holding && game.chef.holding.id === 'tomato-chopped', 'holding chopped tomato');
    setChefPos(game, 1025, 490);
    interactWith(game, stationById('assembly'));
    check(game.plates[0].length === 1 && game.plates[0][0] === 'tomato-chopped', 'tomato on the plate');

    // Lettuce: same route, then plate it beside the tomato.
    setChefPos(game, 278, 310);
    interactWith(game, stationById('crate-lettuce'));
    check(game.chef.holding && game.chef.holding.id === 'lettuce', 'holding raw lettuce');
    setChefPos(game, 185, 490);
    interactWith(game, stationById('board'));
    updateGame(game, new Set(), 3);
    interactWith(game, stationById('board'));
    check(game.chef.holding && game.chef.holding.id === 'lettuce-chopped', 'holding chopped lettuce');
    setChefPos(game, 1025, 490);
    interactWith(game, stationById('assembly'));
    check(game.plates[0].length === 2, 'salad assembled on the plate');

    // Pick the finished plate up and serve it.
    interactWith(game, stationById('assembly'));
    check(game.chef.holding && game.chef.holding.kind === 'plate'
      && game.chef.holding.recipeId === 'salad', 'holding the finished salad plate');
    const scoreBefore = game.score;
    setChefPos(game, 1060, 730);
    interactWith(game, stationById('serve'));
    check(game.served === 1, 'one dish served');
    check(game.score > scoreBefore, 'score went up after serving');

    // Stove check: cook an egg and collect it cooked.
    setChefPos(game, 950, 310);
    interactWith(game, stationById('crate-egg'));
    check(game.chef.holding && game.chef.holding.id === 'egg', 'holding a raw egg');
    setChefPos(game, 580, 490);
    interactWith(game, stationById('stove'));
    check(game.stove.item === 'egg' && game.stove.remaining > 0, 'egg cooking');
    updateGame(game, new Set(), 3.5);
    interactWith(game, stationById('stove'));
    check(game.chef.holding && game.chef.holding.id === 'egg-cooked', 'holding a cooked egg');

    document.title = `SELFTEST PASS served=${game.served} score=${game.score}`;
  } catch (err) {
    document.title = `SELFTEST FAIL ${err.message}`;
  }
}
