# player-special-attack Specification

## Purpose
TBD - created by archiving change player. Update Purpose after archive.
## Requirements
### Requirement: Special attack requires minimum health to trigger
The system SHALL only enter `SpecialAttack` state if `player.hp >= GameConfig.SPECIAL_ATTACK_HP_COST`. If `hp < SPECIAL_ATTACK_HP_COST`, the input SHALL be ignored.

#### Scenario: Special attack triggers when health is sufficient
- **WHEN** the special attack input is received and `hp >= GameConfig.SPECIAL_ATTACK_HP_COST`
- **THEN** the state transitions to `SpecialAttack` and `hp` is reduced by `SPECIAL_ATTACK_HP_COST`

#### Scenario: Special attack is blocked when health is too low
- **WHEN** the special attack input is received and `hp < GameConfig.SPECIAL_ATTACK_HP_COST`
- **THEN** the state does NOT transition to `SpecialAttack`

### Requirement: Special attack is subject to a 10-second cooldown
The system SHALL set `specialCooldownTicks = GameConfig.SPECIAL_COOLDOWN_TICKS` (600 at 60fps) after a successful special attack. The input SHALL be ignored while `specialCooldownTicks > 0`. The counter decrements by 1 each fixed tick.

#### Scenario: Cooldown blocks repeated use
- **WHEN** a special attack completes and `specialCooldownTicks > 0`
- **THEN** the special attack input is ignored

#### Scenario: Cooldown expires after 600 ticks
- **WHEN** 600 fixed ticks pass after a special attack
- **THEN** `specialCooldownTicks === 0` and the special attack input is accepted again

### Requirement: Special attack dispatches area damage
The system SHALL call `combatBus.dispatchAreaDamage(sourcePlayer, GameConfig.SPECIAL_ATTACK_RADIUS)` during the `SpecialAttack` state at the active-frames moment. The `combatBus` is injected at construction time and may be `null` (no-op) during unit tests.

#### Scenario: Area damage is dispatched
- **WHEN** the special attack reaches its active frames
- **THEN** `combatBus.dispatchAreaDamage` is called with the player as source

