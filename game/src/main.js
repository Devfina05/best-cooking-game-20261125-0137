// Simmer & Serve — boot and the one loop: input is read on events, the
// clock ticks every 100 ms, and the renderer paints what is there. The game
// moves between four screens: title, play, paused and game over.
//
// ?seed=N fixes the order pattern. ?shot=start|play|end (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.

import {
  SCREEN_TITLE,
  SCREEN_PLAY,
  SCREEN_PAUSED,
  SCREEN_OVER,
  createKitchen,
  createRandom,
  startShift,
  addIngredient,
  clearPlate,
  serveOrder,
  tick,
  ingredientByKey,
} from './game.js';
import { buildCounter, render } from './render.js';

const TICK_MS = 100;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam)
  ? seedParam
  : Math.floor(Math.random() * 4294967296);

const kitchen = createKitchen(createRandom(seed));
buildCounter((id) => {
  addIngredient(kitchen, id);
  render(kitchen);
});

/** The overlay button starts, resumes or restarts, whichever fits. */
document.getElementById('overlay-btn').addEventListener('click', () => {
  if (kitchen.screen === SCREEN_PAUSED) {
    kitchen.screen = SCREEN_PLAY;
  } else {
    startShift(kitchen);
  }
  render(kitchen);
});
document.getElementById('serve-btn').addEventListener('click', () => {
  serveOrder(kitchen);
  render(kitchen);
});
document.getElementById('clear-btn').addEventListener('click', () => {
  clearPlate(kitchen);
  render(kitchen);
});

document.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  const key = event.key;
  if (key === 'Enter') {
    if (kitchen.screen !== SCREEN_PLAY) {
      startShift(kitchen);
      render(kitchen);
    }
    return;
  }
  if (kitchen.screen !== SCREEN_PLAY) {
    if (key === 'r' || key === 'R') {
      startShift(kitchen);
      render(kitchen);
    }
    return;
  }
  if (key === ' ') {
    event.preventDefault();
    serveOrder(kitchen);
  } else if (key === 'Backspace') {
    clearPlate(kitchen);
  } else if (key === 'p' || key === 'P') {
    kitchen.screen = SCREEN_PAUSED;
  } else {
    const ingredient = ingredientByKey(key);
    if (ingredient) addIngredient(kitchen, ingredient.id);
  }
  render(kitchen);
});

/**
 * Stage a screenshot scene with the real rules: start shows the title over
 * an empty kitchen; play runs a fixed shift forward until a dish is
 * mid-assembly; end plays a careless shift until the lives run out.
 */
function stageShot(name) {
  if (name !== 'play' && name !== 'end') {
    render(kitchen);
    return;
  }
  startShift(kitchen);
  if (name === 'play') {
    // Add the first two ingredients of the open ticket, then leave the
    // timer part-run so the frame shows a dish mid-assembly.
    const needs = kitchen.order.recipe.needs;
    addIngredient(kitchen, needs[0]);
    addIngredient(kitchen, needs[1]);
    kitchen.order.secondsLeft = Math.round(kitchen.order.secondsTotal * 0.7);
    kitchen.message = `${kitchen.order.recipe.name} is coming together — ${needs.length - 2} to go.`;
  } else {
    // A real shift that ends badly: serve two dishes well, then play
    // carelessly until every life is spent on cold tickets, so the final
    // screen shows a score earned, not a blank one.
    for (let served = 0; served < 2 && kitchen.screen !== SCREEN_OVER; served += 1) {
      for (const id of [...kitchen.order.recipe.needs]) addIngredient(kitchen, id);
      serveOrder(kitchen);
    }
    let guard = 0;
    while (kitchen.screen !== SCREEN_OVER && guard < 10000) {
      guard += 1;
      const wrong = kitchen.order.recipe.needs.includes('bun') ? 'rice' : 'bun';
      addIngredient(kitchen, wrong);
      tick(kitchen, 1);
    }
  }
  render(kitchen);
}

function runShot(name) {
  stageShot(name);
  let painted = 0;
  function paint() {
    render(kitchen);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  render(kitchen);
  window.setInterval(() => {
    tick(kitchen, TICK_MS / 1000);
    render(kitchen);
  }, TICK_MS);
}

if (shot) runShot(shot);
else runGame();
