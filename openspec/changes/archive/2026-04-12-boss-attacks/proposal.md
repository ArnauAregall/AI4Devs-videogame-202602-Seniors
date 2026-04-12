## Why

The boss currently has a single attack, making the encounter flat and predictable. Introducing a dual-attack repertoire — a standard attack and a rarer, harder-hitting critical attack with a telegraph phase — creates a threatening, rhythmic encounter that rewards player skill and makes the boss feel like a genuine climax to the stage.

## What Changes

- The boss gains a designated **standard attack** backed by a named constant for damage, knockback, and cooldown.
- The boss gains a **critical attack** with: a probabilistic selection gate, significantly higher damage and knockback, a 5-second cooldown (300 ticks), and a visually distinct telegraph/charge animation phase before the hit lands.
- A new **`BossAttackController`** internal class (or equivalent module within `BossController`) owns the two-attack decision logic, cooldown countdown, and telegraph state.
- The `BossController` is updated to delegate attack-selection to the new system instead of using a single attack.
- New animation states `BOSS_ANIM_CRITICAL_TELEGRAPH` and `BOSS_ANIM_CRITICAL_ATTACK` are registered using existing provisioned sprites (`boss-attack-3` for telegraph, `boss-attack-4` for critical hit).
- Named configuration constants are added to `EnemyConfig.ts` for all tunable values (standard damage, critical damage, critical probability, cooldown ticks, telegraph duration, knockback values, hit-stun durations).

## Capabilities

### New Capabilities

- `boss-standard-attack`: Boss executes a standard melee attack animation on proximity, applying damage via the established hitbox/hurtbox model with defined damage, knockback, and cooldown constants.
- `boss-critical-attack`: Boss selects a critical attack with low probability, plays a distinct telegraph animation first, then delivers a hit dealing greater damage and knockback than the standard attack, gated by a 5-second cooldown that starts when the telegraph begins.

### Modified Capabilities

- `boss-controller`: The attack-selection logic changes from a single attack to a two-path decision (standard vs critical) with cooldown tracking and telegraph state transitions.

## Impact

- `finalfight-AAA/src/enemy/BossController.ts` — updated attack decision logic, cooldown field, new state transitions
- `finalfight-AAA/src/enemy/EnemyConfig.ts` — new named constants for all boss attack parameters
- `finalfight-AAA/src/enemy/EnemyAnimations.ts` — new animation registrations for critical telegraph and critical attack states
- `finalfight-AAA/src/assets/AssetKeys.ts` — no new asset keys needed; `boss-attack-3` and `boss-attack-4` already provisioned
- No breaking changes to existing combat system or player subsystem interfaces.
