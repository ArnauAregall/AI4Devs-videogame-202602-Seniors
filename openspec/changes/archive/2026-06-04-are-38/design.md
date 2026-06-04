## Context

The game already has a working `StageTimer` (fixed-timestep countdown) and `TimerDisplay` (HUD text). The timer infrastructure is in place:
- `StageTimer` registers a fixed-update callback and emits `TIMER_TICK` each second and `TIMER_EXPIRED` at zero.
- `TimerDisplay` listens for `TIMER_TICK` and updates text + colour.
- `HudScene` runs on a separate scene with `cameras.main.setScroll(0, 0)` — already camera-fixed.
- Pausing calls `scene.pause('GameScene')` which stops fixed-update callbacks, so `StageTimer` already pauses implicitly.

The gaps are: (1) display format is raw seconds instead of `M:SS`, (2) no explicit verification that stage-clear stops the timer, (3) no explicit verification that Time Up fires within one tick.

## Goals / Non-Goals

**Goals:**
- Timer displays in `M:SS` format (e.g., `3:00`, `0:30`, `0:00`)
- Warning colour (red) applies at ≤30 seconds
- Timer pauses when game is paused
- Timer stops on stage clear
- Time Up state triggers within one fixed-timestep update of reaching zero

**Non-Goals:**
- Changing the timer duration (remains 180s from `HUD_TIMER_START_SECONDS`)
- Adding audio warnings for low time
- Bonus time mechanics

## Decisions

1. **M:SS format in TimerDisplay** — `TimerDisplay.update()` will format the remaining seconds as `M:SS` using `Math.floor(remaining / 60)` and zero-padded seconds. This is a display-only change; the `StageTimer` still emits raw seconds.

2. **Pause handled by scene pause** — Since `StageTimer` uses `registerFixedUpdate` on `GameScene`, pausing `GameScene` already halts the timer. No additional pause logic needed in `StageTimer`.

3. **Stage-clear stops timer via existing `StageTimer.stop()`** — `GameScene` already calls `StageTimer.stop()` on `STAGE_CLEARED`. This is a verification task, not new code.

4. **Time Up triggered by TIMER_EXPIRED listener** — `GameScene` listens for `TIMER_EXPIRED` and transitions to the `TimeUp` scene. This fires in the same tick that `_ticksRemaining` hits zero.

## Risks / Trade-offs

- [Display format change] → Existing tests assert raw numeric strings; they must be updated to expect `M:SS` format.
- [Implicit pause reliance] → If scene pause mechanism changes, timer would continue. Mitigation: test coverage verifies timer does not tick while paused.
