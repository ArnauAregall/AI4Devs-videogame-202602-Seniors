## Why

The game needs a stable, deterministic execution foundation before any other subsystem can be built. Without a fixed-timestep loop, a defined scene lifecycle, and an authoritative Phaser configuration, all physics, input, and rendering behaviour will vary across hardware and frame rates. This is the first subsystem to implement because every other subsystem (player, stage, combat, AI, HUD) depends on it.

## What Changes

- Introduce a Phaser 3 game configuration module (`GameConfig.ts`) with named constants for canvas dimensions, physics settings, and target frame rate.
- Implement a `BootScene` that loads the minimum assets for a loading screen, then transitions to `PreloadScene`.
- Implement a `PreloadScene` that displays a visible loading progress bar, loads all game assets, then transitions to `MainMenuScene`.
- Implement a `MainMenuScene` as the first interactive scene after loading.
- Implement a `GameScene` as the primary gameplay context (initially empty — wired and lifecycle-complete, populated by later subsystems).
- Implement a fixed-timestep update loop inside `GameScene` with configurable max steps per frame and surplus-time discard.
- Implement a `PauseState` that suspends game-object updates while keeping the HUD layer interactive.
- Implement a `GameOverState` and `StageClearState` as overlay states triggered from `GameScene`.
- Implement a `TimeUpState` triggered when the stage countdown reaches zero.
- Implement responsive canvas scaling (fixed-size and scale-to-fit modes) via Phaser Scale Manager.

## Capabilities

### New Capabilities

- `game-config`: Named constants for canvas size, target fps, fixed-timestep delta, max-steps-per-frame, arcade physics gravity, and stage count.
- `boot-scene`: Boot scene that loads the loading screen assets and transitions to PreloadScene.
- `preload-scene`: Preload scene that renders a progress bar, loads all game assets, and transitions to MainMenuScene.
- `main-menu-scene`: Main menu scene — first interactive scene; out-of-scope content (character select, settings) is not included.
- `game-scene`: Game scene container: fixed-timestep loop, pause/resume, time accumulator, max-step guard, and lifecycle hooks for player, stage, combat, AI, and HUD subsystems.
- `game-states`: GameOverState, StageClearState, and TimeUpState overlay logic triggered from GameScene.

### Modified Capabilities

<!-- No existing specs — this is the first subsystem -->

## Impact

- Creates `finalfight-AAA/src/scenes/` and `finalfight-AAA/src/config/` as the primary source directories for this subsystem.
- All subsequent subsystems (player, stage, combat-system, enemy-ai, hud) will register themselves with `GameScene` via the lifecycle hooks established here.
- `GameConfig.ts` becomes the authoritative source of canvas dimensions and timestep constants; all other files import from it.
- No external dependencies beyond Phaser 3 and the existing Vite build setup.
