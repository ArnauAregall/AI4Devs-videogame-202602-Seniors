## 1. Project Structure

- [ ] 1.1 Create `finalfight-AAA/src/config/` directory
- [ ] 1.2 Create `finalfight-AAA/src/scenes/` directory
- [ ] 1.3 Create `finalfight-AAA/src/__tests__/` directory

## 2. GameConfig

- [ ] 2.1 Create `src/config/GameConfig.ts` with exported constants: `CANVAS_WIDTH`, `CANVAS_HEIGHT`, `TARGET_FPS`, `FIXED_DELTA_MS`, `MAX_STEPS_PER_FRAME`, `STAGE_COUNT`, `SCALE_MODE`
- [ ] 2.2 Set `CANVAS_WIDTH = 384`, `CANVAS_HEIGHT = 224` (4:3 pixel-art target resolution)
- [ ] 2.3 Set `TARGET_FPS = 60`, `FIXED_DELTA_MS = 1000 / TARGET_FPS`, `MAX_STEPS_PER_FRAME = 3`
- [ ] 2.4 Configure Phaser physics section in `GameConfig` with `arcade: { gravity: { y: 0 }, debug: false }`
- [ ] 2.5 Add `pixelArt: true` to the Phaser game config derived from `GameConfig`

## 3. Phaser Game Entry Point

- [ ] 3.1 Create `src/main.ts` that instantiates `new Phaser.Game(config)` using `GameConfig`
- [ ] 3.2 Register all scenes in order: `BootScene`, `PreloadScene`, `MainMenuScene`, `GameScene`, `PauseOverlayScene`, `GameOverScene`, `StageClearScene`, `TimeUpScene`
- [ ] 3.3 Configure `Phaser.Scale.ScaleManager` in `main.ts` using `GameConfig.SCALE_MODE`

## 4. BootScene

- [ ] 4.1 Create `src/scenes/BootScene.ts` extending `Phaser.Scene` with key `'BootScene'`
- [ ] 4.2 Implement `preload()` loading only the loading-bar assets (background image and fill graphic)
- [ ] 4.3 Implement `create()` calling `this.scene.start('PreloadScene')`

## 5. PreloadScene

- [ ] 5.1 Create `src/scenes/PreloadScene.ts` extending `Phaser.Scene` with key `'PreloadScene'`
- [ ] 5.2 Implement `create()` rendering a progress bar container centred on canvas
- [ ] 5.3 Wire `this.load.on('progress', cb)` to update progress bar fill width
- [ ] 5.4 Wire `this.load.on('complete', cb)` to call `this.scene.start('MainMenuScene')`
- [ ] 5.5 Implement `preload()` loading every path in `AssetKeys.ASSET_PATH` using the correct loader (`image` vs `spritesheet`) and frame config from `AssetKeys.ASSET_FRAME_CONFIG`

## 6. MainMenuScene

- [ ] 6.1 Create `src/scenes/MainMenuScene.ts` extending `Phaser.Scene` with key `'MainMenuScene'`
- [ ] 6.2 Implement `create()` displaying a "FINAL FIGHT" title and a "START GAME" menu item
- [ ] 6.3 Bind keyboard Enter and mouse click on "START GAME" to `this.scene.start('GameScene')`

## 7. GameScene — Structure

- [ ] 7.1 Create `src/scenes/GameScene.ts` extending `Phaser.Scene` with key `'GameScene'`
- [ ] 7.2 Declare private fields: `_accumulator: number`, `_fixedCallbacks: Set<(dt: number) => void>`
- [ ] 7.3 Implement `create()` with empty body and comment placeholders for player, stage, combat, AI, and HUD registration
- [ ] 7.4 Implement `registerFixedUpdate(fn)` adding to `_fixedCallbacks`
- [ ] 7.5 Implement `unregisterFixedUpdate(fn)` removing from `_fixedCallbacks`

## 8. GameScene — Fixed-Timestep Loop

- [ ] 8.1 Implement `update(time: number, delta: number)` accumulating `delta` into `_accumulator`
- [ ] 8.2 Add inner loop: while `_accumulator >= FIXED_DELTA_MS` and `steps < MAX_STEPS_PER_FRAME`, call all `_fixedCallbacks` with `FIXED_DELTA_MS`, decrement `_accumulator`, increment steps
- [ ] 8.3 Discard surplus: after the loop, reset `_accumulator = 0` if it remains positive (surplus discarded, not carried)

## 9. GameScene — Pause / Resume

- [ ] 9.1 Implement `pauseGame()`: call `this.sound.pauseAll()`, `this.scene.pause()`, `this.scene.launch('PauseOverlayScene')`
- [ ] 9.2 Create `src/scenes/PauseOverlayScene.ts` listening for ESC/P/Start input and calling `this.scene.stop()` then `this.scene.resume('GameScene')` then `this.sound.resumeAll()` on the game scene

## 10. Overlay Scenes — Game Over

- [ ] 10.1 Create `src/scenes/GameOverScene.ts` with key `'GameOverScene'`
- [ ] 10.2 Display "GAME OVER" text and player score
- [ ] 10.3 Show "CONTINUE" option only when continues > 0; bind to resume logic
- [ ] 10.4 Show "QUIT TO MAIN MENU" binding to stop `GameScene` and start `MainMenuScene`

## 11. Overlay Scenes — Stage Clear

- [ ] 11.1 Create `src/scenes/StageClearScene.ts` with key `'StageClearScene'`
- [ ] 11.2 Display "STAGE CLEAR", stage score, and time bonus if time > 0
- [ ] 11.3 After tally animation completes, advance to next stage or transition to end screen on final stage

## 12. Overlay Scenes — Time Up

- [ ] 12.1 Create `src/scenes/TimeUpScene.ts` with key `'TimeUpScene'`
- [ ] 12.2 Display "TIME UP" and pause `GameScene`
- [ ] 12.3 If continues available, launch `GameOverScene` continue prompt; otherwise transition to `GameOverScene` without continue option

## 13. Canvas Scaling

- [ ] 13.1 Add `scale` config block to Phaser game config in `main.ts` using `GameConfig.SCALE_MODE`
- [ ] 13.2 Set `autoCenter: Phaser.Scale.CENTER_BOTH` and `mode: Phaser.Scale.FIT` when `SCALE_MODE === 'FIT'`

## 14. Tests

- [ ] 14.1 Write `src/__tests__/GameConfig.test.ts`: assert all constants have correct values and relationships
- [ ] 14.2 Write `src/__tests__/GameScene.test.ts`: test fixed-timestep accumulator (1 step, 2 steps, capped steps, surplus discard) and register/unregister callbacks
- [ ] 14.3 Run `npm test` and confirm all tests pass
