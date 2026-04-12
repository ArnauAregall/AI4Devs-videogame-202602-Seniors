## ADDED Requirements

### Requirement: Standard attack execution
`BossController` SHALL execute a standard attack using `BOSS_ANIM_ATTACK_1` animation when the player is within `BOSS_ATTACK_RANGE` and the attack cooldown is zero. The standard attack delivers `BOSS_STANDARD_DAMAGE` HP to the player.

#### Scenario: Standard attack triggers in range with zero cooldown
- **WHEN** player is within `BOSS_ATTACK_RANGE` AND `_attackCooldownFrames` equals 0 AND critical probability check returns false
- **THEN** boss transitions to StandardAttack state and plays `BOSS_ANIM_ATTACK_1`

#### Scenario: Standard attack deals correct damage
- **WHEN** standard attack active frames collide with the player
- **THEN** player receives `BOSS_STANDARD_DAMAGE` HP and `BOSS_STANDARD_KNOCKBACK` knockback

#### Scenario: Standard attack does not fire outside range
- **WHEN** player is farther than `BOSS_ATTACK_RANGE`
- **THEN** boss does not transition to StandardAttack state
