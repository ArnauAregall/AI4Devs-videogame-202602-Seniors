## 1. GameEvents — Add TIMER_EXPIRED constant

- [ ] 1.1 Add `TIMER_EXPIRED: 'timerExpired'` to the `GameEvents` object in `src/game/GameEvents.ts`
- [ ] 1.2 Add `[GameEvents.TIMER_EXPIRED]: Record<string, never>` to the `GameEventPayloads` type in the same file

## 2. StageTimer — Use TIMER_EXPIRED constant

- [ ] 2.1 Import `GameEvents` into `src/stage/StageTimer.ts`
- [ ] 2.2 Replace the `this.scene.events.emit('timeUp')` call with `this.scene.events.emit(GameEvents.TIMER_EXPIRED)`
- [ ] 2.3 Update `src/__tests__/StageTimer.test.ts`: replace all `'timeUp'` string references with `GameEvents.TIMER_EXPIRED`

## 3. GameScene — Wire timer-expired game over and add physics comment

- [ ] 3.1 In `GameScene.create()`, register `this.events.on(GameEvents.TIMER_EXPIRED, () => { if (!this._stageManager?.isCleared) this.triggerGameOver(); })` immediately after `this._stageManager` is assigned
- [ ] 3.2 Add comment `/* no player-enemy collider — intentional: FR-GOLV-01 */` on the line following `this.playerHitboxGroup = this.physics.add.staticGroup()`

## 4. GameOver scene — Keyboard cursor navigation

- [ ] 4.1 Add private fields `_cursor: number`, `_options: Phaser.GameObjects.Text[]` to `GameOver.ts`
- [ ] 4.2 Refactor `create()`: push each constructed option Text object into `_options[]` in the order they appear on screen
- [ ] 4.3 Implement `_refresh()`: iterate `_options`, set colour `#ffcc00` for `_options[_cursor]`, `#ffffff` for all others
- [ ] 4.4 Implement `_activate()`: switch on `_cursor` index to call the corresponding handler (`handleContinue`, `showLeaderboard`, `quitToMenu`)
- [ ] 4.5 In `create()`, register keyboard listeners: `keydown-UP` → cursor--, `keydown-DOWN` → cursor++, both with wrap-around; `keydown-ENTER` → `_activate()`; remove the existing hard-coded `keydown-ENTER → handleContinue()` binding
- [ ] 4.6 Initialise `_cursor = 0` and call `_refresh()` at the end of `create()` so the first option is highlighted from the start
- [ ] 4.7 Remove any lingering `pointerover`/`pointerout` colour-change handlers that conflict with keyboard highlight state (keep pointer-down handlers)

## 5. stage1Data — Pacing and archetype variety

- [ ] 5.1 Move the first `scrollTriggers` entry from `worldX: 1500` to `worldX: 700`
- [ ] 5.2 Move the second `scrollTriggers` entry from `worldX: 3200` to `worldX: 2000`
- [ ] 5.3 Move the third `scrollTriggers` entry from `worldX: 5000` to `worldX: 3500`
- [ ] 5.4 Update `zone-1b` in `spawnZones` to add `{ archetype: 'rusher', count: 1, staggerDelayMs: 600 }` alongside the existing brawlers
- [ ] 5.5 Update `zone-1c` in `spawnZones` to add `{ archetype: 'rusher', count: 1, staggerDelayMs: 500 }` and `{ archetype: 'knife-thrower', count: 1, staggerDelayMs: 800 }` alongside the existing brawlers

## 6. Tests — New and updated test coverage

- [ ] 6.1 Create `src/__tests__/GoLiveQA.test.ts` — timer expiry integration: mock `_stageManager.isCleared = false`, emit `TIMER_EXPIRED` on scene events, assert `triggerGameOver` called
- [ ] 6.2 Add test: `_stageManager.isCleared = true` → `triggerGameOver` NOT called on `TIMER_EXPIRED`
- [ ] 6.3 Add GameOver keyboard nav tests in `src/__tests__/GameOver.test.ts` (create file if absent): default cursor=0 on create, Down moves cursor, Up moves cursor, wrap-around both directions, Enter on "Quit" calls quitToMenu not handleContinue
- [ ] 6.4 Add stage1Data pacing tests in `src/__tests__/StageData.test.ts` (create file if absent): first trigger worldX ≤ 768, each zone count ≥ 2, total enemies ≥ 8, ≥ 2 archetypes by zone-3
- [ ] 6.5 Verify `physics-coexistence` by adding one assertion to `src/__tests__/GoLiveQA.test.ts`: `scene.physics.world.colliders.getActive()` contains no entry whose object1 is the player sprite and object2 is an enemy sprite (or vice versa)

## 7. Run all tests and verify

- [ ] 7.1 Run `npm run test` inside `finalfight-AAA/` and confirm all tests pass (0 failures)
