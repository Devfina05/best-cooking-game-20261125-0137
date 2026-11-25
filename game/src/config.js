// Simmer & Serve — the game's data: what an ingredient is, what each dish
// needs, and how the rush scales. No logic lives here, only tuning, so a
// new dish is one entry in RECIPES.

/** Every ingredient on the counter: its key, label and counter colour.
 * Colours are chosen to stay readable on the white plate: rice is a warm
 * beige rather than white, and the egg keeps a deep yolk yellow. */
export const INGREDIENTS = [
  { id: 'bun', label: 'Brioche Bun', key: '1', colour: '#e8b06a' },
  { id: 'patty', label: 'Beef Patty', key: '2', colour: '#7a4a2b' },
  { id: 'cheese', label: 'Cheddar', key: '3', colour: '#f2c230' },
  { id: 'lettuce', label: 'Lettuce', key: '4', colour: '#6fae4e' },
  { id: 'tomato', label: 'Tomato', key: '5', colour: '#d64541' },
  { id: 'rice', label: 'Steamed Rice', key: '6', colour: '#e8dcc0' },
  { id: 'egg', label: 'Fried Egg', key: '7', colour: '#f7d774' },
  { id: 'pepper', label: 'Sweet Pepper', key: '8', colour: '#e07840' },
];

/** The menu: each dish is a name, a blurb and the exact set it needs. */
export const RECIPES = [
  {
    id: 'sunny-stack',
    name: 'Sunny Stack',
    blurb: 'Our house burger, tall enough to need both hands.',
    needs: ['bun', 'patty', 'cheese', 'lettuce'],
  },
  {
    id: 'garden-bowl',
    name: 'Garden Bowl',
    blurb: 'Rice, greens and a golden egg, no fuss at all.',
    needs: ['rice', 'egg', 'lettuce', 'tomato'],
  },
  {
    id: 'ember-plate',
    name: 'Ember Plate',
    blurb: 'Charred patty, sweet pepper, sharp cheddar.',
    needs: ['patty', 'pepper', 'tomato', 'cheese'],
  },
  {
    id: 'morning-rice',
    name: 'Morning Rice',
    blurb: 'The breakfast that forgives a late night.',
    needs: ['rice', 'egg', 'tomato'],
  },
];

/** How the rush scales: seconds per order, shrinking as levels rise. */
export const ORDER_SECONDS = { base: 45, perLevel: -3, min: 25 };

/** Lives at the start of a shift, and the points a serve is worth. */
export const START_LIVES = 3;
export const SERVE_BASE_POINTS = 100;
export const SERVE_TIME_BONUS_PER_SECOND = 2;
export const WRONG_INGREDIENT_TIME_PENALTY = 5;

/** Orders served before the kitchen speeds up a level. */
export const ORDERS_PER_LEVEL = 3;
