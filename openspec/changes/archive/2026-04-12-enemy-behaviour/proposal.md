## Why

Three gaps identified during playtesting prevent the enemy combat loop from functioning as intended: enemies render with a single static sprite regardless of their state (Gap 1), enemy attack hitboxes register overlap with the player hurtbox but no listener bridges the HitEvent to `player.takeDamage()` so players never take damage (Gap 2), and there is no per-enemy health bar to give the player feedback on their progress (Gap 3).

## What Changes

- **New**: `EnemyAnimConfig` type and per-archetype animation constants (clip keys, frame counts, frame rates, active-frame windows) co-located in `EnemyConfig.ts`
- **New**: `EnemyHealthBar` component that tracks and renders a world-space HP bar above each enemy sprite
- **Modified**: `EnemyController` — switches Phaser animation on every state transition; updates `setFlipX` every frame; creates and owns an `EnemyHealthBar` instance; health bar updated on hit
- **Modified**: `BrawlerController` — registers Phaser anims for punk spritesheet; passes anim-key map to base class
- **Modified**: `RusherController` — same (uses punk sprites as placeholder)
- **Modified**: `KnifeThrowerController` — same (uses punk sprites as placeholder)
- **Modified**: `BossController` — same (uses punk sprites as placeholder)
- **Modified**: `GameScene` — adds `onHit` listener branch for `teamTag === 'enemy'`; calls `player.takeDamage()`, applies knockback, triggers player hurt state when enemy attack connects
- **Modified**: `AssetKeys.ts` — `ASSET_KEY_PUNK_DEATH` added (placeholder reusing `punk-hurt.png`)
- **Modified**: `PreloadScene` (or equivalent) — loads `punk-death` spritesheet using new key

## Capabilities

### New Capabilities

- `enemy-animation`: Per-state Phaser animation registration and playback for all enemy archetypes. Each state transition plays the matching clip; facing-direction flip applied every frame. Animation clip names, frame counts, frame rates, and active-frame windows are named constants in `EnemyConfig.ts`.
- `enemy-attack-damage`: Bridge from the existing hitbox/hurtbox overlap detection to the player's `takeDamage()` method. Enemy hitboxes already register and register overlap in `CombatSystem`; this capability wires the dispatched `HitEvent` (teamTag `'enemy'`) to player health reduction, knockback, and hurt-state entry.
- `enemy-health-bar`: World-space HP bar rendered above each non-boss enemy sprite using `Phaser.GameObjects.Graphics`. Bar width, height, offset, and colours are named constants. Bar follows the sprite every frame, updates same frame as HP change, and is removed when Death state begins.

### Modified Capabilities

- `enemy-controller`: State-transition animation switching + per-frame flip update + health bar ownership and update
- `brawler-controller`: Phaser anim registration for punk spritesheet
- `rusher-controller`: Phaser anim registration (placeholder punk sprites)
- `knife-thrower-controller`: Phaser anim registration (placeholder punk sprites)
- `boss-controller`: Phaser anim registration (placeholder punk sprites)
- `game-scene`: Enemy-hit-to-player-damage wiring in `onHit` callback

## Impact

- `finalfight-AAA/src/enemy/EnemyConfig.ts` — new anim constants block
- `finalfight-AAA/src/enemy/EnemyController.ts` — anim switching, flip update, health bar
- `finalfight-AAA/src/enemy/BrawlerController.ts` — anim registration
- `finalfight-AAA/src/enemy/RusherController.ts` — anim registration
- `finalfight-AAA/src/enemy/KnifeThrowerController.ts` — anim registration
- `finalfight-AAA/src/enemy/BossController.ts` — anim registration
- `finalfight-AAA/src/enemy/EnemyHealthBar.ts` — new file
- `finalfight-AAA/src/game/scenes/GameScene.ts` — enemy-hit wiring
- `finalfight-AAA/src/assets/AssetKeys.ts` — `ASSET_KEY_PUNK_DEATH` (already added in Phase 1)
- All tests that mock enemy sprites must expose `play: vi.fn()` and `anims` mock
