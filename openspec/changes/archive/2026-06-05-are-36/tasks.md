## 1. Gamepad navigation in MainMenu

- [x] 1.1 Add `update()` method to `MainMenu` that polls `scene.input.gamepad.pad1` for d-pad/stick up/down and A button, with dead zone (0.5) and debounce cooldown (200ms).
- [x] 1.2 On d-pad/stick up or down past debounce, call `_move(-1)` or `_move(1)` respectively.
- [x] 1.3 On A button press past debounce, call `_activate()`.

## 2. Tests

- [x] 2.1 Add test: gamepad d-pad down moves cursor to next option.
- [x] 2.2 Add test: gamepad left stick up moves cursor to previous option.
- [x] 2.3 Add test: held d-pad does not move cursor faster than debounce interval.
- [x] 2.4 Add test: gamepad A button activates the focused option.
- [x] 2.5 Add test: no errors when gamepad is not connected.
