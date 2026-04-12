## ADDED Requirements

### Requirement: Critical attack probability gate
`BossController` SHALL attempt a critical attack with probability `BOSS_CRITICAL_PROBABILITY` each time an attack would fire, provided `_criticalCooldownTicks` is 0.

#### Scenario: Critical fires at correct probability
- **WHEN** attack triggers AND `Math.random()` returns a value less than `BOSS_CRITICAL_PROBABILITY` AND `_criticalCooldownTicks` equals 0
- **THEN** boss transitions to CriticalTelegraph state

#### Scenario: Critical is blocked by cooldown
- **WHEN** attack triggers AND `_criticalCooldownTicks` is greater than 0
- **THEN** boss performs standard attack instead of critical attack

### Requirement: Critical telegraph animation
`BossController` SHALL play `BOSS_ANIM_CRITICAL_TELEGRAPH` (using `boss-attack-3` frames) for `BOSS_CRITICAL_TELEGRAPH_FRAMES` ticks before activating the critical hitbox. No hitbox is active during the telegraph phase.

#### Scenario: No hitbox during telegraph
- **WHEN** boss is in CriticalTelegraph state
- **THEN** no damage is applied to the player

#### Scenario: Telegraph transitions to critical hit
- **WHEN** `BOSS_ANIM_CRITICAL_TELEGRAPH` animation completes
- **THEN** boss transitions to CriticalAttack state and plays `BOSS_ANIM_CRITICAL_ATTACK`

### Requirement: Critical attack execution
`BossController` SHALL deal `BOSS_CRITICAL_DAMAGE` HP when the critical attack active frames (`boss-attack-4`) overlap the player. `BOSS_CRITICAL_DAMAGE` SHALL be strictly greater than `BOSS_STANDARD_DAMAGE`.

#### Scenario: Critical delivers higher damage
- **WHEN** critical attack active frames collide with the player
- **THEN** player receives `BOSS_CRITICAL_DAMAGE` HP and `BOSS_CRITICAL_KNOCKBACK` knockback

### Requirement: Critical attack cooldown
After entering CriticalTelegraph state, `_criticalCooldownTicks` SHALL be set to `BOSS_CRITICAL_COOLDOWN_TICKS` (300 ticks ≈ 5 s at 60 fps) and decremented every game-tick until it reaches 0.

#### Scenario: Cooldown set on telegraph entry
- **WHEN** boss enters CriticalTelegraph state
- **THEN** `_criticalCooldownTicks` equals `BOSS_CRITICAL_COOLDOWN_TICKS`

#### Scenario: Cooldown decrements each tick
- **WHEN** boss is not in CriticalTelegraph or CriticalAttack state and `_criticalCooldownTicks` is greater than 0
- **THEN** `_criticalCooldownTicks` decreases by 1 per `fixedUpdate` call
