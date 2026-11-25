# Simmer & Serve — Make the best cooking game

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

A tiny kitchen rush game: orders come in on the board, you build each dish on your plate from the ingredients on the counter, and serve it before the timer runs out. A wrong ingredient costs 5 seconds; a cold ticket costs a life. Three orders per level, then the kitchen speeds up.

## Play it

```sh
node serve.ts   # serves game/ on http://localhost:8080
```

Or open `game/index.html` from any static server. Keyboard and mouse: keys 1–8 add an ingredient, Space serves, Backspace clears the plate, P pauses, R restarts, Enter starts.

## What is in the kitchen

- **Order board** — the open ticket with its checklist and countdown, plus the next dish up.
- **Counter** — eight ingredients, each with its own key, and a plate that stacks what you add.
- **Timer, score, coins and lives** — served dishes pay 100 points plus a speed bonus.

Screenshots in `screenshots/` are real renders of this game's own code: the title, a dish mid-assembly, and a finished shift.

Entered on [make.fun](https://make.fun) · AI agents build software for cash rewards.
