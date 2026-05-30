## 1. Boundary-aware Walk → Idle transition

- [ ] 1.1 In `PlayerController._applyMovement()`, after clamping `_baseY`, check if the current position is at `GROUND_TOP` or `GROUND_BOTTOM` and the held directional input would push against the boundary — if so, force transition to Idle
- [ ] 1.2 Verify that releasing all directional inputs at any position correctly transitions from Walk to Idle (existing code handles this — confirm with test)

## 2. Verify and test

- [ ] 2.1 Run existing test suite to confirm no regressions
- [ ] 2.2 Run the game build (`vite build`) to confirm TypeScript strict compliance
