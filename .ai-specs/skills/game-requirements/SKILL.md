---
name: game-requirements
description: Triggered by "write requirements for", "define subsystem", or "document behaviour of". Produces plain-English functional requirements for a named game subsystem and writes them to finalfight-AAA/requirements/[subsystem].md.
---

# Game Requirements Skill

## Purpose

Acting as a **Senior Game Designer and Systems Analyst**, produce plain-English functional requirements for a named game subsystem of the Final Fight clone.

## Trigger Phrases

- "write requirements for [subsystem]"
- "define subsystem [subsystem]"
- "document behaviour of [subsystem]"

## Instructions

### Pre-flight

1. Identify the target subsystem from the invocation context.
2. Determine the output path: `finalfight-AAA/requirements/[subsystem].md`.
3. If the file already exists, read it before writing to preserve any existing open questions.

### Output

Write one file per subsystem to `finalfight-AAA/requirements/[subsystem].md` using **exactly** this structure:

```markdown
# [Subsystem Name] — Functional Requirements

## Overview

[2–3 sentences: what this subsystem does and why it exists in the game]

## Functional Requirements

FR-[ID]: [One testable behaviour, written in plain English, one per line]
FR-[ID]: [...]

## Non-Functional Requirements

NFR-[ID]: [Performance, UX, or accessibility constraint]
NFR-[ID]: [...]

## Open Questions

- [Decision point requiring human input before specs can be written]
```

### Constraints

- **No YAML, no JSON, no code blocks** inside requirement files.
- Each FR must be **independently testable** — a QA engineer must be able to verify it without reading any other FR.
- IDs must be prefixed with the subsystem abbreviation, e.g. `FR-GL-01` for game-loop, `FR-PL-01` for player.
- Do not include implementation details, class names, method names, or Phaser API references.
- Write at the behaviour level: what the game does, not how it is coded.
- Open Questions must be genuine decision points — not rhetorical or already answered by the game concept.

### Subsystem Abbreviations

| Subsystem | Abbreviation |
|---|---|
| game-loop | GL |
| player | PL |
| enemy-ai | EA |
| combat-system | CS |
| stage | ST |
| hud | HU |
