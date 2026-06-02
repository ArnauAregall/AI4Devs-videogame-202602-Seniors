## Context

The HUD health bar (`HealthBar.ts`) already exists and renders on the fixed HUD overlay scene. It reads threshold constants from `HudConfig.ts` and applies green/yellow/red colouring based on the health fraction. The bar updates synchronously via the `update()` method called from `HudScene` when `PLAYER_HEALTH_CHANGED` fires. The current implementation already satisfies the ticket requirements — this change validates and hardens the existing behaviour against the acceptance criteria.

## Goals / Non-Goals

**Goals:**
- Confirm the health bar renders on the fixed HUD overlay at all times during gameplay
- Confirm colour transitions use named constants from `HudConfig.ts` (green > medium threshold, yellow between low and medium, red ≤ low threshold)
- Confirm bar width updates within the same render frame on damage (no tween/animation delay)
- Ensure thresholds are designer-tunable without modifying business logic

**Non-Goals:**
- Animated health bar transitions (smooth decrease) — explicitly excluded; update must be instant
- Health bar for enemies (separate `EnemyHealthBar` component)
- Health regeneration mechanics

## Decisions

1. **Synchronous redraw on update** — `HealthBar.update()` calls `_redraw()` immediately rather than deferring to the next frame. This guarantees same-frame visual update when damage fires.
   - Alternative: deferred redraw in `update()` loop — rejected because it introduces a 1-frame lag.

2. **Named constants in `HudConfig.ts`** — Thresholds (`HUD_HEALTH_YELLOW_THRESHOLD`, `HUD_HEALTH_RED_THRESHOLD`) and colours (`HUD_HEALTH_GREEN`, `HUD_HEALTH_YELLOW`, `HUD_HEALTH_RED`) are exported constants. Designers edit only this file.
   - Alternative: JSON config file loaded at runtime — rejected as over-engineering for static values in a single-build game.

3. **Fraction-based thresholds** — Thresholds compare `current/max` as a 0–1 fraction rather than absolute HP values. This keeps the system independent of max HP changes.

## Risks / Trade-offs

- [Risk] If `PLAYER_HEALTH_CHANGED` event is not emitted synchronously from the damage handler, the bar could lag by one frame → Mitigation: the event is emitted inline in `PlayerController.takeDamage()` before returning control.
- [Risk] Designers could set thresholds to invalid values (e.g. red > yellow) → Mitigation: acceptable for now; thresholds are simple numeric constants with inline doc comments explaining valid ranges.
