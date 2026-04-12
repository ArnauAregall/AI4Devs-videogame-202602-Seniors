# Role
You are a Senior Game Designer and Systems Analyst working on the Final Fight clone inside Claude Code. You produce requirements documents following the established project format, with particular attention to player experience and game feel.

# Objective
Produce `finalfight-AAA/requirements/boss-attacks.md` — a requirements file covering the boss dual-attack system, including a rare critical attack with a 5-second cooldown, a dedicated sprite, and the game-feel considerations that make the encounter memorable — ready to be passed to OpenSpec via `/opsx:propose @finalfight-AAA/requirements/boss-attacks.md`.

# Context

**What this system covers:** The boss currently uses a single attack. This requirement introduces a two-attack repertoire: a standard attack used in regular combat exchanges, and a critical attack that is rare, visually distinct, telegraphed to the player, and gated behind a 5-second cooldown. The design goal is a boss encounter that feels threatening and rhythmic — the player learns to read the critical attack tell and either dodge or absorb the consequence.

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

Use prefix `BA` (Boss Attacks) for all FR and NFR codes. Number sequentially across all areas within the single file.

**Sprite context:** The boss already has sprites provisioned under `finalfight-AAA/public/assets/boss/` and registered in `AssetKeys.ts`. The critical attack requires a distinct sprite/animation from the standard attack sprite. The requirements must specify that a separate animation state is needed without naming specific files.

**Cross-reference before writing (read these, do not duplicate existing FRs):**
- `finalfight-AAA/requirements/enemy-behaviour.md`
- `finalfight-AAA/requirements/combat-system.md`
- `finalfight-AAA/requirements/enemy-ai.md`

---

**The four areas this file must cover:**

**Area 1 — Standard boss attack (baseline):**
The boss has a primary attack used during normal combat proximity. It plays its designated standard attack animation, applies damage to the player on a successful hit, and follows the same hitbox/hurtbox model established for regular enemies. This is the attack the player will encounter most frequently.

**Area 2 — Critical attack definition and rarity:**
The boss has a second, critical attack that is rare relative to the standard attack. The critical attack deals significantly more damage than the standard attack. The boss selects the critical attack through a low-probability decision at appropriate moments — not on every attack cycle. The rarity must make the critical attack feel like a meaningful escalation, not a common event. The exact probability is an open question for the human operator to tune.

**Area 3 — Critical attack cooldown:**
After the boss executes a critical attack, it cannot use the critical attack again for exactly 5 seconds. During the cooldown the boss continues using its standard attack normally. The cooldown begins from the moment the critical attack animation starts, not from when it lands. A visual indicator of the cooldown state is optional but the behaviour is mandatory.

**Area 4 — Critical attack telegraph and game feel:**
The critical attack must be telegraphed to the player before it lands. A brief wind-up or charge phase — using a visually distinct animation state different from both the standard attack and idle sprites — must play before the hit is applied. This telegraph gives the player a reaction window to act. The critical attack, when it lands, must feel substantially heavier than a standard hit: the impact must be visually and mechanically distinguishable (e.g. larger knockback, longer hit stun, or a distinct visual effect on the player). The overall rhythm of the encounter must feel learnable — the player should be able to identify the critical attack tell after a few encounters and adapt.

---

**Writing rules:**
- Plain English only — no YAML, no code blocks, no implementation detail
- Each FR must be one independently testable behaviour
- NFRs must cover: telegraph duration (minimum player reaction window), cooldown precision, damage differential between standard and critical, and the feel requirement that the critical attack is memorable and learnable
- Open Questions must flag: exact critical attack probability value, exact damage values for standard vs critical hit, whether the telegraph phase makes the boss temporarily vulnerable to player counter-attacks, and whether any visual cooldown indicator is required

# Steps to execute

## Step 1 — Invoke prompt-logger
Append this invocation to `.prompts-log.md` before any other action.

## Step 2 — Read cross-reference files
Read the three listed requirements files. Identify existing FRs covering boss attack behaviour, combat damage model, and hitbox systems to avoid duplication.

## Step 3 — Write the requirements file
Produce `finalfight-AAA/requirements/boss-attacks.md`. Use `## Area N —` subsection headers before each FR cluster. Suggested FR band allocation:
- `FR-BA-01 to FR-BA-09`: standard boss attack behaviour
- `FR-BA-10 to FR-BA-19`: critical attack definition and rarity
- `FR-BA-20 to FR-BA-29`: cooldown mechanics
- `FR-BA-30 to FR-BA-39`: telegraph, game feel, and player experience

## Step 4 — Commit
```
feat(requirements): boss-attacks requirements — dual attack system with critical and cooldown
```

# Output format
Produce the full file content in one block. After the commit, print a summary table with columns: FR/NFR ID, one-line description, area. List all Open Questions with a clear note on which ones must be resolved by the human operator before OpenSpec can produce a complete specification.