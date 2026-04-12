# Final Fight Clone — AAA

A side-scrolling 2D beat-'em-up inspired by the classic arcade game Final Fight, built with **Phaser 3**, **TypeScript** (strict mode), and **Vite**.

## Tech Stack

| Tool | Version |
|------|---------|
| [Phaser](https://phaser.io) | 3.90.0 |
| [Vite](https://vitejs.dev) | 6.3.1 |
| [TypeScript](https://www.typescriptlang.org) | 5.7.2 |
| [Vitest](https://vitest.dev) | 4.x |

## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run dev` | Launch a development server with hot-reload |
| `npm run build` | Create a production build in the `dist` folder |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |

## Getting Started

```bash
npm install
npm run dev
```

The development server starts at `http://localhost:5173` by default. Vite will hot-reload any change made under `src/`.

## Project Structure

| Path | Description |
|------|-------------|
| `index.html` | HTML shell that mounts the Phaser canvas |
| `public/assets/` | Sprites, audio, and other static assets served at runtime |
| `src/main.ts` | Application bootstrap |
| `src/game/main.ts` | Phaser game configuration and scene registration |
| `src/game/scenes/` | All Phaser scenes (`Boot`, `Preloader`, `MainMenu`, `GameScene`, `HudScene`, `GameOver`, `StageClear`, `TimeUp`, `PauseOverlay`, `LeaderboardScene`) |
| `src/player/` | Player state machine, controller, and input binding |
| `src/enemy/` | Enemy controllers (`Brawler`, `Rusher`, `KnifeThrower`, `Boss`), state machine, and manager |
| `src/combat/` | Hit detection (`CombatSystem`, `HurtboxComponent`), combo tracking, and debug renderer |
| `src/hud/` | HUD components: health bars, lives display, score, combo counter, timer, boss health bar, special cooldown, leaderboard |
| `src/stage/` | Stage data, spawn controller, parallax background, destructible props, item pickups, and timer |
| `src/input/` | `InputManager` and `InputState` abstractions |
| `src/config/` | Centralised `GameConfig` constants |
| `src/data/` | Per-stage data files (`stage1Data`, `stage2Data`, `stage3Data`) |
| `src/assets/` | `AssetKeys` constants for all loaded assets |
| `src/__tests__/` | Vitest unit tests mirroring the source tree |
| `requirements/` | Plain-English functional requirements per subsystem |
| `vite/` | Vite config files for dev and production builds |

## Game Features

- Three playable stages with scrolling parallax backgrounds and destructible props
- Multiple enemy archetypes: Brawler, Rusher, Knife Thrower, and Boss
- Full combat system with hitbox/hurtbox detection, combo tracking, and score multipliers
- Player special attack with cooldown
- Stage timer and time-up flow
- HUD: health bars, lives, score, combo counter, special cooldown, boss health bar
- Pause overlay and leaderboard screen
- Health item pickups from destructible props

## Production Build

```bash
npm run build
```

The output is written to `dist/`. Upload the entire contents of that folder to any static web host to deploy the game.

## Assets

Static assets (sprites, audio, etc.) live in `public/assets/` and are served directly by the dev server and copied verbatim into `dist/assets/` on build. Asset key constants are centralised in `src/assets/AssetKeys.ts`.
