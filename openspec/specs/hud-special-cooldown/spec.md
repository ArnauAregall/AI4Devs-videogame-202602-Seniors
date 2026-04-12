## ADDED Requirements

### Requirement: Special cooldown indicator shows remaining cooldown as a draining pip bar
`SpecialCooldownDisplay` SHALL render a bar or series of pips. When `SPECIAL_COOLDOWN_CHANGED` is received with `fraction === 0`, the bar SHALL appear full (ready). When `fraction === 1`, the bar SHALL appear empty (just used). Intermediate fractions display proportionally.

#### Scenario: Ready state shows full bar
- **WHEN** `SPECIAL_COOLDOWN_CHANGED` is emitted with `{ fraction: 0 }`
- **THEN** the cooldown indicator is fully filled

#### Scenario: Just-used state shows empty bar
- **WHEN** `SPECIAL_COOLDOWN_CHANGED` is emitted with `{ fraction: 1 }`
- **THEN** the cooldown indicator is fully empty

#### Scenario: Mid-cooldown shows partial fill
- **WHEN** `SPECIAL_COOLDOWN_CHANGED` is emitted with `{ fraction: 0.5 }`
- **THEN** the cooldown indicator is 50% filled

### Requirement: Special cooldown indicator is always visible during gameplay
The cooldown indicator SHALL remain visible at all times during active gameplay (not only when cooldown is active).

#### Scenario: Indicator visible when ready
- **WHEN** the player has no active cooldown
- **THEN** the cooldown indicator is visible (at full state)
