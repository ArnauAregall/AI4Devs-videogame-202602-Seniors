## Why

The game-loop and player subsystems provide a fixed-timestep scene and a controllable character, but there is no scrollable environment for gameplay to take place in. The stage subsystem introduces the horizontal beat-em-up world: parallax backgrounds, camera scroll-lock zones, enemy spawning, destructible props, item pickups, and the clear / transition logic that links the three stages together.

## What Changes

- Introduce a `StageManager` that owns camera scroll, scroll-trigger locking, and stage-clear detection.
- Introduce `ParallaxBackground` that renders 3+ tiling layers at distinct scroll speeds (FR-ST-04, FR-ST-05).
- Introduce `SpawnZone` data model and `SpawnController` that staggers enemy entries from the right edge (FR-ST-07, FR-ST-08).
- Introduce `DestructibleProp` game object with destruction animation and optional item reveal (FR-ST-09, FR-ST-10).
- Introduce `ItemPickup` game object with auto-despawn timer (FR-ST-15, FR-ST-18).
- Add `StageData` TypeScript constant files for all three stages (FR-ST-13, FR-ST-16).
- Add boundary-wall collision bodies (FR-ST-14).
- Add countdown timer that triggers Time Up state (FR-ST-17).
- Update `GameScene` to integrate `StageManager` into the fixed-timestep loop.
- Update `game-scene` spec: add `stageManager` field, `getStageManager()` accessor.

## Capabilities

### New Capabilities

- `stage-manager`: Camera horizontal scroll with one-way lock, scroll-trigger–zone binding, stage-clear detection and transition sequencing (fade-to-black → next stage or end screen).
- `parallax-background`: Three or more tiling `TileSprite` layers rendered at distinct fractional scroll speeds; seamless horizontal tiling; updates in fixed-timestep update.
- `spawn-zone`: Data model (`SpawnZoneData`) describing enemy archetype, count, trigger type, and stagger delay; `SpawnController` reads these data objects and emits spawn events on a per-enemy timer.
- `destructible-prop`: Phaser `Image`/`Sprite` with HP, a hit reaction, a destruction animation, and an optional item-reveal on death; two concrete subtypes — barrel and crate — differentiated by data, not subclass.
- `item-pickup`: Dropped collectible with type (`health` | `score`), ground-plane position, 15-second auto-despawn, overlap detection against the player.
- `stage-data`: Exported TypeScript constant objects for `stage1`, `stage2`, `stage3`; each defines scroll-trigger positions, spawn-zone definitions, parallax layer speeds, prop positions, and boundary extents.
- `stage-timer`: Fixed-tick countdown from 180 s; at zero transitions to `TimeUp` state.

### Modified Capabilities

- `game-scene`: Add `stageManager` field (`StageManager | null`), `getStageManager()` accessor, `playerHitboxGroup` interaction with prop hurtboxes.

## Impact

- `finalfight-AAA/src/stage/` — new directory (StageManager, ParallaxBackground, SpawnZone, SpawnController, DestructibleProp, ItemPickup, StageTimer, StageData types)
- `finalfight-AAA/src/data/` — new directory (stage1Data.ts, stage2Data.ts, stage3Data.ts)
- `finalfight-AAA/src/game/scenes/GameScene.ts` — updated to integrate StageManager
- `finalfight-AAA/public/assets/stage/` — all assets already provisioned
- Depends on: `PlayerController` (for overlap / damage), `GameScene` fixed-timestep loop, `GameConfig` constants
