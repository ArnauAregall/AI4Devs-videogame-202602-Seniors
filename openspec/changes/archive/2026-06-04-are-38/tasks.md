## 1. Update TimerDisplay to M:SS format

- [x] 1.1 Modify `TimerDisplay` constructor to display initial value as `3:00` instead of `180`
- [x] 1.2 Update `TimerDisplay.update()` to format remaining seconds as `M:SS` (zero-padded seconds)

## 2. Verify game-flow integration

- [x] 2.1 Verify `StageTimer` does not tick while `GameScene` is paused (implicit via scene pause halting fixed-update)
- [x] 2.2 Verify `StageTimer.stop()` is called on `STAGE_CLEARED` in `GameScene`
- [x] 2.3 Verify `TIMER_EXPIRED` triggers `TimeUp` scene transition within the same fixed-update cycle

## 3. Update tests

- [x] 3.1 Update `TimerDisplay.test.ts` to assert `M:SS` formatted strings instead of raw numbers
- [x] 3.2 Add test verifying warning colour applies at ≤30 seconds with `M:SS` format
- [x] 3.3 Add test for `StageTimer` stop on stage clear
