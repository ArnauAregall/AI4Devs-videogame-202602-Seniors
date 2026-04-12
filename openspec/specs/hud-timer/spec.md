## ADDED Requirements

### Requirement: Countdown timer starts at 180 seconds and counts down
`TimerDisplay` SHALL show remaining time in whole seconds. On `TIMER_TICK` events it SHALL update the displayed value. It starts at 180 s and displays 0 when time expires.

#### Scenario: Timer shows initial value
- **WHEN** `HudScene.create()` completes
- **THEN** the timer displays `180`

#### Scenario: Timer updates on tick
- **WHEN** `TIMER_TICK` is emitted with `{ remaining: 90 }`
- **THEN** the timer displays `90`

#### Scenario: Timer shows zero at expiry
- **WHEN** `TIMER_TICK` is emitted with `{ remaining: 0 }`
- **THEN** the timer displays `0`

### Requirement: Timer changes colour when 30 seconds or fewer remain
At or below `HUD_TIMER_WARNING_SECONDS` the timer text SHALL use `HUD_TIMER_WARNING_COLOUR`.

#### Scenario: Warning colour at threshold
- **WHEN** `TIMER_TICK` is emitted with `{ remaining: 30 }`
- **THEN** the timer text colour is `HUD_TIMER_WARNING_COLOUR`

#### Scenario: Normal colour above threshold
- **WHEN** `TIMER_TICK` is emitted with `{ remaining: 31 }`
- **THEN** the timer text colour is the default (non-warning) colour
