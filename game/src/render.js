// Simmer & Serve — the painter: it reads the kitchen state and updates the
// DOM. It never changes the rules; every number on screen comes from game.js.

import { INGREDIENTS } from './config.js';
import {
  SCREEN_TITLE,
  SCREEN_PLAY,
  SCREEN_PAUSED,
  SCREEN_OVER,
  ingredientById,
  plateComplete,
  plateHas,
} from './game.js';

/** Build the ingredient buttons once; clicks call back into the kitchen. */
export function buildCounter(onAdd) {
  const wrap = document.getElementById('ingredients');
  wrap.textContent = '';
  for (const item of INGREDIENTS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ingredient';
    button.dataset.id = item.id;
    button.innerHTML =
      `<span class="swatch" style="background:${item.colour}"></span>` +
      `<span>${item.label}</span><span class="key">${item.key}</span>`;
    button.addEventListener('click', () => onAdd(item.id));
    wrap.appendChild(button);
  }
}

/** Paint every part of the kitchen from the current state. */
export function render(kitchen) {
  document.getElementById('stat-level').textContent = `Level ${kitchen.level}`;
  document.getElementById('stat-score').textContent = `Score ${kitchen.score}`;
  document.getElementById('stat-coins').textContent = `Coins ${kitchen.coins}`;
  document.getElementById('stat-lives').textContent =
    `Lives ${kitchen.lives}`;
  renderTicket(kitchen);
  renderPlate(kitchen);
  renderMessage(kitchen);
  renderOverlay(kitchen);
  const serve = document.getElementById('serve-btn');
  serve.disabled = kitchen.screen !== SCREEN_PLAY || !plateComplete(kitchen);
  serve.classList.toggle(
    'ready',
    kitchen.screen === SCREEN_PLAY && plateComplete(kitchen),
  );
  document.getElementById('clear-btn').disabled =
    kitchen.screen !== SCREEN_PLAY || kitchen.plate.length === 0;
}

/** The order ticket: dish, checklist, timer bar and seconds left. */
function renderTicket(kitchen) {
  const dish = document.getElementById('ticket-dish');
  const needs = document.getElementById('ticket-needs');
  const fill = document.getElementById('ticket-timer-fill');
  const time = document.getElementById('ticket-time');
  const next = document.getElementById('next-dish');
  if (!kitchen.order) {
    dish.textContent = 'No order yet';
    needs.textContent = '';
    fill.style.width = '0%';
    fill.classList.remove('low');
    time.textContent = '--s';
    next.textContent = '—';
    return;
  }
  const recipe = kitchen.order.recipe;
  dish.textContent = `${recipe.name} — ${recipe.blurb}`;
  needs.textContent = '';
  for (const id of recipe.needs) {
    const item = ingredientById(id);
    const li = document.createElement('li');
    li.textContent = plateHas(kitchen, id)
      ? `✓ ${item?.label ?? id}`
      : (item?.label ?? id);
    if (plateHas(kitchen, id)) li.className = 'done';
    needs.appendChild(li);
  }
  const fraction = Math.max(
    0,
    kitchen.order.secondsLeft / kitchen.order.secondsTotal,
  );
  fill.style.width = `${Math.round(fraction * 100)}%`;
  fill.classList.toggle('low', fraction < 0.25);
  time.textContent = `${Math.max(0, Math.ceil(kitchen.order.secondsLeft))}s left`;
  next.textContent = kitchen.next
    ? `${kitchen.next.name} (${kitchen.next.needs.length} items)`
    : '—';
}

/** The plate: one coloured layer per ingredient, bottom to top. */
function renderPlate(kitchen) {
  const plate = document.getElementById('plate');
  plate.textContent = '';
  plate.classList.toggle('empty', kitchen.plate.length === 0);
  for (const id of kitchen.plate) {
    const item = ingredientById(id);
    const layer = document.createElement('div');
    layer.className = 'plate-item';
    layer.style.background = item?.colour ?? '#999';
    layer.textContent = item?.label ?? id;
    plate.appendChild(layer);
  }
  if (kitchen.flash?.kind === 'wrong') {
    const button = document.querySelector(
      `.ingredient[data-id="${kitchen.flash.id}"]`,
    );
    if (button) {
      button.classList.remove('wrong');
      void button.offsetWidth;
      button.classList.add('wrong');
    }
  }
}

function renderMessage(kitchen) {
  document.getElementById('message').textContent = kitchen.message;
  document.getElementById('status').textContent = kitchen.message;
}

/** Title, pause and game-over cards over the kitchen. */
function renderOverlay(kitchen) {
  const overlay = document.getElementById('overlay');
  const title = document.getElementById('overlay-title');
  const text = document.getElementById('overlay-text');
  const score = document.getElementById('overlay-score');
  const button = document.getElementById('overlay-btn');
  if (kitchen.screen === SCREEN_PLAY) {
    overlay.hidden = true;
    return;
  }
  overlay.hidden = false;
  if (kitchen.screen === SCREEN_TITLE) {
    title.textContent = 'Simmer & Serve';
    text.textContent =
      'Orders come in on the board. Build each dish on your plate from the ' +
      'ingredients on the counter, then serve it before the timer runs out. ' +
      'A wrong ingredient costs 5 seconds; a cold ticket costs a life. ' +
      'The menu: Sunny Stack, Garden Bowl, Ember Plate and Morning Rice.';
    score.textContent = 'Three lives. Three orders per level. How long can you keep the kitchen hot?';
    button.textContent = 'Start cooking';
  } else if (kitchen.screen === SCREEN_PAUSED) {
    title.textContent = 'Paused';
    text.textContent = 'The stove is off and the tickets are waiting.';
    score.textContent = `Score ${kitchen.score} · Level ${kitchen.level}`;
    button.textContent = 'Back to the kitchen';
  } else if (kitchen.screen === SCREEN_OVER) {
    title.textContent = 'Shift Over';
    text.textContent = kitchen.message;
    score.textContent = `Final score ${kitchen.score} · ${kitchen.coins} coins · ${kitchen.served} dishes served`;
    button.textContent = 'Cook another shift';
  }
}
