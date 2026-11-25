# Golden Ladle Bistro — a cooking game

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/keep0626/makefun-cooking-game-20261125/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/keep0626/makefun-cooking-game-20261125/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

A complete original cooking game that runs from static files: open
`game/index.html` in desktop Chrome and play. No network requests, no
libraries, all art drawn in code and all sounds synthesized live.

## How to play

You are the chef of the Golden Ladle Bistro on a 3-minute dinner shift.

- **Move** with WASD or arrow keys, or click anywhere on the floor to walk
  there. Click a station (or walk up and press **E** / **Space**) to use it.
- **Take ingredients** from the crates along the top wall: tomato, lettuce,
  cheese, bread, pasta, egg.
- **Chop** tomato and lettuce on the chopping board; **cook** pasta and egg
  on the stove. Cheese and bread are ready as they are.
- **Assemble** dishes on the two plating spots: add prepared ingredients
  until a plate matches an order ticket, then pick the finished plate up.
- **Serve** the finished plate at the serving window before the order's
  patience runs out. Fast serves pay a tip; three expired orders end the
  shift early.
- **P** pauses, **M** mutes, **R** restarts after the shift ends.

## Recipes

| Dish | Needs |
| --- | --- |
| Garden Salad | chopped tomato + chopped lettuce |
| Golden Omelette | cooked egg + cheese |
| Cheesy Stack | bread + cheese + chopped lettuce |
| Tomato Pasta | cooked pasta + chopped tomato + cheese |
| Sunrise Plate | cooked egg + bread + chopped tomato |

## Files

- `game/index.html` — the page, loads the modules under `game/src/`.
- `game/src/config.js` — ingredients, recipes, station layout, tuning.
- `game/src/state.js` — the whole game state: orders, stations, serving.
- `game/src/input.js` — keyboard and mouse controls.
- `game/src/audio.js` — synthesized sound effects (WebAudio, no files).
- `game/src/render.js` — all canvas drawing: kitchen, tickets, chef.
- `game/src/shots.js` — deterministic demo states used for screenshots.
- `game/src/selftest.js` — scripted playthrough that plays one full order.
- `game/src/main.js` — boot and the game loop.
- `main.ts` — the entry program: copies `game/` and `screenshots/` to
  `/output` and writes `dossier.json` with the kit's `buildDossier`.

## Verify

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Serve `game/` with any static server and open it in a browser. With
`?selftest=1` the page plays one order by itself and reports PASS in the
document title; `?demo=1`, `?demo=2` and `?demo=3` open mid-shift scenes
used for the screenshots.

## License

MIT — see `LICENSE`.
