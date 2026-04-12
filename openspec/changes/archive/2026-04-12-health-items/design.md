## Context

`DestructibleProp` currently reduces HP on each hit and destroys the prop when HP reaches zero. The HP value in `PropDef` controls how many hits are needed (currently 3 for barrels) but the prop has no visual feedback between the first hit and destruction — it simply disappears. The `ItemPickup` system was designed for player-only collection with a mandatory 15-second despawn timer. Neither system was designed with enemy participation in mind.

The health-items change must extend both systems without breaking the combat-system or stage subsystems that depend on them.

## Goals / Non-Goals

**Goals:**
- Add visual intermediate damage states (healthy → damaged → crushed) to barrel props
- Extend `DestructibleProp.hit()` to accept enemy attack damage in addition to player attack damage
- Replace single-optional-drop with random 1–3 sushi item spawn on barrel destruction
- Allow enemy entities to collect `ItemPickup` health items by spatial overlap
- Make the despawn timer optional per item type (null = no expiry for sushi drops)
- Add pickup state-exclusion for knockdown/death/invincibility entities
- Emit events so HUD and enemy overhead bars update on pickup

**Non-Goals:**
- Score item drops from barrels (out of scope for this change)
- Enemy AI pathfinding toward health items (FR-HI-25 explicitly excludes this)
- Crate-type destructible prop visual states (only barrel has health-item drop semantics)
- Persisting item positions across stage zones or continues (items are scene-local)

## Decisions

### D-01: Hit count vs HP for visual state transitions
**Decision:** Use `_hitCount` (already tracked on `DestructibleProp`) as the trigger for state transitions, not remaining HP. Thresholds: `_hitCount === 1` → damaged state, `_hitCount === 2` → crushed state, `_hitCount >= def.hp` → destroy.

**Rationale:** The prop's `def.hp = 3` already defines max hits. Using hit count avoids fractional-damage edge cases (a single heavy attack could one-shot a barrel if we used raw HP thresholds). Hit count gives predictable, player-legible state transitions regardless of attack damage values.

**Alternative considered:** Percentage-HP thresholds (33%/66%). Rejected because attack damage varies widely and an enemy might skip states entirely with a high-damage hit.

### D-02: Enemy hitbox acceptance in DestructibleProp
**Decision:** Change `DestructibleProp.hit()` to be a public method callable by any system — player combat manager, enemy controller, or `GameScene`. Remove the implicit player-only assumption. The caller passes only a damage value (no attacker reference needed).

**Rationale:** `DestructibleProp` already has a generic `hit(damage: number)` signature. The player-only restriction lives in `GameScene`'s hitbox query loop, not in `DestructibleProp` itself. The fix is to add a parallel loop in `GameScene.fixedUpdate()` that queries each active enemy's hitbox against active props — no API change to `DestructibleProp` required.

### D-03: Despawn timer as optional
**Decision:** Change `ItemPickup` constructor to accept `despawnTicks: number | null`. When `null`, no timer event is created. Existing callers that pass a number are unaffected.

**Rationale:** Minimal surface change. Avoids introducing an `ItemType` config object just to hold a single optional value.

### D-04: Enemy pickup via GameScene poll
**Decision:** `GameScene.fixedUpdate()` polls each active `ItemPickup` against each active enemy hurtbox bounds every tick (same approach as player overlap). No change to `EnemyController` API.

**Rationale:** Keeps `ItemPickup` ignorant of enemy internals. Poll cost is negligible for the expected scene population (≤ 12 items × ≤ 8 enemies = 96 checks/tick).

### D-05: State exclusion source
**Decision:** `GameScene` checks `enemy.state` (or `player.isInvincible / isKnockedDown`) before calling `itemPickup.collect(entity)`. `ItemPickup` itself does not know about entity states.

**Rationale:** State knowledge lives in the entity controllers, not in the pickup. This avoids coupling `ItemPickup` to `EnemyState` enum values.

## Risks / Trade-offs

- **Simultaneous pickup by two entities:** Two entities overlapping the same item in the same tick. Mitigated by D-04: `ItemPickup.collect()` marks the item inactive immediately on first call; a guard `if (this._collected) return` prevents double-collection. → Mitigation: add `_collected` guard.
- **FR-HI-14 vs FR-IP-02 conflict:** New requirements explicitly say no timer; existing spec says 15 s. → Resolved by D-03 making timer optional. Delta spec for `item-pickup` documents this as a MODIFIED requirement.
- **Scatter positioning out of bounds:** Random scatter could place sushi outside the walkable ground plane. → Clamp spawn Y to `[GROUND_PLANE_TOP, GROUND_PLANE_BOTTOM]` and X to stage width.
