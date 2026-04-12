## ADDED Requirements

### Requirement: Knife projectile travels and hits player
`KnifeProjectile` SHALL travel at `KNIFE_SPEED` px/tick in the horizontal direction it was thrown. Each tick it calls `combatSystem.registerHitbox` / `removeHitbox` for a one-tick window and may deal `KNIFE_DAMAGE` with LIGHT knockback to the player. It is destroyed after hitting a target or travelling `KNIFE_MAX_RANGE` px. References: FR-EA-04.

#### Scenario: Projectile deals damage on player overlap
- **WHEN** knife rect overlaps player hurtbox and reflected = false
- **THEN** a HitEvent is dispatched to the player and the knife is destroyed

#### Scenario: Projectile is destroyed at max range
- **WHEN** projectile has travelled KNIFE_MAX_RANGE px
- **THEN** it is destroyed without dealing damage

### Requirement: Knife is deflectable by player melee
`KnifeProjectile` SHALL check each tick whether a registered player hitbox overlaps its rect. If overlap detected and `reflected = false`, velocity is reversed and `reflected = true`. On the next overlap with the thrower's hurtbox, full `KNIFE_DAMAGE` is dealt to the thrower. References: FR-EA-04.

#### Scenario: Player punch reverses projectile
- **WHEN** a player hitbox rect overlaps the knife rect
- **THEN** knife.reflected becomes true and velocity is negated

#### Scenario: Reflected knife hits thrower
- **WHEN** reflected knife rect overlaps the thrower's hurtbox
- **THEN** KNIFE_DAMAGE HitEvent is dispatched to the thrower and knife is destroyed

#### Scenario: Reflected knife does not hit player
- **WHEN** reflected knife travels back and briefly overlaps player hurtbox
- **THEN** no HitEvent is dispatched to the player
