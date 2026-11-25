// Simmer & Serve — the kitchen's rules: orders, the plate, the timer, lives
// and levels. This file knows nothing about the DOM; render.js paints the
// state it returns, and main.js feeds it input and ticks.

import {
  INGREDIENTS,
  RECIPES,
  ORDER_SECONDS,
  START_LIVES,
  SERVE_BASE_POINTS,
  SERVE_TIME_BONUS_PER_SECOND,
  WRONG_INGREDIENT_TIME_PENALTY,
  ORDERS_PER_LEVEL,
} from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

/** A tiny seeded random source so ?seed=N replays the same orders. */
export function createRandom(seed) {
  let state = seed >>> 0 || 1;
  return function next() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Seconds an order allows at this level. */
export function orderSecondsFor(level) {
  return Math.max(
    ORDER_SECONDS.min,
    ORDER_SECONDS.base + ORDER_SECONDS.perLevel * (level - 1),
  );
}

export function ingredientById(id) {
  return INGREDIENTS.find((item) => item.id === id) ?? null;
}

export function ingredientByKey(key) {
  return INGREDIENTS.find((item) => item.key === key) ?? null;
}

/** A fresh shift: title screen, full lives, no order yet. */
export function createKitchen(random) {
  return {
    random,
    screen: SCREEN_TITLE,
    level: 1,
    score: 0,
    coins: 0,
    lives: START_LIVES,
    served: 0,
    order: null,
    next: null,
    plate: [],
    message: 'Welcome to the kitchen. Press Enter to start your shift.',
    flash: null,
  };
}

/** Pick a recipe that is not the one just served, when one exists. */
function pickRecipe(kitchen, avoidId) {
  const pool = RECIPES.filter((recipe) => recipe.id !== avoidId);
  const list = pool.length > 0 ? pool : RECIPES;
  return list[Math.floor(kitchen.random() * list.length)];
}

/** Open a new order ticket and empty the plate. */
function dealOrder(kitchen) {
  const recipe = pickRecipe(kitchen, kitchen.order?.recipe.id);
  kitchen.next = pickRecipe(kitchen, recipe.id);
  kitchen.order = {
    recipe,
    secondsLeft: orderSecondsFor(kitchen.level),
    secondsTotal: orderSecondsFor(kitchen.level),
  };
  kitchen.plate = [];
}

/** Start a shift from the title or game-over screen. */
export function startShift(kitchen) {
  kitchen.screen = SCREEN_PLAY;
  kitchen.level = 1;
  kitchen.score = 0;
  kitchen.coins = 0;
  kitchen.lives = START_LIVES;
  kitchen.served = 0;
  kitchen.order = null;
  kitchen.plate = [];
  kitchen.message = 'First order is in. Build it on the plate, then serve!';
  dealOrder(kitchen);
}

/** The plate already holds this ingredient once. */
export function plateHas(kitchen, id) {
  return kitchen.plate.includes(id);
}

/** The plate holds exactly the recipe's set, in any order. */
export function plateComplete(kitchen) {
  if (!kitchen.order) return false;
  const needs = kitchen.order.recipe.needs;
  return (
    kitchen.plate.length === needs.length &&
    needs.every((id) => kitchen.plate.includes(id))
  );
}

/** Add an ingredient: a wrong one costs time, a right one lands on the plate. */
export function addIngredient(kitchen, id) {
  if (kitchen.screen !== SCREEN_PLAY || !kitchen.order) return;
  const recipe = kitchen.order.recipe;
  if (!recipe.needs.includes(id) || plateHas(kitchen, id)) {
    kitchen.order.secondsLeft = Math.max(
      0,
      kitchen.order.secondsLeft - WRONG_INGREDIENT_TIME_PENALTY,
    );
    kitchen.flash = { kind: 'wrong', id, at: Date.now() };
    kitchen.message = `That ${ingredientById(id)?.label ?? 'ingredient'} is not on this ticket — ${WRONG_INGREDIENT_TIME_PENALTY}s off the clock!`;
    return;
  }
  kitchen.plate.push(id);
  kitchen.flash = null;
  kitchen.message = plateComplete(kitchen)
    ? `${recipe.name} is complete — serve it while it is hot!`
    : `${ingredientById(id)?.label ?? 'Ingredient'} on the plate. ${recipe.needs.length - kitchen.plate.length} to go.`;
}

/** Empty the plate without touching the ticket. */
export function clearPlate(kitchen) {
  if (kitchen.screen !== SCREEN_PLAY) return;
  if (kitchen.plate.length === 0) return;
  kitchen.plate = [];
  kitchen.message = 'Plate cleared. Start the dish again.';
}

/** Serve a complete plate: points for the dish, a bonus for speed. */
export function serveOrder(kitchen) {
  if (kitchen.screen !== SCREEN_PLAY || !kitchen.order) return;
  if (!plateComplete(kitchen)) {
    kitchen.message = 'The plate is not finished yet — check the ticket.';
    return;
  }
  const bonus = Math.round(kitchen.order.secondsLeft) * SERVE_TIME_BONUS_PER_SECOND;
  const points = SERVE_BASE_POINTS + bonus;
  const coins = 10 + Math.round(kitchen.order.secondsLeft);
  kitchen.score += points;
  kitchen.coins += coins;
  kitchen.served += 1;
  kitchen.flash = null;
  const dishName = kitchen.order.recipe.name;
  kitchen.message = `Served ${dishName}! +${points} points, +${coins} coins.`;
  if (kitchen.served % ORDERS_PER_LEVEL === 0) {
    kitchen.level += 1;
    kitchen.message += ` Level ${kitchen.level} — the kitchen speeds up!`;
  }
  dealOrder(kitchen);
}

/** One tick of the clock: the order timer runs down, and a miss costs a life. */
export function tick(kitchen, dtSeconds) {
  if (kitchen.screen !== SCREEN_PLAY || !kitchen.order) return;
  kitchen.order.secondsLeft -= dtSeconds;
  if (kitchen.order.secondsLeft > 0) return;
  kitchen.lives -= 1;
  if (kitchen.lives <= 0) {
    kitchen.screen = SCREEN_OVER;
    kitchen.message = `Shift over — the last ticket went cold. Final score ${kitchen.score}.`;
    return;
  }
  kitchen.message = `Too slow — the ${kitchen.order.recipe.name} ticket went cold. ${kitchen.lives} ${kitchen.lives === 1 ? 'life' : 'lives'} left.`;
  dealOrder(kitchen);
}
