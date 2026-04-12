# game-scene Specification

## Purpose
TBD - created by archiving change game-loop. Update Purpose after archive.
## Requirements
### Requirement: GameScene runs a fixed-timestep update loop
The system SHALL implement a fixed-timestep accumulator in `GameScene.update(time, delta)`. On each render frame, `delta` is accumulated; for each full `FIXED_DELTA_MS` interval accumulated, one fixed-update step runs. Steps per frame are capped at `MAX_STEPS_PER_FRAME`; surplus time is discarded.

#### Scenario: Multiple steps run when frame delta is large
- **WHEN** `GameScene.update()` is called with a `delta` of `2 × FIXED_DELTA_MS`
- **THEN** exactly 2 fixed-update steps execute that frame

#### Scenario: Steps are capped at MAX_STEPS_PER_FRAME
- **WHEN** `delta` exceeds `MAX_STEPS_PER_FRAME × FIXED_DELTA_MS`
- **THEN** exactly `MAX_STEPS_PER_FRAME` steps run and surplus time is discarded (not carried over)

#### Scenario: Single normal step on a 60 fps frame
- **WHEN** `delta` equals `FIXED_DELTA_MS`
- **THEN** exactly 1 fixed-update step runs

### Requirement: GameScene provides lifecycle hooks for subsystems
The system SHALL expose `registerFixedUpdate(fn: (dt: number) => void)` and `unregisterFixedUpdate(fn)` methods on `GameScene` so that player, stage, combat, AI, and HUD subsystems can subscribe to the fixed-timestep tick without modifying `GameScene` directly.

#### Scenario: Registered callback is called each fixed step
- **WHEN** a callback is registered via `registerFixedUpdate` and a fixed step runs
- **THEN** the callback is invoked with `FIXED_DELTA_MS` as the argument

#### Scenario: Unregistered callback is not called
- **WHEN** a callback is unregistered via `unregisterFixedUpdate` and a fixed step runs
- **THEN** the callback is NOT invoked

### Requirement: GameScene supports pause and resume
The system SHALL implement pause by calling `this.scene.pause()` (which stops the Phaser update clock) and launching a `PauseOverlayScene`. Resume calls `this.scene.resume()` and stops `PauseOverlayScene`. Audio is paused/resumed alongside the scene.

#### Scenario: Pause suspends fixed-update callbacks
- **WHEN** the pause input is received and `GameScene` is paused
- **THEN** registered fixed-update callbacks are no longer called until the scene resumes

#### Scenario: Pause is not available during transitions
- **WHEN** the game is in a scene transition (boot, preload, game-over, stage-clear)
- **THEN** the pause input is ignored

#### Scenario: Resume restores exact game state
- **WHEN** the game resumes from pause
- **THEN** game objects are in the same state as at the moment of pause (no extra update steps)

### Requirement: Canvas scaling supports fixed-size and responsive modes
The system SHALL configure Phaser Scale Manager to support both a fixed-size canvas (`NO_CENTER` mode) and a responsive mode that scales to fit the browser window while maintaining the original aspect ratio (`FIT` mode with `CENTER_BOTH`). The active mode is controlled by `GameConfig.SCALE_MODE`.

#### Scenario: Canvas fills window in responsive mode
- **WHEN** `GameConfig.SCALE_MODE` is `'FIT'` and the browser window is resized
- **THEN** the canvas scales to fit within the window while preserving the aspect ratio defined by `CANVAS_WIDTH / CANVAS_HEIGHT`

### Requirement: GameScene exposes a getPlayer() accessor
The system SHALL add `getPlayer(): PlayerController | null` to `GameScene`. It returns the current player instance or `null` before the player is created.

#### Scenario: getPlayer returns the instance after create
- **WHEN** `GameScene.create()` completes
- **THEN** `gameScene.getPlayer()` returns a non-null `PlayerController`

#### Scenario: getPlayer returns null before create
- **WHEN** `GameScene` is constructed but `create()` has not yet run
- **THEN** `gameScene.getPlayer()` returns `null`

### Requirement: GameScene exposes a getStageManager() accessor
The system SHALL add `_stageManager: StageManager | null` field and `getStageManager(): StageManager | null` accessor to `GameScene`. It returns the current StageManager instance or `null` before the stage is initialised.

#### Scenario: getStageManager returns instance after create
- **WHEN** `GameScene.create()` completes with a valid stage data argument
- **THEN** `gameScene.getStageManager()` returns a non-null `StageManager`

#### Scenario: getStageManager returns null before create
- **WHEN** `GameScene` is constructed but `create()` has not yet run
- **THEN** `gameScene.getStageManager()` returns `null`

### Requirement: GameScene provides an itemPickupGroup
The system SHALL create and expose a `itemPickupGroup: Phaser.GameObjects.Group` in `GameScene.create()` for use by `ItemPickup` objects.

#### Scenario: itemPickupGroup is accessible to StageManager
- **WHEN** `GameScene.create()` completes
- **THEN** `gameScene.itemPickupGroup` is a non-null Phaser Group

### Requirement: GameScene exposes getCombatSystem() accessor
The system SHALL add a `_combatSystem: CombatSystem | null` field and `getCombatSystem(): CombatSystem | null` accessor to `GameScene`. It returns the current CombatSystem instance or `null` before the scene is initialised. References: FR-CS-03, NFR-CS-01.

#### Scenario: getCombatSystem returns instance after create
- **WHEN** `GameScene.create()` completes
- **THEN** `gameScene.getCombatSystem()` returns a non-null `CombatSystem`

#### Scenario: getCombatSystem returns null before create
- **WHEN** `GameScene` is constructed but `create()` has not yet run
- **THEN** `gameScene.getCombatSystem()` returns `null`

### Requirement: CombatSystem is registered in the fixed-update loop
The system SHALL call `CombatSystem.fixedUpdate()` every fixed-timestep tick by registering it with `GameScene.registerFixedUpdate` in `GameScene.create()`. References: NFR-CS-01.

#### Scenario: CombatSystem.fixedUpdate called each tick
- **WHEN** a fixed-update tick runs in GameScene
- **THEN** CombatSystem.fixedUpdate() is called once

### Requirement: GameScene exposes getEnemyManager() accessor
`GameScene` SHALL add a `getEnemyManager(): EnemyManager | null` method that returns the active `EnemyManager` instance, or `null` before it is created. `EnemyManager.fixedUpdate()` is registered with `registerFixedUpdate` in `GameScene.create()` immediately after `CombatSystem` registration. References: FR-EA-18.

#### Scenario: getEnemyManager returns instance after create
- **WHEN** GameScene.create() completes
- **THEN** getEnemyManager() returns a non-null EnemyManager

#### Scenario: EnemyManager fixed-update is called each tick
- **WHEN** a fixed-update step runs
- **THEN** EnemyManager.fixedUpdate() is invoked

