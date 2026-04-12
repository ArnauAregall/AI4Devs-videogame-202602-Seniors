# Role
You are a senior software engineering orchestrator running inside Claude Code.

# Objective
Audit all existing skills under `.ai-specs/skills/`, then generate a new `orchestrator` skill at `.ai-specs/skills/orchestrator/SKILL.md` that drives the full proposal-to-archive cycle for a single game subsystem when invoked as `/orchestrator @finalfight-AAA/requirements/[subsystem].md`.

# Context

**What exists:**
- Skills under `.ai-specs/skills/`: `prompt-logger`, `game-requirements`, `phaser-implementer`, `game-qa`, `sprite-provisioner`
- Agents under `.ai-specs/agents/`: `01-requirements-agent`, `02-architect-agent`, `03-implementer-agent`, `04-qa-agent`, `05-reviewer-agent`
- Requirement files under `finalfight-AAA/requirements/`: game-loop, player, enemy-ai, combat-system, stage, hud, assets
- OpenSpec is initialised; the `/opsx:propose` command is available

**What is missing:**
A skill that combines the existing agents and skills into a single, reusable subsystem cycle. Currently the orchestration logic only exists as a one-off prompt. It should instead live as a versioned, readable skill file so any agent session can invoke it with a single command.

**Invocation target:**
The skill must be invocable as:
```
/orchestrator @finalfight-AAA/requirements/[subsystem].md
```
The `@` reference passes the requirement file as the sole input. The skill derives everything else (subsystem name, dependencies, asset needs) from the file path and the project layout.

**Mandatory build order the skill must enforce:**
| # | Subsystem | Depends on |
|---|-----------|------------|
| 1 | game-loop | — |
| 2 | player | game-loop |
| 3 | stage | game-loop, player |
| 4 | combat-system | player, stage |
| 5 | enemy-ai | combat-system, stage |
| 6 | hud | player, enemy-ai, combat-system |

# Steps to execute

## Step 1 — Invoke prompt-logger
Append this session's invocation to `.prompts-log.md` before any other action.

## Step 2 — Audit existing skills
Read every `SKILL.md` under `.ai-specs/skills/`. For each skill, note: name, trigger phrases, input contract, output contract, and which agents use it. Identify any overlap or gap relevant to the orchestrator skill being created. Confirm no existing skill already covers end-to-end subsystem orchestration.

## Step 3 — Generate the orchestrator skill
Produce `.ai-specs/skills/orchestrator/SKILL.md` with the following structure:

**Frontmatter:**
```yaml
name: orchestrator
description: >
  Drives the full OpenSpec proposal-to-archive cycle for a single game subsystem.
  Invoke with a requirement file reference: /orchestrator @finalfight-AAA/requirements/[subsystem].md
  Trigger phrases: "orchestrate", "run the cycle for", "propose and implement", "/orchestrator @"
```

**Instructions the skill must contain:**

*Pre-flight (always runs first):*
- Load and invoke `prompt-logger` skill — append invocation to `.prompts-log.md`
- Derive subsystem name from the input file path
- Look up the subsystem in the build order table; identify its declared dependencies
- Verify each dependency subsystem has an archived OpenSpec proposal before proceeding; halt with a clear error if any dependency is not yet archived

*Phase 1 — Asset provisioning:*
- Load and invoke `sprite-provisioner` skill for the derived subsystem name
- Confirm all required asset keys are present in `finalfight-AAA/src/assets/AssetKeys.ts` before continuing

*Phase 2 — OpenSpec proposal (human gate):*
- Run `/opsx:propose @[input file]`
- After the proposal is generated, verify every FR and NFR from the requirement file is covered by at least one spec entry; flag untraced items and `status: deferred` Open Questions explicitly
- **STOP. Present the full proposal to the human operator and ask for explicit approval before proceeding.** Do not advance to Phase 3 without a clear "approved" response.

*Phase 3 — Implementation:*
- Load `03-implementer-agent.agent.md`, which loads the `phaser-implementer` skill
- Implement all approved spec entries in `finalfight-AAA/src/`
- Each public method must carry JSDoc referencing its spec entry ID (e.g. `@spec FR-GL-01`)
- No behaviour outside the approved proposal

*Phase 4 — Integration checkpoint:*
- Verify the subsystem is functional in the browser using the checkpoint table below
- If the checkpoint fails, the skill must instruct the Implementer Agent to fix and re-verify before proceeding

| Subsystem | Integration checkpoint |
|-----------|----------------------|
| game-loop | Canvas renders; stable 60 fps tick in console; full scene lifecycle completes without error |
| player | Sprite appears; moves, jumps, and idles; all state transitions work without enemies |
| stage | Background scrolls with player; 3 parallax layers visible; spawn zones defined but inactive |
| combat-system | Player attacks; hitbox debug overlay correct; damage applies to test dummy |
| enemy-ai | One enemy archetype spawns, patrols, aggros, attacks, and dies |
| hud | Health, score, lives update in combat; game over and stage clear screens trigger |

*Phase 5 — QA:*
- Load `04-qa-agent.agent.md`, which loads the `game-qa` skill
- Write Vitest tests in `finalfight-AAA/src/__tests__/[subsystem].test.ts`; run them; all must pass

*Phase 6 — Review:*
- Load `05-reviewer-agent.agent.md`
- Output LGTM or REQUEST CHANGES with inline comments referencing spec FR IDs
- If REQUEST CHANGES, Implementer Agent addresses all comments; reviewer re-approves before proceeding

*Phase 7 — Archive and commit:*
- Archive the proposal in OpenSpec (mark as implemented/closed)
- Commit: `feat([subsystem]): implement, test, and archive OpenSpec proposal`

**Hard constraints the skill must declare:**
- Never advance past Phase 2 without explicit human approval
- Never implement behaviour outside the approved proposal
- Never modify files under `finalfight-AAA/requirements/`
- Never reference `itch-io-resources/` paths in any generated source file
- Build order is a hard gate — halt if dependencies are not archived
- All commits follow Conventional Commits format

**Output format the skill must specify:**
- At Phase 2: present the full proposal and wait for approval
- After each phase: one-line status confirming completion
- Final output: spec entries implemented, test results, reviewer verdict, archive confirmation

## Step 4 — Update AGENTS.md
Add the `orchestrator` skill to the Skills table in `AGENTS.md` with: skill name, path (`.ai-specs/skills/orchestrator/`), invocation syntax (`/orchestrator @finalfight-AAA/requirements/[subsystem].md`), and context (invoke once per subsystem, in build order, with dependencies archived first).

## Step 5 — Commit
```
feat(skills): add orchestrator skill for subsystem proposal-to-archive cycle
```

# Constraints
- Do not run the orchestrator skill in this session — only create it
- Do not modify any existing skill files
- The new skill must be self-contained: a fresh agent session with no prior context must be able to read it and execute the full cycle correctly
- All commits follow Conventional Commits format

# Output format
Execute each step in order, stating the step number. Produce the full `SKILL.md` content. End with a summary of the skill audit findings and the invocation syntax for the new skill.