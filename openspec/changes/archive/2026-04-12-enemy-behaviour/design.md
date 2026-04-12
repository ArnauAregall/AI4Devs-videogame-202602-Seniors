## Context

`EnemyController` creates a sprite with a single `textureKey` set at construction and never changes it.  All four archetypes (Brawler, Rusher, Knife Thrower, Boss) pass `ASSET_KEY_PUNK_IDLE` as `textureKey`, so the sprite is visually identical across all states. The combat system already registers enemy hitboxes that overlap the player hurtbox and dispatches a `HitEvent(teamTag='enemy', targetId='player')`, but `GameScene.onHit` only handles `event.teamTag === 'player'` (combo tracking), so the player never takes damage from enemy attacks. No health bar exists for regular enemies.

## Goals / Non-Goals

**Goals:**
- Wire per-state Phaser animations to state-machine transitions in `EnemyController`
- Keep animation configuration (clip names, frame counts, frame rates, active-frame windows) as named constants in `EnemyConfig.ts` per archetype
- Bridge the existing `CombatSystem` hit dispatch to `player.takeDamage()` in `GameScene`
- Add a world-space `EnemyHealthBar` component owned by `EnemyController`

**Non-Goals:**
- Sourcing dedicated sprites for Rusher, Knife Thrower, or Boss archetypes (punk sheets used as placeholder)
- Sourcing a dedicated death sprite for the Punk archetype (punk-hurt used as placeholder)
- Changing any hitbox geometry, damage values, or AI state-machine logic
- Adding new attack archetypes or new damage types

## Decisions

### Decision 1 — Animation config injected via EnemyControllerConfig

**Options considered:**
A. Hard-code animation key lookup inside `EnemyController._onEnterState()` by matching textureKey prefix.
B. Inject an `animKeys: Record<EnemyState, string>` map through `EnemyControllerConfig`.
C. Each subclass overrides a `_getAnimKey(state)` abstract method.

**Decision: B (injected map)**
Rationale: Option A couples base class to asset-naming conventions; Option C requires a method call on every state entry. A typed map injected at construction is the lowest coupling, co-locates data with the archetype constant block, and is trivially mockable in tests.

The base class adds `readonly _animKeys: Readonly<Record<EnemyState, string>>` and calls `this._sprite.play(this._animKeys[state], true)` in `_onEnterState`.

### Decision 2 — Enemy health bar as a Graphics object owned by EnemyController

**Options considered:**
A. Phaser Container with two Rectangle game objects (background + fill).
B. Two `Phaser.GameObjects.Graphics` draw calls each frame.
C. A standalone `EnemyHealthBar` class wrapping a Graphics object.

**Decision: C (standalone class)**
Rationale: Option A (Container) incurs a layout pass every frame for world-space positioning. Option B scatters health-bar logic into `EnemyController`. A small standalone class keeps the concern isolated, is independently testable, and exposes `update(hp, maxHp, x, y)` and `destroy()` — the exact interface `EnemyController` needs.

### Decision 3 — Enemy-to-player damage bridge lives in GameScene

**Options considered:**
A. `PlayerController` subscribes to `CombatSystem.onHit` and handles `teamTag === 'enemy'` events.
B. `GameScene` extends its existing `onHit` callback to handle enemy-team events.

**Decision: B (GameScene)**
Rationale: Option A couples `PlayerController` to `CombatSystem` for a second subscription purpose (it already registers a hurtbox). Option B keeps the pattern consistent with how `EnemyController` handles hits — the scene owns the wiring. The incremental diff is minimal: add one `else if` branch to the existing `onHit` lambda.

### Decision 4 — Facing-direction flip updated every fixedUpdate tick

`sprite.setFlipX(!this._facingRight)` is added to `fixedUpdate()` (not only on state transitions) because `_facingRight` may change during Patrol, Aggro, and Attack ticks. This is O(1) per tick and has no frame-budget impact.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Placeholder sprites (punk-hurt reused for death) look identical to hurt | Acceptable until sourcing; placeholder path is a named constant, swappable in one line |
| All 4 archetypes share punk sprite sheets — no visual differentiation | Acceptable until per-archetype assets are available; placeholder keys are archetype-prefixed in EnemyConfig so they can diverge independently |
| `anims.create()` called multiple times (if GameScene restarts) | Guard with `if (!this._scene.anims.exists(key))` before each `anims.create()` call |
| Health bar `Graphics` redrawn every tick for 6 enemies = ~6 draw calls/frame | Acceptable; only redraw when HP changes (compare `_lastHp` in `EnemyHealthBar.update()`) |
| GameScene `onHit` callback receives every hit every frame — O(N) listeners | Already the case; adding one conditional branch is negligible |

## Open Questions

- OQ-D-01: Should the enemy health bar use a Phaser Container for depth management, or is `setDepth()` on the Graphics object sufficient? Recommend `setDepth(GameConfig.ENTITY_DEPTH + 1)` which keeps bar above enemy sprite without a Container. Proceed with this unless reviewer objects.
- OQ-D-02: Should `player.applyKnockback(event.knockbackX, event.knockbackY)` be called from the GameScene hit handler, or should `takeDamage` accept a full `HitEvent`? Recommend passing knockback through a dedicated `applyHit(event: HitEvent)` method on `PlayerController` to keep the interface symmetric with `EnemyController._applyHit()`.
