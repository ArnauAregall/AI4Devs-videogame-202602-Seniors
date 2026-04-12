## MODIFIED Requirements

### Requirement: FR-TIM-02 Time Up event at zero
When `ticksRemaining` reaches 0 the StageTimer SHALL emit
`GameEvents.TIMER_EXPIRED` (`'timerExpired'`) on the scene event bus exactly
once. The literal string `'timeUp'` SHALL no longer be used; all callsites
(StageTimer and any listeners) SHALL reference `GameEvents.TIMER_EXPIRED`.

#### Scenario: TIMER_EXPIRED emitted at zero
- **WHEN** `ticksRemaining` decrements to 0
- **THEN** `scene.events.emit(GameEvents.TIMER_EXPIRED)` is called exactly once

#### Scenario: TIMER_EXPIRED not emitted before zero
- **WHEN** `ticksRemaining` is 1
- **THEN** no `TIMER_EXPIRED` event is emitted on that tick

#### Scenario: No second emission after stop()
- **WHEN** `timer.stop()` is called before ticks reach zero
- **THEN** `TIMER_EXPIRED` is never emitted

## ADDED Requirements

### Requirement: StageTimer does not decrement while the scene is paused
The StageTimer's fixed-update callback SHALL only decrement `_ticksRemaining`
when the hosting `GameScene` is not in a paused state. Since Phaser pauses all
`registerFixedUpdate` callbacks when the scene is paused, no additional guard is
needed inside `StageTimer` itself — this requirement documents the invariant.

#### Scenario: Timer does not run while GameScene is paused
- **WHEN** the GameScene is paused (e.g. via PauseOverlay)
- **THEN** `StageTimer.ticksRemaining` does not change between pause and resume
