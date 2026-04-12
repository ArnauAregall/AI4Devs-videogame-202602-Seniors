## 1. Project Structure

- [x] 1.1 Create `finalfight-AAA/src/player/` directory
- [x] 1.2 Create `finalfight-AAA/src/input/` directory

## 2. GameConfig Constants

- [x] 2.1 Add `PLAYER_MAX_HP = 100` to `GameConfig.ts`
- [x] 2.2 Add `PLAYER_LIVES = 3` to `GameConfig.ts`
- [x] 2.3 Add `RESPAWN_IFRAMES = 180` (3 seconds at 60fps) to `GameConfig.ts`
- [x] 2.4 Add `GETUP_IFRAMES = 60` (1 second) to `GameConfig.ts`
- [x] 2.5 Add `PLAYER_WALK_SPEED = 80` (px/s) to `GameConfig.ts`
- [x] 2.6 Add `CAMERA_MAX_SCROLL_SPEED = 80` to `GameConfig.ts`
- [x] 2.7 Add `JUMP_VELOCITY = 200` to `GameConfig.ts`
- [x] 2.8 Add `GROUND_TOP = 100` and `GROUND_BOTTOM = 190` to `GameConfig.ts`
- [x] 2.9 Add `SPECIAL_ATTACK_HP_COST = 20` to `GameConfig.ts`
- [x] 2.10 Add `SPECIAL_COOLDOWN_TICKS = 600` (10s × 60fps) to `GameConfig.ts`
- [x] 2.11 Add `SPECIAL_ATTACK_RADIUS = 120` to `GameConfig.ts`

## 3. Player State Machine

- [x] 3.1 Create `src/player/PlayerState.ts` with `PlayerState` enum (11 values)
- [x] 3.2 Create `src/player/PlayerStateMachine.ts` with `legalTransitions` map and `transition(newState)` method
- [x] 3.3 Implement enter/exit hook callbacks (`onEnter`, `onExit`) per state in `PlayerStateMachine`
- [x] 3.4 Add `canTransition(from, to)` helper that returns boolean without mutating state

## 4. InputState and InputManager

- [x] 4.1 Create `src/input/InputState.ts` with `InputState` interface: `left, right, up, down, jump, lightAttack, heavyAttack, grab, specialAttack` (all booleans)
- [x] 4.2 Create `src/input/InputManager.ts` with `poll(): Readonly<InputState>` method
- [x] 4.3 Register keyboard keys in `InputManager` constructor using Phaser's `keyboard.addKey`
- [x] 4.4 Map default keyboard bindings (FR-PL-12): arrows/WASD, Z/J, X/K, C/L, Space, Enter
- [x] 4.5 Add gamepad polling in `poll()` for Phaser's `this.input.gamepad.pad1` (null-safe)
- [x] 4.6 OR-combine keyboard and gamepad into single snapshot
- [x] 4.7 Register gamepad `connected`/`disconnected` event handlers; log warnings, no throws

## 5. PlayerController — Core

- [x] 5.1 Create `src/player/PlayerController.ts` class accepting `scene: GameScene` and `x, y: number` as constructor args
- [x] 5.2 Create a `Phaser.Physics.Arcade.Sprite` at (x, y) using `ASSET_KEY_PLAYER_IDLE`
- [x] 5.3 Store `PlayerStateMachine` instance; wire `onEnter`/`onExit` hooks to animation and hitbox methods
- [x] 5.4 Implement `registerFixedUpdate` call in constructor and `unregisterFixedUpdate` in `destroy()`
- [x] 5.5 Implement `fixedUpdate(dt: number)` entry point: poll input → state machine → physics

## 6. PlayerController — Animations

- [x] 6.1 Define Phaser animation configs for all 9 available spritesheets with correct frameRate and repeat flags
- [x] 6.2 Map `PlayerState` → animation key in a lookup table
- [x] 6.3 Call `sprite.play(key, ignoreIfPlaying)` on state enter
- [x] 6.4 Wire animation `animationcomplete` event to auto-transition for one-shot states (LightAttack, HeavyAttack, Hurt, Knockdown, GetUp, SpecialAttack, Grab)

## 7. PlayerController — Hitboxes

- [x] 7.1 Create a `playerHitboxGroup: Phaser.Physics.Arcade.Group` in `GameScene`
- [x] 7.2 Define hitbox dimensions per attack state (constants, no magic numbers)
- [x] 7.3 Spawn hitbox rectangle on attack state enter; position relative to sprite and facing direction
- [x] 7.4 Destroy hitbox on attack state exit

## 8. PlayerController — Health and Lives

- [x] 8.1 Implement `takeDamage(amount: number)` checking `iFramesRemaining === 0`
- [x] 8.2 Implement `onDeath()`: decrement lives, restore hp, grant respawn iFrames; call `scene.triggerGameOver()` if lives === 0
- [x] 8.3 Decrement `iFramesRemaining` by 1 each fixed tick (floor at 0)

## 9. PlayerController — Movement

- [x] 9.1 Apply velocity from `inputState` each fixed tick (PLAYER_WALK_SPEED × 60 for px/frame)
- [x] 9.2 Clamp `sprite.y` to `[GROUND_TOP, GROUND_BOTTOM]` each fixed tick
- [x] 9.3 Set `sprite.flipX` based on horizontal direction; preserve last facing direction when stationary
- [x] 9.4 Implement jump: on Jump enter set `jumpStartY` and `jumpVelocityY = -JUMP_VELOCITY`; each tick apply deceleration and check landing

## 10. PlayerController — Special Attack

- [x] 10.1 Guard SpecialAttack entry: check `hp >= SPECIAL_ATTACK_HP_COST` and `specialCooldownTicks === 0`
- [x] 10.2 On SpecialAttack enter: deduct HP cost, set `specialCooldownTicks = SPECIAL_COOLDOWN_TICKS`
- [x] 10.3 Decrement `specialCooldownTicks` by 1 each fixed tick
- [x] 10.4 Call `combatBus?.dispatchAreaDamage(this, SPECIAL_ATTACK_RADIUS)` at active-frames moment
- [x] 10.5 Make `combatBus` optional constructor argument (default `null`)

## 11. GameScene Integration

- [x] 11.1 Add `private _player: PlayerController | null = null` to `GameScene`
- [x] 11.2 Instantiate `PlayerController` in `GameScene.create()`
- [x] 11.3 Implement `getPlayer(): PlayerController | null` accessor on `GameScene`
- [x] 11.4 Implement `triggerGameOver()` on `GameScene`: pause scene and launch `GameOverScene`

## 12. Tests

- [x] 12.1 Write `src/__tests__/PlayerStateMachine.test.ts`: legal transitions, illegal transitions, Hurt interrupt, SpecialAttack blocked from Knockdown
- [x] 12.2 Write `src/__tests__/InputManager.test.ts`: mock Phaser keyboard/gamepad, verify snapshot fields
- [x] 12.3 Write `src/__tests__/PlayerHealth.test.ts`: takeDamage normal, takeDamage blocked by iFrames, death → respawn, death on last life → triggerGameOver
- [x] 12.4 Write `src/__tests__/PlayerMovement.test.ts`: ground clamp top, ground clamp bottom, walk speed ≤ camera speed constant
- [x] 12.5 Write `src/__tests__/PlayerSpecialAttack.test.ts`: health cost guard, cooldown blocks repeat, dispatchAreaDamage called
- [x] 12.6 Run `npm test` and confirm all tests pass
