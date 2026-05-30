## Context

The HUD subsystem uses a fixed-camera overlay scene (`HudScene`) that runs in parallel with `GameScene` and listens to game events via `GameEvents` emitter. Colour and layout constants are centralised in `HudConfig.ts`. Existing HUD components (`TimerDisplay`, `ScoreDisplay`, `LivesDisplay`, `SpecialCooldownDisplay`, `BossHealthBar`) follow a pattern: a class that owns Phaser Graphics objects and exposes an `update()` method called from HudScene event listeners.

The player health system lives in `PlayerController` (hp, maxHp, takeDamage()) and emits `PLAYER_HEALTH_CHANGED` on damage/heal. Max HP is 100.

## Goals / Non-Goals

**Goals:**
- `HealthBar` class renders a filled rectangle bar proportional to `current / max` health
- Bar colour switches at named threshold constants: green (> 0.5), yellow (> 0.25), red (≤ 0.25)
- Bar updates within a single frame of `PLAYER_HEALTH_CHANGED`
- Constants live in `HudConfig.ts` — tunable without touching game logic
- Health bar sits on the fixed HUD overlay layer (depth above all game layers)

**Non-Goals:**
- Animated health drain or flash effects (future enhancement)
- Boss health bar (separate `BossHealthBar` component, already implemented)
- Health bar for two-player mode (out of scope per FR-HU-15)
- Smooth interpolation between old/new values — instant snap to correct fill

## Decisions

- **Phaser Graphics for bar rendering** — same approach as `BossHealthBar` and `SpecialCooldownDisplay`. Graphics are lightweight, require no asset loading, and support per-frame `.clear()`/`.fillRect()` for instant updates. No DOM or text renderer needed.
- **Late-initialise with default values (0/1)** — `HudScene` creates `HealthBar` before GameScene's player is ready. Initial values `(0, 1)` produce an empty bar at scene start; the seed-read from GameScene during `create()` pushes the real values immediately.
- **Dirty flag on `_redraw()`** — `update()` sets `_dirty = true` then calls `_redraw()`. `_redraw()` skips all draw calls when `_dirty` is false. An early return in `update()` compares current/max to skip redundant work. This avoids unnecessary Graphics clear/fill cycles.
- **`_colourFor(fraction)` as private method** — encapsulates the threshold logic separately from rendering. Exposed via `fillColour` getter for testability.

## Risks / Trade-offs

- **Risk: Health bar position hard-coded in HudConfig** → Mitigation: HudConfig is the single source of truth; repositioning requires only changing constant values. No layout system needed at this scale.
- **Risk: Graphics.clear() on every update can be wasted work** → Mitigation: early return when values are unchanged, dirty flag guards against redundant redraws. Both checks are O(1).
- **Trade-off: Instant snap vs. smooth tween** — Instant snap is chosen for zero-lag feedback (per ticket requirement). Smooth transitions can be added later via a tween wrapper without changing the core HealthBar class.
