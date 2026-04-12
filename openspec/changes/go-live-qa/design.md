## Context

The project is a Phaser 3 + TypeScript beat-em-up (Final Fight clone). All six
original subsystems have been implemented and archived. Five gaps were identified
in final end-to-end playtesting.

Current state:
- `StageTimer` emits `'timeUp'` but no scene listener handles it — game over
  never fires on timer expiry.
- `GameOver.ts` has only pointer (mouse) events for menu options; ENTER
  unconditionally calls `handleContinue()` regardless of which option has focus.
  No arrow-key cursor navigation exists.
- `stage1Data.ts` has its first scroll trigger at worldX=1500. With
  canvas=384 px, this fires at ~3.4 screen widths from start
  (FR-GOLV-11 requires ≤2). All three zones contain only 'brawler'
  archetype — FR-GOLV-15 requires ≥2 archetypes by zone 3.
- `PauseOverlay.ts` already handles Escape (`_resumeGame()`). Covered.
- `LeaderboardScene.ts` already handles Escape (→ `_returnScene`). Covered.
- No explicit `physics.add.collider()` call is registered between player and
  enemy sprites anywhere in the codebase — Phaser Arcade physics does not
  separate bodies without explicit colliders. Gap 1 is behaviorally satisfied;
  only a guard comment and a safety assertion in `GameScene.create()` are needed.

## Goals / Non-Goals

**Goals:**
- `StageTimer` / `StageManager` / `GameScene`: wire `'timeUp'` → `triggerGameOver()`
  with stage-clear priority guard.
- `GameOver.ts`: add Up/Down cursor navigation and Enter activation; default
  highlight on first visible option; register keyboard listeners immediately on
  `create()`; tear down on scene shutdown.
- `stage1Data.ts`: move first trigger to worldX≈700; reduce inter-trigger spacing
  to ≤1 screen width apart where possible; add rusher archetype to zone-2 and
  knife-thrower to zone-3 so ≥2 archetypes appear by zone-3.
- `GameScene.create()`: add an explicit assertion comment confirming no
  player-enemy body collider is registered (Gap 1 documentation + safety).
- `GameEvents.ts`: add `TIMER_EXPIRED` constant so `'timeUp'` is no longer a
  magic string.

**Non-Goals:**
- Rewriting the physics engine or switching from Arcade to Matter.
- Adding gamepad navigation to GameOver (pointer + keyboard only for this change).
- Changing stage 2 or stage 3 data.
- Adding a continue lives count constant (will reuse `HUD_MAX_LIVES` = 1 per
  continue, standard arcade convention).
- Two-player mode.

## Decisions

**D-01 — Timer expiry listener lives in GameScene (not StageManager)**

Options considered:
- A) `StageManager` listens to `'timeUp'` and calls an interface method on the
  scene (requires extending `StageScene` interface to add `triggerGameOver()`).
- B) `GameScene` registers a listener for `'timeUp'` directly in `create()`,
  using the same `triggerGameOver()` path already used for lives-lost.

Chose B: `GameScene` already owns `triggerGameOver()` and all game-flow
transitions. Adding the listener there keeps `StageManager` purely a stage
sub-system with no game-over awareness. The stage-clear priority guard is
trivially available via `this._stageManager?.isCleared`.

**D-02 — GameOver keyboard navigation uses a `_cursor` index + array of option refs**

The current `GameOver.ts` constructs options conditionally (Continue only when
continues remain). The cursor must reference only visible options. The refactor:
- Collect all constructed option `Text` objects into `_options: Text[]`.
- `_cursor` index into `_options`.
- `_refresh()` sets colour of each option; selected = `#ffcc00`, rest = `#ffffff`.
- Up/Down clamp-wrap `_cursor`.
- Enter delegates to a `_activate()` switch/array dispatch.

This mirrors PauseOverlay's proven pattern; no new abstractions needed.

**D-03 — stage1Data trigger positions moved to 700 / 2000 / 3500**

With canvas=384 px:
- Trigger at 700: camera right-edge=700 → camera scrollX=316 → player≈500 px
  from start = 1.3 screen widths (satisfies FR-GOLV-11 ≤2).
- Trigger spacing: 700→2000=1300 px (3.4sw), 2000→3500=1500 px (3.9sw).
  These inter-zone spacings are longer than 1 screen width but are acceptable
  because FR-GOLV-13 refers to spawn positions *within* a zone (individual enemy
  X coordinates), not the distance between zone trigger lines. Each zone's enemies
  all spawn at the same X (off-screen right) when the trigger fires.
- Zones updated: zone-1a (2 brawlers), zone-1b (2 brawlers + 1 rusher), zone-1c
  (2 brawlers + 1 rusher + 1 knife-thrower). Total = 9 enemies, 3 archetypes by
  zone-3 (satisfies FR-GOLV-14 ≥8, FR-GOLV-15 ≥2 archetypes by zone-3).

**D-04 — Physics coexistence is documented rather than re-implemented**

No `physics.add.collider()` call exists between player and enemy sprites.
Phaser 3 Arcade physics never separates two dynamic bodies without an explicit
collider registration. The requirement is already satisfied by omission. A
`/* no player-enemy collider — intentional: FR-GOLV-01 */` comment in
`GameScene.create()` makes the invariant explicit so future engineers do not
accidentally add one.

**D-05 — `'timeUp'` string replaced with `GameEvents.TIMER_EXPIRED`**

`StageTimer` currently emits the literal string `'timeUp'`. To keep all event
names in `GameEvents`, a new constant `TIMER_EXPIRED: 'timerExpired'` is added
and used in both `StageTimer` and the new listener in `GameScene`. The
`StageTimer.test.ts` mock expectation for `'timeUp'` must be updated.

## Risks / Trade-offs

- **GameOver cursor navigation with conditional options**: If `continuesLeft > 0`
  changes the option count mid-scene (not currently possible but theoretically
  possible if the scene were relaunched with different data), the cursor index
  could go out of bounds. Mitigation: clamp `_cursor` to `_options.length - 1`
  in `_activate()`.
- **Stage pacing triggers changed**: Moving the first trigger to worldX=700 means
  zone-1a enemies spawn very early (player barely walked a screen). The zone
  camera lock may feel abrupt. Mitigation: accepted per FR-GOLV-11; can be tuned
  in stage data without code changes.
- **`StageManager.isCleared` race condition**: If `_startStageClear()` runs on
  the same tick as the `'timeUp'` listener, both checks run synchronously.
  `_startStageClear` sets `this._cleared = true` before emitting `STAGE_CLEARED`,
  so the `GameScene` listener guarding `!this._stageManager?.isCleared` will
  correctly skip `triggerGameOver()`. Order-of-operations is safe.
