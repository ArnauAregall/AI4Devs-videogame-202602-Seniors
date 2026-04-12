## Context

The game-loop is the foundational subsystem of the Final Fight clone. No other subsystem can exist without it. The project uses Phaser 3 with TypeScript strict mode, built via Vite. Phaser 3 runs its own internal `requestAnimationFrame` render loop; our responsibility is to layer a fixed-timestep update on top of it, configure the Phaser game instance with explicit constants, and define the scene lifecycle so all subsequent subsystems have well-known hooks to register against.

Currently the project has no source files — only scaffolding, requirements, and asset keys. This design establishes the directory and module structure that all other subsystems will follow.

## Goals / Non-Goals

**Goals:**
- Define a single authoritative `GameConfig.ts` with all tuning constants (canvas, timestep, physics, stage count).
- Implement the four-scene lifecycle: Boot → Preload → MainMenu → Game.
- Implement a fixed-timestep accumulator inside `GameScene.update()` with a max-steps-per-frame cap and surplus-time discard.
- Implement pause/resume, Game Over, Stage Clear, and Time Up states as overlay mechanisms inside `GameScene`.
- Support responsive canvas scaling (fixed and scale-to-fit) via Phaser Scale Manager.
- Ensure all scene lifecycle methods (`preload`, `create`, `update`) are present and documented even if empty.

**Non-Goals:**
- Populating `GameScene` with game objects (player, enemies, stage) — those belong to their own subsystems.
- Implementing the HUD overlay content — only the structural overlay layer is registered here.
- Game saves, cloud sync, or settings persistence beyond local storage for leaderboard data.
- Two-player mode or co-op networking.

## Decisions

**D-01 — Fixed-timestep accumulator in `GameScene.update()`**
Phaser 3 passes `time` and `delta` to every scene `update()`. We accumulate `delta` in a local variable and step game logic in `FIXED_DELTA_MS` increments (default 16.667 ms = 60 Hz). This avoids coupling to Phaser's physics timestep, which is harder to override cleanly in Arcade Physics. *Alternative considered:* Phaser's built-in `fixedUpdate` plugin — rejected because it requires a third-party plugin and is not part of the Phaser 3 core API.

**D-02 — Max steps per frame = 3**
If the renderer drops severely (e.g. tab is hidden), uncapped step accumulation leads to a "spiral of death". Capping at 3 steps per frame means at most 3 × FIXED_DELTA_MS of logic runs regardless of real elapsed time. Surplus time is discarded (not carried over). *Alternative:* discard only, no catch-up — rejected because mild frame drops (30–60 fps) would cause perceptible slowdown.

**D-03 — Pause implemented via Phaser scene sleep/wake**
`GameScene` calls `this.scene.pause()` / `this.scene.resume()` which stops the `update()` clock. A separate `PauseOverlayScene` is launched on top and listens for resume input. *Alternative:* manual `isPaused` flag inside `GameScene.update()` — rejected because it requires all subsystems to check the flag; Phaser's built-in pause stops physics and tweens automatically.

**D-04 — Game Over / Stage Clear / Time Up as overlay scenes**
Each state is a small Phaser scene that `this.scene.launch()`es on top of `GameScene` and `this.scene.stop()`s itself when dismissed. This keeps `GameScene` logic clean and makes each overlay independently testable. *Alternative:* modal flags + conditional rendering inside GameScene — rejected as it tightly couples overlay UI to gameplay logic.

**D-05 — GameConfig as a plain TypeScript const object (no class)**
A class would add unnecessary instantiation overhead. A frozen `const` object imported by all scenes and entities is sufficient and tree-shakeable.

## Risks / Trade-offs

- **[Risk] Fixed-timestep cap at 3 steps may cause visible slow-motion during severe frame drops** → Mitigation: 3 steps covers drops to ~20 fps before slowdown appears; acceptable for the target hardware.
- **[Risk] Phaser's `scene.pause()` does not pause HTML5 audio by default** → Mitigation: `GameScene` will call `this.sound.pauseAll()` / `resumeAll()` explicitly around the pause transition.
- **[Risk] Responsive scaling may cause sub-pixel rendering artefacts on pixel-art sprites** → Mitigation: `pixelArt: true` is set in GameConfig; Phaser uses `nearest-neighbor` filtering when this flag is enabled.
