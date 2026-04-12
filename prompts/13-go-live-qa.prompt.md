# Role
You are a Senior Game Designer and Systems Analyst working on the Final Fight clone inside Claude Code. You produce the final pre-delivery requirements document that will be passed directly to OpenSpec for specification.

# Objective
Produce `finalfight-AAA/requirements/go-live-qa.md` — the final requirements file capturing all outstanding gameplay, pacing, physics, and menu gaps identified before exercise delivery — following the established project requirements format exactly.

# Context

**Purpose of this file:** This is the last requirements iteration before the exercise is delivered. It covers five distinct gap areas identified during end-to-end playtesting. Once written, it will be passed to OpenSpec via `/opsx:propose @finalfight-AAA/requirements/go-live-qa.md` for specification and implementation.

**Established requirements format (follow exactly):**
```
# [Subsystem] — Functional Requirements

## Overview

## Functional Requirements
FR-[PREFIX]-[NN]: [one independently testable behaviour per line]

## Non-Functional Requirements
NFR-[PREFIX]-[NN]: [performance, UX, or feel constraint]

## Open Questions
```

Use prefix `GOLV` for all FR and NFR codes. Number sequentially across all five gap areas within the single file.

**Cross-reference before writing (read these files, do not duplicate existing FRs):**
- `finalfight-AAA/requirements/enemy-ai.md`
- `finalfight-AAA/requirements/combat-system.md`
- `finalfight-AAA/requirements/player.md`
- `finalfight-AAA/requirements/hud.md`
- `finalfight-AAA/requirements/enemy-behaviour.md`

---

**The five gap areas this file must cover:**

**Gap 1 — Player-enemy physics pushback (regression):**
After the enemy behaviour implementation, the player is pushed automatically — predominantly backwards — when sharing a movement lane with enemies. The effect compounds with multiple enemies and makes forward progression through enemy zones near-impossible. Player bodies and enemy bodies must coexist in the same space without automatic physics separation or velocity transfer. Combat interactions are handled exclusively through discrete hitbox/hurtbox overlap callbacks.

**Gap 2 — Stage pacing and encounter balance (player experience):**
The current stage feel is dominated by walking, with enemies appearing too infrequently and too far apart. The player should experience combat as the primary activity, not traversal. Encounter spacing, enemy spawn density, and the ratio of walking time to fighting time must be tuned so that the player engages with enemies regularly throughout each zone. The pace should feel dynamic and engaging — not like crossing an empty stage with occasional enemies at the end.

**Gap 3 — Game over menu keyboard navigation broken:**
The game over screen appears but keyboard navigation within it does not respond. The player cannot use arrow keys or Enter to select menu options (restart, main menu, high scores). All game over menu options must be navigable and selectable via keyboard.

**Gap 4 — Pause and high scores back navigation broken:**
Pressing the back action in the pause menu does not correctly resume the game or return to the expected state. Pressing back on the high scores screen does not navigate to the main menu. Both back navigation paths must resolve to their correct destination without breaking scene state.

**Gap 5 — Timer expiry has no effect:**
When the in-game countdown timer reaches zero, nothing happens. The game continues indefinitely. Timer reaching zero must trigger the game over sequence — the same flow as the player losing all health: game over screen appears, score is recorded, keyboard navigation is available.

---

**Writing rules:**
- Plain English only — no YAML, no code blocks, no implementation detail
- Each FR must describe one observable, independently testable behaviour
- NFRs cover feel, timing, and UX constraints (e.g. response latency, visual feedback timing)
- Open Questions must flag any decision that requires human input before OpenSpec can produce a spec entry

# Steps to execute

## Step 1 — Invoke prompt-logger
Append this invocation to `.prompts-log.md` before any other action.

## Step 2 — Read cross-reference files
Read all five listed requirements files. Note any FRs already covering physics separation, menu navigation, or timer behaviour to avoid duplication.

## Step 3 — Write the requirements file
Produce `finalfight-AAA/requirements/go-live-qa.md`. Organise the file with a clear `## Gap N —` subsection header before each cluster of FRs so the OpenSpec agent can process each gap independently. Suggested FR band allocation:
- `FR-GOLV-01 to FR-GOLV-09`: player-enemy physics coexistence
- `FR-GOLV-10 to FR-GOLV-19`: stage pacing and encounter balance
- `FR-GOLV-20 to FR-GOLV-29`: game over menu keyboard navigation
- `FR-GOLV-30 to FR-GOLV-39`: pause and high scores back navigation
- `FR-GOLV-40 to FR-GOLV-49`: timer expiry and game over trigger

## Step 4 — Commit
```
feat(requirements): go-live-qa requirements — final pre-delivery spec
```

# Output format
Produce the full file content in one output block. After the commit, print a summary table with columns: FR/NFR ID, one-line description, gap area. Flag any Open Questions that must be resolved before OpenSpec can produce a complete specification.
