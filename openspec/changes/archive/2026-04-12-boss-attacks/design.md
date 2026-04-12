## Context

`BossController` currently uses a single attack triggered whenever the player is within attack range and the attack cooldown has elapsed. The boss has four provisioned attack sprite sheets (`boss-attack-1` through `boss-attack-4`) but only `boss-attack-1` is used. Three attack animations sit idle. The requirements call for a dual-attack system with a standard attack (current behaviour, refined) and a rare critical attack with a telegraph phase, higher damage, and a 5-second per-use cooldown.

## Goals / Non-Goals

**Goals:**
- Introduce a two-path attack decision inside `BossController._selectAttack()`: standard vs. critical.
- Implement a 300-tick (5-second @ 60 fps) critical attack cooldown using an integer countdown field.
- Add a telegraph animation state (`boss-attack-3`) that precedes the critical hit frames (`boss-attack-4`), with no hitbox active during telegraph.
- Register two new animation clips: `BOSS_ANIM_CRITICAL_TELEGRAPH` and `BOSS_ANIM_CRITICAL_ATTACK`.
- Add all tunable values as named constants in `EnemyConfig.ts`.
- Keep the change entirely within `BossController.ts`, `EnemyConfig.ts`, and `EnemyAnimations.ts`.

**Non-Goals:**
- Phase transition behaviour (already covered by existing boss-controller spec).
- Visual cooldown indicator in the HUD (deferred as per OQ-BA-04).
- Changes to the player, combat system, or enemy manager.

## Decisions

**Decision 1 — Telegraph as a separate animation state, not a state machine state.**
The boss state machine uses `BossState` enum values. Adding `CriticalTelegraph` as a new enum value keeps the animation timing managed by Phaser's `animationcomplete` callback, consistent with how existing one-shot attack states work. Alternative: a boolean flag on the existing Attack state. Rejected: a flag would require additional guard logic across all state-machine transitions.

**Decision 2 — Cooldown starts on first telegraph frame, not on hit.**
FR-BA-21 explicitly requires this. The countdown is set when `_onEnterState(CriticalTelegraph)` fires, before any hitbox is active. This means even a boss interrupted during the telegraph still cannot use critical attack again for 300 ticks, preventing re-spamming.

**Decision 3 — Sprite mapping.**
`boss-attack-3` (5 frames, 160×128) → telegraph/charge. `boss-attack-4` (8 frames, 160×128) → critical active frames. `boss-attack-1` (7 frames, 160×128) → standard attack. `boss-attack-2` is reserved for phase-2 alternative standard attack (existing spec).

**Decision 4 — Probability gate uses `Math.random()` at the point of attack selection.**
`BOSS_CRITICAL_PROBABILITY` (e.g. 0.15) is compared against a fresh random value each time the boss would trigger an attack. If the value is above the threshold, or the cooldown is non-zero, the standard attack is used.

## Risks / Trade-offs

- **Risk: Telegraph frames feel too short.** `BOSS_CRITICAL_TELEGRAPH_FRAMES` defaults to 20 (333 ms) — the minimum per NFR-BA-01. Too short may frustrate players. → **Mitigation**: constant is tunable; the prompt explicitly calls for operator review.
- **Risk: `animationcomplete` not firing if scene pauses mid-animation.** Phaser's pause/resume handles this correctly because the animation timeline is tied to the scene clock. No additional guard needed.
- **Trade-off: Cooldown is tick-based not time-based.** This couples the cooldown to `TARGET_FPS`. Since `GameConfig.TARGET_FPS = 60` is a project constant, this is acceptable and keeps the countdown integer-simple (no floating-point drift).
