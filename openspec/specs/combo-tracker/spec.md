# combo-tracker Specification

## Purpose
TBD - created by archiving change combat-system. Update Purpose after archive.
## Requirements
### Requirement: Per-target combo window tracking
The ComboTracker SHALL maintain a combo counter and window timer per target id. The window lasts `COMBO_WINDOW_FRAMES` ticks. After each hit within the window, the timer resets to the full duration. When the timer reaches zero, the counter resets to zero. References: FR-CS-08, FR-CS-09, FR-CS-10, FR-CS-11, NFR-CS-03.

#### Scenario: First hit starts combo counter at 1
- **WHEN** the first hit on a target is recorded
- **THEN** the combo counter for that target is 1 and the window timer starts

#### Scenario: Second hit within window increments counter
- **WHEN** a second hit on the same target is recorded before COMBO_WINDOW_FRAMES ticks have elapsed
- **THEN** the combo counter increments to 2 and the window timer resets

#### Scenario: Hit after window expires resets counter to 1
- **WHEN** a hit on a target is recorded after COMBO_WINDOW_FRAMES ticks have elapsed since the last hit
- **THEN** the combo counter resets to 1

### Requirement: Diminishing damage returns
The ComboTracker SHALL apply a damage multiplier of `max(DIMINISHING_MIN_FACTOR, 1.0 - DIMINISHING_STEP * (comboCount - 1))` to each hit's base damage. The final damage is floored to `DAMAGE_FLOOR` (minimum 1). References: FR-CS-18.

#### Scenario: First hit deals full damage
- **WHEN** combo counter is 1 and base damage is 20
- **THEN** effective damage is 20

#### Scenario: Second hit deals 90% damage
- **WHEN** combo counter is 2 and base damage is 20
- **THEN** effective damage is 18

#### Scenario: Eleventh hit is capped at minimum factor
- **WHEN** combo counter is 11 and base damage is 20
- **THEN** effective damage is max(DAMAGE_FLOOR, 20 * DIMINISHING_MIN_FACTOR)

### Requirement: Hit-stun scaling with combo depth
The ComboTracker SHALL compute effective hit stun as `min(HIT_STUN_MAX_FRAMES, baseHitStun + comboCount * HIT_STUN_COMBO_INCREMENT)`. References: FR-CS-19.

#### Scenario: Base hit stun at combo 1
- **WHEN** combo counter is 1 and base hit stun is 10
- **THEN** effective hit stun equals 10 + 1 * HIT_STUN_COMBO_INCREMENT

#### Scenario: Hit stun is capped at maximum
- **WHEN** computed hit stun exceeds HIT_STUN_MAX_FRAMES
- **THEN** effective hit stun is HIT_STUN_MAX_FRAMES

