## ADDED Requirements

### Requirement: FR-TIM-01 Countdown from 180 seconds
The StageTimer SHALL start at `180 × TARGET_FPS` fixed ticks and decrement by 1 each fixed tick. The remaining time in whole seconds SHALL be readable via `secondsRemaining`.

#### Scenario: Timer decrements each fixed tick
- **WHEN** `fixedUpdate()` is called N times
- **THEN** `ticksRemaining` equals `180 × TARGET_FPS - N`

#### Scenario: secondsRemaining is floor of ticks / TARGET_FPS
- **WHEN** `ticksRemaining = 3601` and `TARGET_FPS = 60`
- **THEN** `secondsRemaining === 60`

### Requirement: FR-TIM-02 Time Up event at zero
When `ticksRemaining` reaches 0 the StageTimer SHALL emit `'timeUp'` on the scene event bus exactly once.

#### Scenario: timeUp emitted at zero
- **WHEN** `ticksRemaining` decrements to 0
- **THEN** `scene.events.emit('timeUp')` is called exactly once

#### Scenario: timeUp not emitted before zero
- **WHEN** `ticksRemaining` is 1
- **THEN** no event is emitted on that tick

### Requirement: FR-TIM-03 Timer runs in fixed-timestep update
The StageTimer SHALL register itself via `scene.registerFixedUpdate` in its constructor and unregister via `scene.unregisterFixedUpdate` in its `destroy()` method.

#### Scenario: Timer registers with fixed-step system
- **WHEN** a StageTimer is constructed
- **THEN** `scene.registerFixedUpdate` has been called with the timer's tick function

#### Scenario: Timer unregisters on destroy
- **WHEN** `timer.destroy()` is called
- **THEN** `scene.unregisterFixedUpdate` has been called
