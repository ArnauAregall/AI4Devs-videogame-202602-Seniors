# Role
You are a Senior Game Designer and Systems Analyst working on the Final Fight clone inside Claude Code. You produce requirements documents following the established project format.

# Objective
Produce `finalfight-AAA/requirements/health-items.md` — a requirements file covering the complete health item lifecycle: barrel destruction by player and enemies, random item drop, pickup mechanic, and immediate health restoration — ready to be passed to OpenSpec via `/opsx:propose @finalfight-AAA/requirements/health-items.md`.

# Context

**What this system covers:** Health items are sushi pickups that exist exclusively as drops from destroyed barrels. Both the player and enemy AI can destroy barrels through combat and can consume health items by walking over them. This is a closed economy — no other source of health items exists in the game.

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

Use prefix `HI` for all FR and NFR codes. Number sequentially across all areas within the single file.

**Sushi sprites are already provisioned** under `finalfight-AAA/public/assets/` and registered in `AssetKeys.ts`. The requirements file must reference them as the health item sprite but must not specify file paths.

**Cross-reference before writing (read these files, do not duplicate existing FRs):**
- `finalfight-AAA/requirements/enemy-behaviour.md`
- `finalfight-AAA/requirements/combat-system.md`
- `finalfight-AAA/requirements/player.md`
- `finalfight-AAA/requirements/go-live-qa.md`

In particular, `go-live-qa.md` contains barrel-related FRs (3-hit destruction). Do not duplicate those — reference them by ID in the Open Questions section and build on top of them.

---

**The four areas this file must cover:**

**Area 1 — Barrel destruction by player and enemy:**
Both the player and enemy AI can hit barrels using any attack action (punch or kick). A barrel is destroyed after accumulating three hits from any combination of player and enemy attacks. The barrel must visually reflect damage state transitions as hits land. Once destroyed the barrel is removed from the stage.

**Area 2 — Random health item drop on barrel destruction:**
When a barrel is destroyed it drops between one and three health items at random. The items spawn at or near the barrel's last position. Each item is represented by the sushi sprite. Items persist on the stage until collected or the scene ends — they do not expire on a timer.

**Area 3 — Health item pickup by player and enemy:**
A health item is consumed when the player or any enemy walks over it (spatial overlap, no button press required). Each entity can only consume a given item once — an item disappears immediately on first contact. Both player and enemy AI are eligible to consume items.

**Area 4 — Immediate health restoration and visual feedback:**
Each health item consumed restores exactly 25 health points to the collecting entity. The restoration is applied immediately on pickup. The entity's health bar (player HUD bar or enemy overhead bar) updates in real time to reflect the new value. Health cannot exceed the entity's maximum health points — any excess is discarded. The sushi sprite plays a brief pickup animation or disappears with a visual effect before being removed from the scene.

---

**Writing rules:**
- Plain English only — no YAML, no code blocks, no implementation detail
- Each FR must describe one observable, independently testable behaviour
- NFRs cover visual feedback timing, pickup responsiveness, and drop randomness feel
- Open Questions must flag: the exact barrel FR IDs in `go-live-qa.md` this system extends, the maximum health cap per entity (if not already defined), and whether enemy AI should prioritise picking up health items when low on health

# Steps to execute

## Step 1 — Invoke prompt-logger
Append this invocation to `.prompts-log.md` before any other action.

## Step 2 — Read cross-reference files
Read all four listed requirements files. Extract barrel-related FR IDs from `go-live-qa.md` to reference in Open Questions. Note any existing health or pickup FRs to avoid duplication.

## Step 3 — Write the requirements file
Produce `finalfight-AAA/requirements/health-items.md`. Organise with a `## Area N —` subsection header before each FR cluster. Suggested FR band allocation:
- `FR-HI-01 to FR-HI-09`: barrel destruction by player and enemy
- `FR-HI-10 to FR-HI-19`: random health item drop on destruction
- `FR-HI-20 to FR-HI-29`: pickup mechanic for player and enemy
- `FR-HI-30 to FR-HI-39`: health restoration amount, cap, and visual feedback

## Step 4 — Commit
```
feat(requirements): health-items requirements — barrel drops, pickup, and restoration
```

# Output format
Produce the full file content in one block. After the commit, print a summary table with columns: FR/NFR ID, one-line description, area. List all Open Questions explicitly so the human operator can resolve them before running OpenSpec.