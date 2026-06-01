## Context

The HUD health bar already exists in `finalfight-AAA/src/hud/HealthBar.ts` and renders on the fixed-camera `HudScene`. Colour thresholds are defined as named constants in `HudConfig.ts`. The `HudScene` listens for `PLAYER_HEALTH_CHANGED` events emitted by `PlayerController` and calls `HealthBar.update()` synchronously within the same event dispatch — meaning the bar redraws in the same frame damage is applied.

This change formalises the existing behaviour as acceptance criteria so it can be regression-tested and threshold values can be confidently tuned by designers.

## Goals / Non-Goals

**Goals:**
- Ensure the health bar always displays `current / max` as a proportional fill width.
- Guarantee colour transitions at named threshold boundaries (green → yellow → red).
- Ensure same-frame visual update when damage is received.
- Keep threshold constants isolated in `HudConfig.ts` so designers can tune without touching `HealthBar.ts`.

**Non-Goals:**
- Animated transitions or tweens on the health bar (out of scope).
- Damage numbers or floating text.
- Health bar for enemies (covered by separate `EnemyHealthBar` / `BossHealthBar` specs).

## Decisions

1. **Thresholds expressed as fractions (0–1) rather than absolute HP values.**
   Rationale: Fractions decouple the threshold logic from `PLAYER_MAX_HP`. If max HP changes, thresholds still work without recalculation. Alternatives considered: absolute HP values — rejected because they'd break if max HP is rebalanced.

2. **Synchronous redraw inside `update()` rather than deferred to next frame.**
   Rationale: The acceptance criteria require same-frame update. Since `HealthBar.update()` is called from the event handler (which fires during the game loop), the Graphics redraw happens before the current frame renders.

3. **Single config file (`HudConfig.ts`) for all HUD constants.**
   Rationale: Keeps a single source of truth. Designers grep one file. No runtime config loading needed for a static game.

## Risks / Trade-offs

- [Risk] Frequent redraws on rapid multi-hit combos → Mitigation: dirty-flag pattern already in place; `_redraw()` only executes when values actually change.
- [Risk] Threshold constants are compile-time only → Mitigation: Acceptable for this project; runtime hot-reload is a non-goal.
