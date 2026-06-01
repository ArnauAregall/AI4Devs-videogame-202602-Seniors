## MODIFIED Requirements

### Requirement: Countdown timer starts at 180 seconds and counts down
`TimerDisplay` SHALL show remaining time formatted as `M:SS` (minutes colon zero-padded seconds). On `TIMER_TICK` events it SHALL update the displayed value. It starts at `3:00` and displays `0:00` when time expires.

#### Scenario: Timer shows initial value
- **WHEN** `HudScene.create()` completes
- **THEN** the timer displays `3:00`

#### Scenario: Timer updates on tick
- **WHEN** `TIMER_TICK` is emitted with `{ remaining: 90 }`
- **THEN** the timer displays `1:30`

#### Scenario: Timer shows zero at expiry
- **WHEN** `TIMER_TICK` is emitted with `{ remaining: 0 }`
- **THEN** the timer displays `0:00`

#### Scenario: Timer formats single-digit seconds with leading zero
- **WHEN** `TIMER_TICK` is emitted with `{ remaining: 65 }`
- **THEN** the timer displays `1:05`

### Requirement: Timer changes colour when 30 seconds or fewer remain
At or below `HUD_TIMER_WARNING_SECONDS` the timer text SHALL use `HUD_TIMER_WARNING_COLOUR`.

#### Scenario: Warning colour at threshold
- **WHEN** `TIMER_TICK` is emitted with `{ remaining: 30 }`
- **THEN** the timer text colour is `HUD_TIMER_WARNING_COLOUR`

#### Scenario: Normal colour above threshold
- **WHEN** `TIMER_TICK` is emitted with `{ remaining: 31 }`
- **THEN** the timer text colour is the default (non-warning) colour

## ADDED Requirements

### Requirement: Timer is fixed to HUD and does not scroll with stage camera
The timer text object SHALL be rendered in `HudScene` which uses a fixed camera (`setScroll(0, 0)`). The timer SHALL NOT move when the game camera scrolls.

#### Scenario: Timer position unchanged after camera scroll
- **WHEN** the game camera scrolls horizontally
- **THEN** the timer remains at its configured HUD position (`HUD_TIMER_X`, `HUD_TIMER_Y`)

### Requirement: Timer pauses when game is paused
When the game is paused, `StageTimer` SHALL NOT advance. Since `StageTimer` uses `registerFixedUpdate` on `GameScene`, pausing `GameScene` halts all fixed-update callbacks including the timer.

#### Scenario: Timer does not tick while paused
- **WHEN** the game is paused via `PAUSE_TOGGLED { paused: true }`
- **AND** one or more seconds of real time elapse
- **THEN** `secondsRemaining` on `StageTimer` SHALL NOT decrease

#### Scenario: Timer resumes after unpause
- **WHEN** the game is unpaused via `PAUSE_TOGGLED { paused: false }`
- **THEN** `StageTimer` resumes counting down from where it left off

### Requirement: Timer stops when stage is cleared
When `STAGE_CLEARED` is emitted, `StageTimer.stop()` SHALL be called, halting the countdown permanently for that stage.

#### Scenario: Timer stops on stage clear
- **WHEN** `STAGE_CLEARED` is emitted
- **THEN** `StageTimer.stop()` is invoked and `secondsRemaining` no longer decreases

### Requirement: Time Up state triggers immediately when timer reaches zero
When `StageTimer._ticksRemaining` reaches zero, `TIMER_EXPIRED` SHALL be emitted in the same fixed-update cycle. The game SHALL transition to the Time Up state within that single update frame.

#### Scenario: Time Up fires within one tick of reaching zero
- **WHEN** `StageTimer._ticksRemaining` decrements to zero
- **THEN** `TIMER_EXPIRED` is emitted in the same `_fixedUpdate` call
- **AND** the game transitions to the `TimeUp` scene
