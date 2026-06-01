## 1. Threshold Constants

- [x] 1.1 Verify `HUD_HEALTH_YELLOW_THRESHOLD` and `HUD_HEALTH_RED_THRESHOLD` are exported named constants in `HudConfig.ts` (already present — confirm values match acceptance criteria)
- [x] 1.2 Verify `HUD_HEALTH_GREEN`, `HUD_HEALTH_YELLOW`, `HUD_HEALTH_RED` colour constants are exported from `HudConfig.ts`

## 2. HealthBar Rendering

- [x] 2.1 Confirm `HealthBar._colourFor()` uses the threshold constants from `HudConfig.ts` and returns the correct colour for each band
- [x] 2.2 Confirm `HealthBar.update()` redraws synchronously (same frame) when current/max values change
- [x] 2.3 Confirm bar fill width is computed as `Math.round(HUD_HEALTH_BAR_WIDTH * (current / max))`

## 3. HUD Integration

- [x] 3.1 Confirm `HudScene` listens for `PLAYER_HEALTH_CHANGED` and calls `HealthBar.update(current, max)` synchronously
- [x] 3.2 Confirm `HudScene` camera is fixed (no scroll) so health bar is always visible on the overlay layer

## 4. Tests

- [x] 4.1 Add or verify unit test: bar colour is green when fraction > `HUD_HEALTH_YELLOW_THRESHOLD`
- [x] 4.2 Add or verify unit test: bar colour is yellow when fraction is between red and yellow thresholds
- [x] 4.3 Add or verify unit test: bar colour is red when fraction <= `HUD_HEALTH_RED_THRESHOLD`
- [x] 4.4 Add or verify unit test: bar width updates immediately on `update()` call (no deferred frame)
