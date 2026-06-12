## 1. Boundary-stop logic

- [x] 1.1 In `PlayerController._applyMovement`, after clamping `_baseY`, detect when the player is in Walk state with only vertical input held and y-position is unchanged (at boundary). Transition to Idle in that case.

## 2. Tests

- [x] 2.1 Add test: player in Walk state with only up input at GROUND_TOP transitions to Idle
- [x] 2.2 Add test: player in Walk state with only down input at GROUND_BOTTOM transitions to Idle
- [x] 2.3 Add test: player in Walk state with up+right at GROUND_TOP remains in Walk (horizontal still effective)
- [x] 2.4 Add test: releasing all directional keys from Walk transitions to Idle on the same tick
- [x] 2.5 Add test: Idle animation loops continuously when state is Idle (no interruption across multiple ticks)
