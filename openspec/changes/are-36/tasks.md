## 1. Gamepad Navigation in MainMenuScene

- [x] 1.1 Add `_padCooldown` property and `PAD_COOLDOWN_FRAMES` constant (12 frames ≈ 200ms) to `MainMenu`
- [x] 1.2 Implement `update()` method that polls `this.input.gamepad?.getPad(0)` for D-pad up/down and button 0, applying debounce via `_padCooldown`
- [x] 1.3 Verify existing `_move()` and `_activate()` methods are reused for gamepad input (no duplication)

## 2. Testing

- [x] 2.1 Add unit test verifying gamepad D-pad down calls `_move(1)` after cooldown expires
- [x] 2.2 Add unit test verifying gamepad button 0 calls `_activate()`
- [x] 2.3 Add unit test verifying debounce prevents input within cooldown window
