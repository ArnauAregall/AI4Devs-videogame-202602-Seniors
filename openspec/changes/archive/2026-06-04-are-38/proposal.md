## Why

The HUD countdown timer exists but its integration with game-flow states (pause, stage-clear, time-up) is not fully specified. Players need a visible, reliable countdown that pauses correctly, stops on stage clear, triggers Time Up immediately at zero, and applies a red warning colour in the final 30 seconds — all fixed to the HUD camera so it never scrolls with the stage.

## What Changes

- Ensure `StageTimer` pauses when the game is paused (does not tick during pause)
- Ensure `StageTimer.stop()` is called when stage is cleared
- Ensure `TIMER_EXPIRED` triggers the Time Up state within one fixed-timestep cycle
- Ensure `TimerDisplay` applies red warning colour at ≤30 seconds remaining
- Ensure the timer text object is fixed to the HUD camera (does not scroll)
- Format timer display as `M:SS` (e.g., `3:00`, `0:30`)

## Capabilities

### New Capabilities

_(none — all behaviour fits within the existing `hud-timer` capability)_

### Modified Capabilities

- `hud-timer`: Adding requirements for pause behaviour, stage-clear stop, Time Up trigger timing, M:SS formatting, and camera-fixed positioning

## Impact

- `finalfight-AAA/src/stage/StageTimer.ts` — verify pause integration (already uses fixed-update which pauses with scene)
- `finalfight-AAA/src/hud/TimerDisplay.ts` — update display format to M:SS
- `finalfight-AAA/src/hud/HudScene.ts` — verify timer is camera-fixed (already sets scroll to 0,0)
- `finalfight-AAA/src/game/scenes/GameScene.ts` — verify Time Up transition fires on TIMER_EXPIRED
- `finalfight-AAA/src/__tests__/TimerDisplay.test.ts` — update tests for new format and behaviours
- `finalfight-AAA/src/__tests__/StageTimer.test.ts` — add pause/stop coverage
