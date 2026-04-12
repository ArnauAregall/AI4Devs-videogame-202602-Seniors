## Context

The player and stage subsystems are fully implemented and archived. The player has animation states for jab, punch, kick, jump-kick, dive-kick, and special attack, as well as a `takeDamage(amount)` method and a `heal(amount)` method. The stage manages scrolling and spawn zones but no enemy-attack-to-player damage yet exists. There is no hit-detection, no hurtbox registry, and no combo tracking anywhere in the codebase.

The game runs at a fixed 60 fps logical tick via `GameScene._fixedUpdate`. All physics-adjacent logic must run inside this tick to avoid frame-rate–dependent behaviour.

The enemy-ai subsystem has not yet been implemented; it depends on `combat-system` being archived first. The `CombatSystem` must therefore expose a stable, minimal surface area that the enemy-ai implementer can call into without knowing the internals.

## Goals / Non-Goals

**Goals:**
- Per-tick rectangular hitbox/hurtbox overlap detection, team-filtered.
- One-hit-per-swing guard: a hitbox instance may register at most one hit per activation window.
- `HitEvent` value type carrying everything a character needs to respond to being hit.
- `ComboTracker` per-target sliding window, diminishing-returns damage, hit-stun scaling.
- Named constants for all hitbox/hurtbox sizes, damage values, knockback, stun durations, and the combo window.
- Toggle-able debug overlay drawing hitboxes (red) and hurtboxes (green) via `GameConfig.DEBUG_HITBOXES`.
- Grab special-casing: proximity range check instead of hurtbox overlap; grab sequence grants invincibility.

**Non-Goals:**
- AI decision logic (belongs to enemy-ai).
- Network/multiplayer synchronisation.
- Physics-engine integration (no rigid bodies; all movement is manual positional updates).
- Particle effects on hit (can be added later as a visual subsystem).

## Decisions

### D-01 — Combo window is frame-count based, not wall-clock based

**Decision:** The combo window is measured in fixed-update ticks (frames), not milliseconds.

**Rationale:** NFR-CS-03 requires at least one fixed-timestep resolution. Using frames avoids float precision issues and is consistent with how hit-stun is already expressed in other requirements (FR-CS-13: "defined number of frames"). At 60 fps, 30 ticks = 500 ms which is a typical combo window for the genre.

**Alternative considered:** wall-clock ms via `Date.now()`. Rejected because it would break under slow devices where fixed ticks run less frequently than real time — a 30-tick window would inflate to >500 ms.

**Constant:** `COMBO_WINDOW_FRAMES = 30` in `CombatConfig.ts`.

### D-02 — Hitbox activation via explicit register/remove, not per-frame scan

**Decision:** Characters call `CombatSystem.registerHitbox(id, rect, teamTag, damage, knockback, hitStun, facing)` when attack frames begin, and `CombatSystem.removeHitbox(id)` when they end. The detection loop only iterates registered (active) hitboxes.

**Rationale:** Limits the loop to O(activeHitboxes × activeHurtboxes). At the expected maximum of 6 simultaneously active hitboxes (NFR-CS-02), this is trivially fast. It also makes the one-hit-per-swing guard simple: a `Set<string>` of `hitboxId + targetId` pairs cleared on `removeHitbox`.

**Alternative considered:** scanning all character bounding rects each tick. Rejected — couples combat to character state and makes the one-hit guard harder.

### D-03 — Diminishing returns formula

**Decision:** `effectiveDamage = max(DAMAGE_FLOOR, baseDamage * max(0.1, 1.0 - 0.1 * (comboCount - 1)))`

This gives:
- Hit 1: 100 %
- Hit 2: 90 %
- Hit 3: 80 %
- …
- Hit 10+: 10 % (floor)

**Constant:** `DAMAGE_FLOOR = 1`, `DIMINISHING_STEP = 0.10`, `DIMINISHING_MIN_FACTOR = 0.10`.

### D-04 — Hit-stun scaling formula

**Decision:** `hitStunFrames = baseHitStun + comboCount * HIT_STUN_COMBO_INCREMENT`

`HIT_STUN_COMBO_INCREMENT = 2` (each extra hit in the combo adds 2 frames of stun). Cap at `HIT_STUN_MAX_FRAMES = 60` (1 second).

### D-05 — Grab bypasses hurtbox entirely

**Decision:** Grab does a raw distance check (`dx < GRAB_RANGE && dy < GRAB_HEIGHT_TOLERANCE`) in `CombatSystem.tryGrab()`. If it succeeds, the attacker enters grab-active state (invincible) and dispatches a `HitEvent` at the throw-impact frame with `isGrab: true`. No hitbox is registered.

**Rationale:** FR-CS-15/20 specify proximity + invincibility + damage-at-throw. Keeping grab out of the normal hitbox pipeline simplifies the one-hit guard and the debug overlay.

### D-06 — Debug overlay uses a persistent Phaser.Graphics object

**Decision:** `DebugRenderer` creates one `Phaser.GameObjects.Graphics` instance at scene start and calls `clear()` + draw calls every `update()` (render frame, not fixed tick). It reads the current hitbox and hurtbox lists from `CombatSystem`.

**Rationale:** NFR-CS-04 requires runtime toggle without reload. A Graphics object can be hidden/shown without destroying it. Drawing happens in `update()` so the overlay interpolates smoothly.

## Risks / Trade-offs

- **Hitbox list mutation during iteration** → Mitigation: iterate a snapshot copy; process registrations/removals at the start of each tick.
- **Enemy-ai not yet implemented** → `CombatSystem.registerHurtbox()` will be called by enemy-ai. We expose the API now with integration tested via a stub in unit tests.
- **Fixed-tick drift at very low frame rates** → Out of scope per Non-Goals; the engine's fixed-tick loop handles this at the GameScene level.
- **Grab invincibility window too long** → Configurable via `GRAB_INVINCIBILITY_FRAMES`; not a code risk.

## Open Questions

- **OQ-01 (resolved):** Combo window is frame-count based — 30 ticks = 500 ms at 60 fps. This resolves the open question in `requirements/combat-system.md`.
