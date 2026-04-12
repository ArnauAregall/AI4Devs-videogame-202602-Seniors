## Context

The game has a fully implemented GameScene (physics, player, enemies, combat, stage) but no visual feedback. Players currently have no way to see health, score, lives, boss status, combo count, cooldown, or timer. The HUD must be added as a Phaser overlay scene that runs in parallel with GameScene and reacts to events without coupling to internals.

Key constraints:
- No dedicated HUD sprite assets — all visuals are Phaser Graphics primitives + bitmap/bitmap-style text.
- Must not scroll with the stage camera.
- Rendering budget: ≤ 1 ms/frame.
- Canvas resolution target: 960 × 540 (16:9).

## Goals / Non-Goals

**Goals:**
- Real-time player health bar with colour thresholds.
- Lives counter, score display, combo counter, countdown timer, special cooldown indicator.
- Boss health bar shown/hidden on boss events.
- Game Over, Stage Clear, and Pause overlays completing the gameplay loop.
- Top-10 leaderboard persisted in `localStorage`.
- All colour values, sizes, and positions in a single `HudConfig` constants file.

**Non-Goals:**
- Two-player (split-screen) HUD layout.
- Animated sprite icons for lives (numeric text only for MVP).
- Server-side score persistence.
- Controller vibration feedback.

## Decisions

### D-01: HUD as a separate Phaser Scene (not a Camera or Container)

**Decision:** Run `HudScene` as a parallel overlay scene launched by `GameScene.create()` via `this.scene.launch('HudScene')`.

**Rationale:** A separate scene has its own camera fixed at `(0,0)` — it never scrolls. It gets its own `update()` call and can be paused/resumed independently. Alternatives:
- *Fixed camera on GameScene*: feasible but adds complexity to the main scene and pollutes its update loop.
- *DOM overlay*: zero Phaser API overhead but breaks the single-canvas rendering contract and makes Phaser tween/animation unavailable for HUD effects.

### D-02: Event-based decoupling via `GameEvents` enum

**Decision:** `GameScene` emits named events on `this.events` that `HudScene` listens to on the shared `EventEmitter` obtained via `this.scene.get('GameScene').events`.

**Rationale:** Avoids direct reference chains (`hudScene.setHealth(x)` from GameScene). `HudScene` is purely reactive — it never calls into `GameScene`. This satisfies the read-only tap requirement and simplifies testing (mock the emitter).

Events emitted by `GameScene` (added to existing `GameEvents` enum):
```
PLAYER_HEALTH_CHANGED  { current, max }
PLAYER_LIVES_CHANGED   { lives }
SCORE_CHANGED          { score, delta }
BOSS_ARRIVED           { maxHealth }
BOSS_HEALTH_CHANGED    { current, max }
COMBO_UPDATED          { count, windowActive }
SPECIAL_COOLDOWN_CHANGED { fraction }   // 0.0 = ready, 1.0 = just used
TIMER_TICK             { remaining }    // integer seconds
STAGE_CLEARED          { score, timeBonus }
GAME_OVER              { score }
PAUSE_TOGGLED          { paused }
```

### D-03: HUD components as plain TypeScript classes (not Phaser GameObjects)

**Decision:** Each HUD component (`HealthBar`, `ScoreDisplay`, `BossHealthBar`, etc.) is a plain class that receives a `Phaser.Scene` reference and creates/manages its own Graphics/Text children in that scene.

**Rationale:** Keeps components testable without a running Phaser scene (mock the Graphics/Text factories). Avoids deep Phaser GameObject inheritance for simple UI pieces.

### D-04: Overlays (Game Over, Stage Clear, Pause) as sub-states within HudScene

**Decision:** Overlay panels are Groups created inside `HudScene` and shown/hidden with `setVisible()`. They are not separate Phaser Scenes.

**Rationale:** Launching/stopping scenes adds latency and complicates the back-stack. Since overlays share the same fixed camera as the HUD, keeping them in `HudScene` is simpler. The overlay can be rendered by pausing `GameScene` (`this.scene.pause('GameScene')`) from within `HudScene`.

### D-05: Leaderboard stored in localStorage as a JSON array

**Decision:** `LeaderboardStore` wraps `localStorage.getItem/setItem` with key `finalfight_leaderboard`. Data shape: `Array<{ name: string; score: number }>`, max 10 entries, sorted descending.

**Rationale:** No server dependency, survives page reload per FR-HU-25, simple serialisation.

### D-06: Pause menu navigation via a cursor index

**Decision:** Pause, Game Over, and Stage Clear menus track an `_cursorIndex` integer and apply highlight styling on selection change. Keyboard (↑↓/Enter) and gamepad (dpad/A) both mutate `_cursorIndex`.

**Rationale:** Consistent with the existing `InputManager` pattern already used by the player.

## Risks / Trade-offs

- **Event ordering** — if `GameScene` emits before `HudScene` listener is registered, first frame values could be missed. Mitigation: `HudScene.create()` reads initial state snapshot from `GameScene` after registering listeners.
- **Font legibility** — bitmap fonts are not bundled. Mitigation: Use Phaser's built-in `BitmapText` with the default font, or Phaser `Text` with a system monospace font and `pixelArt: true` render config.
- **1 ms budget** — Graphics `clear()` + `fillRect()` for many bars each frame is cheap but must be measured. Mitigation: Only redraw components that received an event that frame using a dirty flag.
- **localStorage availability** — `localStorage` may be blocked in private-browsing or sandboxed iframes. Mitigation: Wrap all access in try/catch; fall back to an in-memory array silently.

## Open Questions

- None blocking implementation. Font choice (system monospace vs. embedded bitmap) is deferred to implementer judgment — both approaches satisfy NFR-HU-01 and NFR-HU-04.
