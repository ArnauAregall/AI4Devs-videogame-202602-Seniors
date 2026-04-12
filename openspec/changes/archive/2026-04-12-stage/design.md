## Context

The game-loop subsystem provides `GameScene` with a fixed-timestep accumulator and `registerFixedUpdate` hook. The player subsystem provides `PlayerController` with position, HP, and hitboxes. The stage subsystem layers the environment on top: it must drive the camera, render a parallax background, manage spawn zones, and handle props/items — all within the same fixed-timestep budget.

Phaser 3 is used with TypeScript strict mode and Vite. The renderer is WebGL. Background layers are `TileSprite` objects (GPU-tiled, no memory copies). Physics is Arcade (static bodies for walls; no physics needed for parallax layers themselves).

## Goals / Non-Goals

**Goals:**
- One-way horizontal camera that scroll-locks at triggers until enemies clear.
- ≥ 3 seamlessly tiling parallax layers at distinct speeds.
- Data-driven spawn zones with staggered enemy entry.
- Two destructible prop types (barrel, crate) with destruction animation and item reveal.
- Item pickups (health, score) with 15 s auto-despawn.
- 180 s countdown timer; Time Up transition.
- Stage clear detection → fade → next stage or end screen.
- Three stage data files as TypeScript constants; no stage logic in data files.

**Non-Goals:**
- Vertical scrolling or elevation layers.
- Multiplayer.
- Procedural or dynamic stage layouts.
- Enemy AI logic (covered by enemy-ai subsystem); this subsystem only *spawns* them.
- Boss phase transitions (combat-system/enemy-ai responsibility).

## Decisions

**D-01 — TileSprite for parallax layers**
`Phaser.GameObjects.TileSprite` handles infinite horizontal tiling natively on the GPU with `tilePositionX`. Each layer's `tilePositionX` is updated every fixed tick proportional to camera delta × layer speed factor. Alternative (manual canvas stamp) was rejected: higher CPU cost, seam risk.

**D-02 — Camera is a logical value, not a Phaser camera**
`StageManager` keeps a `cameraX: number` that represents the left edge of the viewport in world space. On each render tick, sprite positions are adjusted relative to `cameraX` (or the scene's Phaser camera `scrollX` is set to `cameraX`). Using `scene.cameras.main.scrollX` directly avoids creating a custom camera and keeps compatibility with Phaser's built-in bounds. One-way lock: `cameraX` only increases, capped at `maxScrollX - CANVAS_WIDTH`.

**D-03 — Scroll-trigger as a sorted list of `ScrollTrigger` objects**
Each `ScrollTrigger` has `{ worldX, zoneId }`. `StageManager.fixedUpdate` checks if `cameraX + CANVAS_WIDTH >= trigger.worldX` and the trigger is not yet fired. When fired, `StageManager` locks camera advance and activates the corresponding `SpawnZone`. Camera unlocks when `SpawnController` for that zone emits `'zoneCleared'`.

**D-04 — SpawnController emits typed events, does not call GameScene directly**
`SpawnController` extends `Phaser.Events.EventEmitter`. `StageManager` listens for `'enemySpawn'` (data: `{ archetype, x, y }`) and `'zoneCleared'`. This decouples spawn logic from the enemy-ai implementation that will be provided later. For now, `'enemySpawn'` events are dispatched on a shared `GameScene` event bus; enemy-ai will register listeners.

**D-05 — DestructibleProp uses a single sprite + HP number; no physics body**
Props occupy a fixed world position. Overlap is detected via manual rect-vs-rect check in `StageManager.fixedUpdate` against active hitboxes from `playerHitboxGroup`. No Arcade body on the prop itself — avoids physics stepping cost for static objects. At HP zero, an animation plays (`prop-barrel-destroy` placeholder = hurt key scaled), then the sprite is destroyed and an `ItemPickup` may be created.

**D-06 — ItemPickup uses Arcade overlap with player sprite**
`ItemPickup` is an `Phaser.GameObjects.Image` added to a `itemPickupGroup` (static group). `scene.physics.add.overlap(player.sprite, itemPickupGroup, onCollect)` handles pickup. A 15 s countdown (tick-based) calls `ItemPickup.despawn()` which plays a fade-out tween and destroys the object.

**D-07 — StageData is a plain TypeScript const object, not a class**
```ts
export const stage1Data: StageData = { ... };
```
`StageData` type lives in `src/stage/StageData.ts`. Each stage file (`src/data/stage1Data.ts`) imports `StageData` and exports a single const. `GameScene` imports the correct data file based on `GameConfig.STAGE_COUNT` and a runtime stage index.

**D-08 — Stage timer runs in fixed-timestep ticks**
`StageTimer` decrements `ticksRemaining` by 1 each fixed tick. `ticksRemaining = 180 * TARGET_FPS`. This is frame-rate independent. When `ticksRemaining` reaches 0, `StageTimer` emits `'timeUp'`; `StageManager` forwards to `scene.scene.start('TimeUp')`.

## Risks / Trade-offs

- **TileSprite seam on layer wider than canvas** → Layers must be wider than `CANVAS_WIDTH`; the cyberpunk layers are 512 px and canvas is 480 px so they tile correctly. Verify with narrow-viewport test.
- **SpawnController decoupling defers enemy rendering** → `'enemySpawn'` events will be no-ops until enemy-ai subsystem is wired. Integration checkpoint for stage will show trigger firing and `console.log` of spawn events, not actual enemies.
- **Prop hit detection without physics bodies** → Rect-vs-rect is O(props × hitboxes) per tick; acceptable for ≤ 30 props per stage. If count grows, a spatial hash can be added later.
- **Camera scrollX vs world coordinates** → All world-space positions in `StageData` are in world coordinates. Sprites representing props/items must be translated to screen space each tick: `screenX = worldX - cameraX`. This is a known performance tradeoff (no true Phaser world map) acceptable for a 5000 px stage.

## Open Questions

- (Closed) Are vertical elevation layers needed? → No (single ground plane, confirmed by requirements).
- (Open) Should destructible prop animations use a dedicated spritesheet or the existing `prop-barrel.png` scaled/tinted? → Decision: use a 2-frame manual tween (scale-up then disappear) as a placeholder until a proper destruction sprite is sourced. Implement with a Phaser tween, not a spritesheet animation.
