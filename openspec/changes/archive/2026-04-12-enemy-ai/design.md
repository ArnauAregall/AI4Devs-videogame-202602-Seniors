# Design — enemy-ai

## D-01: Composition via abstract base class

All enemy archetypes extend a single abstract `EnemyController` class that owns the `EnemyStateMachine`, the hurtbox registration lifecycle, and the hurt/knockdown/death sequencing. Archetype-specific logic is placed in `_onEnterAttack()` and `_onUpdateAggro()` abstract method overrides. This avoids deep inheritance chains while sharing the 90 % of behaviour that is identical across all archetypes.

**Alternatives considered:**
- Pure composition (Strategy pattern): rejected — too much boilerplate for the small number of archetypes in scope.
- Separate classes with no base: rejected — would duplicate hurt/death/hurtbox registration across 5 classes.

## D-02: CombatSystem integration — same hitbox/hurtbox API

Enemies register their hurtboxes with CombatSystem using `registerHurtbox(id, rect, 'enemy')` identically to how the player registers theirs. When attacking, each enemy calls `registerHitbox(id, rect, 'enemy', damage, knockbackX, knockbackY, hitStunFrames, facing)` and removes it at the end of the attack state. The CombatSystem's team-tag filter ensures enemies cannot hit each other. `EnemyManager` subscribes to `onHit` and routes incoming `HitEvent`s to the correct enemy via `id`.

## D-03: AttackerCoordinator — token model

A single `AttackerCoordinator` instance is shared across all active enemies via `EnemyManager`. It holds a counter (0–2). An enemy calls `requestAttackToken()` before entering Attack state; if the counter is at the maximum, the request fails and the enemy stays in Aggro until it can obtain a token. The enemy calls `releaseToken()` in the exit hook of the Attack, Hurt, Knockdown, or Death state. This naturally staggers approaches (FR-EA-16) without explicit timing logic.

## D-04: Open Question resolution — de-aggro condition

The requirement file asks: *"Should enemies have a de-aggro condition (e.g. if the player moves far enough away, the enemy returns to Patrol)?"*

**Decision: No de-aggro.** Once an enemy transitions to Aggro, it stays aggro'd until it dies or the stage clears. This simplifies implementation, matches classic arcade beat-'em-up conventions (Final Fight, Streets of Rage), and avoids edge cases where enemies oscillate between Patrol and Aggro near the detection boundary. If a de-aggro mechanic is desired in future, it can be added as an optional flag per archetype config without changing the base class FSM.

## D-05: Boss phase transitions via tween + state pause

When the boss crosses a phase threshold (50 % or 25 % HP), it:
1. Sets `_transitioning = true`, which skips AI updates for `BOSS_TRANSITION_FRAMES` ticks.
2. Fires a Phaser tween (scale bounce + colour flash) as the visual signal.
3. Unlocks the new attack type permanently by setting a `_phase` integer.

This avoids a separate "Transition" state in the FSM, keeping the state count to the seven defined states shared with all archetypes.

## D-06: Knife projectile — CombatSystem integration

`KnifeProjectile` is not a CombatSystem hitbox. Instead it updates its own position each tick and calls `combatSystem.registerHitbox(...)` / `removeHitbox(...)` around the single tick where it checks for player overlap. This is equivalent to how player attacks register a hitbox for one swing. Reflection is handled by checking whether a registered player hitbox overlaps the projectile's rect in the same tick; if so, `reflected` is set and velocity reversed before the hitbox check against the player fires. This ensures a deflected knife never hits the player on the same tick it is reflected.

## D-07: EnemyManager integrates with SpawnController events

`EnemyManager` listens for `enemySpawn` events from `SpawnController` (already emitted by the stage subsystem). On each event it receives `{ type, x, y }` and calls the appropriate `EnemyController` factory. `enemyDefeated` is emitted back to `SpawnController` via the shared Phaser event emitter so zone-clear logic continues to work. No changes to `SpawnController` are needed.
