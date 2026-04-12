# Role
You are a Senior Game Designer and Systems Analyst working on the Final Fight clone inside Claude Code. You produce requirements documents following the established project format.

# Objective
Produce a new requirements file at `finalfight-AAA/requirements/enemy-behaviour.md` that captures the three missing enemy behaviour gaps identified during playtesting, ready to be passed to OpenSpec for specification.

# Context

**What is working:** Stage progression, zone gates, player movement and attacks, enemy spawning and death.

**Three gaps identified in playtesting that this requirements file must cover:**

**Gap 1 — Enemy sprites do not reflect state:**
All enemy actions currently use the same sprite flipped horizontally. Enemies must display the correct sprite for each of their states: idle, walk, attack, hurt, and death. Each state transition must trigger the corresponding animation.

**Gap 2 — Enemies do not attack:**
Enemies currently have no attack behaviour. When an enemy detects the player within a defined proximity threshold, it must transition to an attack state, play its attack animation, and deal damage to the player on a successful hit. The damage must reduce the player's health points.

**Gap 3 — No enemy health bar:**
There is no visual indication of an enemy's remaining health. A health bar must be rendered above each enemy, showing current HP relative to maximum HP. The bar must update in real time as the enemy takes damage and must disappear when the enemy dies.

**Established requirements file format (follow exactly):**
```
# [Subsystem] — Functional Requirements

## Overview
[2–3 sentences describing what this subsystem covers and why it exists]

## Functional Requirements
FR-[PREFIX]-[NN]: [one independently testable behaviour per line]

## Non-Functional Requirements
NFR-[PREFIX]-[NN]: [performance, UX, or visual constraint]

## Open Questions
[decision points that need human input before specs can be written]
```

Use the prefix `EB` (Enemy Behaviour) for all FR and NFR codes in this file.

**Existing requirements files for cross-reference (read before writing to avoid duplication):**
- `finalfight-AAA/requirements/enemy-ai.md`
- `finalfight-AAA/requirements/combat-system.md`
- `finalfight-AAA/requirements/player.md`
- `finalfight-AAA/requirements/hud.md`

Do not duplicate any FR already covered in those files. Where this file depends on an existing FR, reference it by ID in the Open Questions section.

**Constraints on the output:**
- Plain English only — no YAML, no code blocks, no implementation detail
- Each FR must be independently testable without running the full game
- No implementation decisions — describe what the system must do, not how

# Steps to execute

## Step 1 — Invoke prompt-logger
Append this invocation to `.prompts-log.md` before any other action.

## Step 2 — Read cross-reference files
Read `enemy-ai.md`, `combat-system.md`, `player.md`, and `hud.md`. Note any existing FRs that already cover enemy state transitions, damage application, or health display so this file does not duplicate them.

## Step 3 — Write the requirements file
Produce `finalfight-AAA/requirements/enemy-behaviour.md` covering all three gaps. Each gap must produce its own cluster of FRs under the same file. Suggested FR groupings:
- `FR-EB-01` to `FR-EB-09`: enemy sprite and animation state machine
- `FR-EB-10` to `FR-EB-19`: enemy attack behaviour and damage application
- `FR-EB-20` to `FR-EB-29`: enemy health bar rendering and updates

## Step 4 — Commit
```
feat(requirements): enemy-behaviour requirements covering sprites, attack, and health bar
```

# Output format
Produce the full file content. After the commit, print the complete FR and NFR list as a summary table with columns: ID, description, gap it belongs to.