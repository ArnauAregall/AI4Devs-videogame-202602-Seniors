## 1. Verify HUD Health Bar Constants

- [x] 1.1 Confirm `HUD_HEALTH_YELLOW_THRESHOLD` and `HUD_HEALTH_RED_THRESHOLD` are exported named constants in `HudConfig.ts` with inline documentation for designers
- [x] 1.2 Confirm `HUD_HEALTH_GREEN`, `HUD_HEALTH_YELLOW`, `HUD_HEALTH_RED` colour constants are exported from `HudConfig.ts`

## 2. Verify HealthBar Rendering Logic

- [x] 2.1 Confirm `HealthBar.update()` calls `_redraw()` synchronously (same-frame update, no deferred/tweened animation)
- [x] 2.2 Confirm `_colourFor()` returns green above yellow threshold, yellow between thresholds, red at or below red threshold
- [x] 2.3 Confirm bar fill width is computed as `Math.round(HUD_HEALTH_BAR_WIDTH * fraction)` where fraction = current/max

## 3. Verify HUD Integration

- [x] 3.1 Confirm `HudScene` listens to `PLAYER_HEALTH_CHANGED` and calls `HealthBar.update()` inline (no setTimeout or next-frame deferral)
- [x] 3.2 Confirm health bar is rendered at `HUD_DEPTH` on the fixed overlay scene

## 4. Test Coverage

- [x] 4.1 Verify existing `HealthBar.test.ts` covers full-health, zero-health, and threshold boundary scenarios
- [x] 4.2 Add or confirm test case for same-frame update assertion (update called → fraction reflects new value immediately)
