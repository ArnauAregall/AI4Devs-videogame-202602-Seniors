## 1. HudConfig — Add health bar constants

- [x] 1.1 Add `HUD_HEALTH_BAR_X`, `HUD_HEALTH_BAR_Y`, `HUD_HEALTH_BAR_WIDTH`, `HUD_HEALTH_BAR_HEIGHT` layout constants
- [x] 1.2 Add `HUD_DEPTH` constant for render ordering above game layers
- [x] 1.3 Verify no magic numbers leak into HealthBar.ts — all sourced from named exports

## 2. HealthBar — Core component

- [x] 2.1 Create `HealthBar` class with constructor accepting `(scene, current, max)`
- [x] 2.2 Implement `_redraw()` using Phaser Graphics — clear/fillStyle/fillRect for bg and fill
- [x] 2.3 Implement `_colourFor(fraction)` with three-tier threshold logic (green/yellow/red)
- [x] 2.4 Implement `update(current, max)` with early-return when values unchanged and dirty-flag guard
- [x] 2.5 Expose `fraction` and `fillColour` getters for testability

## 3. HudScene — Wiring

- [x] 3.1 Instantiate `HealthBar` in `HudScene.create()` with `(this, 0, 1)` default
- [x] 3.2 Seed initial health state from GameScene player after creation
- [x] 3.3 Register `PLAYER_HEALTH_CHANGED` listener that calls `healthBar.update(current, max)`

## 4. Tests

- [x] 4.1 Write test: initial fraction matches constructor values
- [x] 4.2 Write test: green colour above yellow threshold
- [x] 4.3 Write test: yellow colour between red and yellow thresholds
- [x] 4.4 Write test: red colour at or below red threshold
- [x] 4.5 Write test: fraction clamped to 0 for negative current values
- [x] 4.6 Write test: update changes fraction and colour
- [x] 4.7 Write test: no redraw when values are unchanged (dirty-flag / early-return)
- [x] 4.8 Write boundary tests: fraction exactly at each threshold boundary
