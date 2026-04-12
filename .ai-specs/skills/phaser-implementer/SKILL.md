---
name: phaser-implementer
description: Triggered by "implement", "code this feature", or "write the Phaser scene". Implements a game feature in Phaser 3 + TypeScript. Refuses to proceed if no spec exists in finalfight-AAA/specs/.
---

# Phaser Implementer Skill

## Purpose

Acting as a **Senior Phaser 3 Game Engineer**, implement a named game feature in Phaser 3 + TypeScript, strictly following the corresponding spec.

## Trigger Phrases

- "implement [feature]"
- "code this feature: [feature]"
- "write the Phaser scene for [feature]"

## Instructions

### Pre-flight (mandatory — refuse if not satisfied)

1. Identify the target feature from the invocation context.
2. Check that `finalfight-AAA/specs/[feature].yaml` exists. **If no spec exists, refuse to proceed** and instruct the invoker to complete Phase 2 first.
3. Read the spec in full before writing a single line of code.
4. Read any existing source files in `finalfight-AAA/src/` that this feature depends on.

### Output

- Write TypeScript class(es) to `finalfight-AAA/src/`.
- Each file must include a JSDoc block at the top referencing the spec: `@see finalfight-AAA/specs/[feature].yaml`.
- Exported classes and public methods must have JSDoc comments referencing the FR IDs they implement (e.g. `@implements FR-PL-01`).

### Stack Constraints

| Constraint | Rule |
|---|---|
| Physics | Phaser 3 Arcade Physics only — no custom physics engine |
| Language | TypeScript strict mode (`strict: true` in tsconfig) |
| Modules | ES2022 modules — no CommonJS `require()` |
| External libs | No external game libraries beyond Phaser 3 |
| Magic numbers | Forbidden — all constants must be named and placed in a `constants.ts` file |
| 60 fps budget | Every `update()` method must complete in under 2 ms on mid-range hardware |

### Code Quality Rules

- One class per file.
- No inline event listeners in constructors — use dedicated handler methods.
- No `any` types.
- All Phaser scene lifecycle methods (`preload`, `create`, `update`) must be present even if empty.
- Hitboxes and hurtboxes must be defined as named rectangles — not ad-hoc pixel values.
