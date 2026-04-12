## ADDED Requirements

### Requirement: Knife Thrower maintains preferred distance
`KnifeThrowerController` SHALL evaluate distance to player each fixed tick in Aggro state. If distance < `KNIFE_THROWER_MIN_DISTANCE`, it retreats (moves away from player). If distance > `KNIFE_THROWER_MAX_DISTANCE`, it advances. Within the preferred band, it stays stationary. References: FR-EA-04.

#### Scenario: Thrower retreats when player is too close
- **WHEN** distance(thrower, player) < KNIFE_THROWER_MIN_DISTANCE
- **THEN** thrower moves away from player at KNIFE_THROWER_RETREAT_SPEED

#### Scenario: Thrower advances when player is too far
- **WHEN** distance(thrower, player) > KNIFE_THROWER_MAX_DISTANCE
- **THEN** thrower moves toward player at KNIFE_THROWER_WALK_SPEED

### Requirement: Knife Thrower fires projectile
`KnifeThrowerController` SHALL fire a `KnifeProjectile` when player is within `KNIFE_THROWER_LOS_RANGE` and outside `KNIFE_THROWER_MIN_DISTANCE`. Cooldown between throws is `KNIFE_THROW_COOLDOWN_FRAMES`. References: FR-EA-04.

#### Scenario: Projectile is created when conditions are met
- **WHEN** player is within LOS range, outside min distance, and cooldown = 0
- **THEN** a KnifeProjectile is created traveling toward the player

#### Scenario: Cooldown prevents immediate re-throw
- **WHEN** a knife is thrown
- **THEN** no new knife is created until KNIFE_THROW_COOLDOWN_FRAMES elapse
