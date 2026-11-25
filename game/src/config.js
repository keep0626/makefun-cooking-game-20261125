// Golden Ladle Bistro — tuning, ingredients, recipes and the kitchen layout.
// Every number the game runs on lives here, so the rest of the code only
// reads it and never hard-codes a balance value of its own.

export const VIEW_W = 1280;
export const VIEW_H = 800;
export const SHIFT_SECONDS = 180;
export const MAX_ORDERS = 3;
export const ORDER_PATIENCE = 75;
export const ORDER_SPAWN_SECONDS = 14;
export const CHEF_SPEED = 280;
export const CHEF_RADIUS = 20;
export const INTERACT_RANGE = 78;
export const MAX_STRIKES = 3;

// An ingredient's prep is what a raw item needs before it can go on a plate:
// 'chop' on the board, 'cook' on the stove, 'none' straight from the crate.
export const INGREDIENTS = {
  tomato: { label: 'Tomato', color: '#e2483d', dark: '#a92c24', prep: 'chop', prepSeconds: 2.5, prepLabel: 'chop' },
  lettuce: { label: 'Lettuce', color: '#58b368', dark: '#2f7a3e', prep: 'chop', prepSeconds: 2.5, prepLabel: 'chop' },
  cheese: { label: 'Cheese', color: '#f6c445', dark: '#c08f16', prep: 'none', prepSeconds: 0, prepLabel: '' },
  bread: { label: 'Bread', color: '#c98f4e', dark: '#8a5a28', prep: 'none', prepSeconds: 0, prepLabel: '' },
  pasta: { label: 'Pasta', color: '#f2d06b', dark: '#b98f2e', prep: 'cook', prepSeconds: 3, prepLabel: 'cook' },
  egg: { label: 'Egg', color: '#f7ead0', dark: '#cbb98d', prep: 'cook', prepSeconds: 3, prepLabel: 'cook' },
};

// A prepared item id is either the raw id (no prep needed) or
// '<ingredient>-chopped' / '<ingredient>-cooked'.
export function preparedId(ingredientId) {
  const ing = INGREDIENTS[ingredientId];
  if (!ing) return ingredientId;
  if (ing.prep === 'chop') return `${ingredientId}-chopped`;
  if (ing.prep === 'cook') return `${ingredientId}-cooked`;
  return ingredientId;
}

export function preparedLabel(prepared) {
  if (prepared.endsWith('-chopped')) {
    const base = prepared.slice(0, -8);
    return `Chopped ${INGREDIENTS[base].label}`;
  }
  if (prepared.endsWith('-cooked')) {
    const base = prepared.slice(0, -7);
    return `Cooked ${INGREDIENTS[base].label}`;
  }
  return INGREDIENTS[prepared] ? INGREDIENTS[prepared].label : prepared;
}

export function preparedColor(prepared) {
  if (prepared.endsWith('-chopped')) return INGREDIENTS[prepared.slice(0, -8)].color;
  if (prepared.endsWith('-cooked')) return INGREDIENTS[prepared.slice(0, -7)].color;
  return INGREDIENTS[prepared] ? INGREDIENTS[prepared].color : '#cccccc';
}

export function baseIngredientOf(prepared) {
  if (prepared.endsWith('-chopped')) return prepared.slice(0, -8);
  if (prepared.endsWith('-cooked')) return prepared.slice(0, -7);
  return prepared;
}

export const RECIPES = [
  { id: 'salad', name: 'Garden Salad', items: ['tomato-chopped', 'lettuce-chopped'], reward: 25 },
  { id: 'omelette', name: 'Golden Omelette', items: ['egg-cooked', 'cheese'], reward: 30 },
  { id: 'melt', name: 'Cheesy Stack', items: ['bread', 'cheese', 'lettuce-chopped'], reward: 35 },
  { id: 'pasta', name: 'Tomato Pasta', items: ['pasta-cooked', 'tomato-chopped', 'cheese'], reward: 40 },
  { id: 'breakfast', name: 'Sunrise Plate', items: ['egg-cooked', 'bread', 'tomato-chopped'], reward: 45 },
];

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id);
}

// Does this exact pile of prepared items make a recipe? Order does not matter.
export function recipeForItems(items) {
  const sorted = [...items].sort().join('|');
  return RECIPES.find((r) => [...r.items].sort().join('|') === sorted) || null;
}

// Stations are the solid counters of the kitchen. The chef walks the floor
// between them; each one is used by walking up and pressing E (or clicking it).
// kind: 'crate' | 'board' | 'stove' | 'assembly' | 'serve' | 'trash' | 'decor'
export const STATIONS = [
  { id: 'crate-tomato', kind: 'crate', ingredient: 'tomato', x: 36, y: 208, w: 148, h: 76, label: 'Tomato' },
  { id: 'crate-lettuce', kind: 'crate', ingredient: 'lettuce', x: 204, y: 208, w: 148, h: 76, label: 'Lettuce' },
  { id: 'crate-cheese', kind: 'crate', ingredient: 'cheese', x: 372, y: 208, w: 148, h: 76, label: 'Cheese' },
  { id: 'crate-bread', kind: 'crate', ingredient: 'bread', x: 540, y: 208, w: 148, h: 76, label: 'Bread' },
  { id: 'crate-pasta', kind: 'crate', ingredient: 'pasta', x: 708, y: 208, w: 148, h: 76, label: 'Pasta' },
  { id: 'crate-egg', kind: 'crate', ingredient: 'egg', x: 876, y: 208, w: 148, h: 76, label: 'Egg' },
  { id: 'board', kind: 'board', x: 60, y: 348, w: 250, h: 116, label: 'Chopping Board' },
  { id: 'stove', kind: 'stove', x: 430, y: 348, w: 300, h: 116, label: 'Stove' },
  { id: 'assembly', kind: 'assembly', x: 830, y: 348, w: 390, h: 116, label: 'Plating Counter' },
  { id: 'trash', kind: 'trash', x: 60, y: 596, w: 170, h: 96, label: 'Trash' },
  { id: 'serve', kind: 'serve', x: 900, y: 596, w: 320, h: 96, label: 'Serving Window' },
];

export function stationById(id) {
  return STATIONS.find((s) => s.id === id);
}

// Solid counters the chef cannot walk through (the serving window and trash
// sit against the bottom wall, the crates against the top wall).
export const SOLIDS = STATIONS.filter((s) => s.kind !== 'decor');
