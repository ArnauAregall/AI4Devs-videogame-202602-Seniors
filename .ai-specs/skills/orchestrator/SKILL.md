---
name: orchestrator
description: >
  Drives the full OpenSpec proposal-to-archive cycle for a single game subsystem.
  Invoke with a requirement file reference:
    /orchestrator @finalfight-AAA/requirements/[subsystem].md
  Trigger phrases: "orchestrate", "run the cycle for", "propose and implement",
  "/orchestrator @"
---

# Orchestrator Skill

## Purpose

Acting as a **Senior Software Engineering Orchestrator**, drive the complete
proposal-to-archive cycle for one named game subsystem — from asset provisioning
through OpenSpec proposal, implementation, integration verification, QA, review,
and final archive. This skill is self-contained: a fresh agent session with no
prior context can read it and execute the full cycle correctly.

## Invocation Syntax

```
/orchestrator @finalfight-AAA/requirements/[subsystem].md
```

The `@` reference passes the requirement file as the sole input. All other
information (subsystem name, build-order dependencies, required assets) is
derived from the file path and the project layout described below.

## Project Layout Reference

```
.ai-specs/
  agents/
    01-requirements-agent.agent.md
    02-architect-agent.agent.md
    03-implementer-agent.agent.md
    04-qa-agent.agent.md
    05-reviewer-agent.agent.md
  skills/
    prompt-logger/SKILL.md
    game-requirements/SKILL.md
    phaser-implementer/SKILL.md
    game-qa/SKILL.md
    sprite-provisioner/SKILL.md
    orchestrator/SKILL.md        ← this file

finalfight-AAA/
  requirements/[subsystem].md   ← input
  specs/[subsystem].yaml        ← created in Phase 2
  src/                          ← created in Phase 3
  src/__tests__/                ← created in Phase 5
  src/assets/AssetKeys.ts
  public/assets/
```

## Build Order (Hard Gate)

The following table defines the mandatory implementation order. A subsystem
may not begin Phase 2 until every subsystem it depends on has a **closed/archived**
OpenSpec proposal. Violation halts the skill immediately with a BUILD ORDER ERROR.

| # | Subsystem | Depends on |
|---|-----------|------------|
| 1 | game-loop | — |
| 2 | player | game-loop |
| 3 | stage | game-loop, player |
| 4 | combat-system | player, stage |
| 5 | enemy-ai | combat-system, stage |
| 6 | hud | player, enemy-ai, combat-system |

---

## Execution Phases

### Pre-flight (always runs first, before any phase)

**P0-1 — Prompt log:**
Load and invoke `.ai-specs/skills/prompt-logger/SKILL.md`. Append an entry to
`.prompts-log.md` before any further action. Record: agent = orchestrator,
invocation prompt = full `/orchestrator @...` command, input artefact = the
requirement file path, skills to be used = all skills listed in this file.

**P0-2 — Derive subsystem:**
Extract the subsystem name from the input file path. The subsystem name is the
stem of the filename: `finalfight-AAA/requirements/player.md` → `player`.
Valid values: `game-loop`, `player`, `stage`, `combat-system`, `enemy-ai`, `hud`.
If the value is not in this list, halt with: `ORCHESTRATOR ERROR: unknown subsystem
"[name]". Valid subsystems: game-loop, player, stage, combat-system, enemy-ai, hud.`

**P0-3 — Dependency gate:**
Look up the subsystem in the Build Order table. For each declared dependency:

1. Check that `finalfight-AAA/specs/[dependency].yaml` exists.
2. Check that the OpenSpec proposal for that dependency is archived (status: closed
   or implemented — look for the archive marker in the OpenSpec change directory, or
   check `openspec/changes/[dependency]/` for a completed/archived state file).
3. If any dependency is not archived, halt immediately with:

```
BUILD ORDER ERROR: subsystem "[target]" depends on "[dependency]", which has not
yet been archived. Complete the full orchestrator cycle for "[dependency]" before
running this one.
```

Do not proceed past Pre-flight until all dependency checks pass.

---

### Phase 1 — Asset Provisioning

**1-1 — Run sprite-provisioner:**
Load and invoke `.ai-specs/skills/sprite-provisioner/SKILL.md` for the derived
subsystem name. Pass the subsystem name as the input. Follow the provisioner's
manifest output and confirm every copy operation succeeded.

**1-2 — Verify AssetKeys.ts coverage:**
Read `finalfight-AAA/src/assets/AssetKeys.ts`. For each asset the requirement file
references (explicitly or implied by the character states / stage layers it defines),
confirm a corresponding `ASSET_KEY_*` constant and `ASSET_PATH` entry exist.
If any required key is missing, do not proceed to Phase 2; instead instruct the
operator to re-run the sprite-provisioner or add the missing key manually.

**Phase 1 status line (output after success):**
`[Phase 1 ✓] Asset provisioning complete. N files copied, M keys verified in AssetKeys.ts.`

---

### Phase 2 — OpenSpec Proposal  ⚠️ HUMAN GATE

**2-1 — Run `/opsx:propose`:**
Execute:
```
/opsx:propose @finalfight-AAA/requirements/[subsystem].md
```
Wait for the full proposal to be generated before proceeding.

**2-2 — Trace coverage:**
For every FR and NFR in the requirement file, verify that at least one spec entry
in the generated proposal references or covers it. Build a traceability table:

```
FR-[ID] → spec entry [ID] [covered / untraced]
NFR-[ID] → spec entry [ID] [covered / untraced]
```

Flag all untraced items and any Open Questions marked `status: deferred` explicitly
in your output so the operator can decide before approving.

**2-3 — STOP. Present and wait for approval:**
Output the full proposal and the traceability table. Then output exactly:

```
═══════════════════════════════════════════════════════
ORCHESTRATOR — PHASE 2 GATE
Proposal for subsystem "[subsystem]" is ready for review.

Untraced items: [N] (listed above)
Deferred open questions: [N] (listed above)

Type "approved" to proceed to Phase 3 (Implementation).
Type "reject" or provide comments to revise the proposal.
═══════════════════════════════════════════════════════
```

**Do not advance to Phase 3 without an explicit "approved" response from the
human operator.** If the operator rejects or comments, revise the proposal,
re-run coverage tracing, and re-present the gate. Repeat until approved.

**Phase 2 status line (output after approval):**
`[Phase 2 ✓] Proposal approved by operator. N spec entries approved, M deferred.`

---

### Phase 3 — Implementation

**3-1 — Load implementer agent:**
Load `.ai-specs/agents/03-implementer-agent.agent.md`, which will in turn load
`.ai-specs/skills/phaser-implementer/SKILL.md`. Pass the approved spec as context.

**3-2 — Implement all approved spec entries:**
The implementer agent writes TypeScript source to `finalfight-AAA/src/`. Every
public method must carry JSDoc referencing its spec entry ID:

```typescript
/**
 * @spec FR-GL-01
 * @implements FR-GL-02
 */
```

**3-3 — Scope constraint:**
The implementer must implement **only** behaviours covered by an approved spec entry.
No speculative features, no behaviour outside the approved proposal. If the
implementer identifies a necessary behaviour not covered by any spec entry, it must
pause and raise it to the operator before writing code for it.

**Phase 3 status line (output after completion):**
`[Phase 3 ✓] Implementation complete. N files written, M classes created.`

---

### Phase 4 — Integration Checkpoint

**4-1 — Run the subsystem-specific checkpoint:**
Instruct the implementer agent to verify the subsystem is functional in the browser
(or in a headless Phaser environment if available) using the following checklist:

| Subsystem | Integration checkpoint |
|-----------|----------------------|
| game-loop | Canvas renders; stable 60 fps tick visible in console; full scene lifecycle (Boot → Preload → MainMenu → Game) completes without error |
| player | Brawler Girl sprite appears; walk, jump, and idle state transitions all work without enemies present; no console errors |
| stage | Background scrolls with player movement; at least 3 parallax layers are visible; spawn zones are defined and queryable but no enemies spawn |
| combat-system | Player attacks register; hitbox debug overlay is visible and correct when debug mode is enabled; test-dummy entity receives and displays damage |
| enemy-ai | One Enemy Punk spawns, patrols its zone, transitions to aggro when player enters radius, attacks, and transitions to death on defeat |
| hud | Health bar updates on damage; score increments on enemy defeat; lives counter decrements on death; game over screen triggers when lives reach zero; stage clear screen triggers on stage clear condition |

**4-2 — On checkpoint failure:**
If the checkpoint fails for any criterion, instruct the implementer agent to fix the
failing criterion and re-run the checkpoint. Do not proceed to Phase 5 until the
checkpoint passes in full.

**Phase 4 status line (output after success):**
`[Phase 4 ✓] Integration checkpoint passed. All [N] criteria verified.`

---

### Phase 5 — QA

**5-1 — Load QA agent:**
Load `.ai-specs/agents/04-qa-agent.agent.md`, which loads `.ai-specs/skills/game-qa/SKILL.md`.

**5-2 — Write and run tests:**
The QA agent writes Vitest test files to `finalfight-AAA/src/__tests__/[subsystem].test.ts`.
For every FR in the approved spec, the test suite must contain at minimum:
- One happy-path test
- One failure-state test
- One edge-case test

**5-3 — All tests must pass:**
Run `npm run test` (or the project's test command) inside `finalfight-AAA/`. If any
test fails, the QA agent must fix the test or raise a defect for the implementer
agent. Do not proceed to Phase 6 until `npm run test` exits with code 0.

**Phase 5 status line (output after success):**
`[Phase 5 ✓] QA complete. N tests written, all passing.`

---

### Phase 6 — Review

**6-1 — Load reviewer agent:**
Load `.ai-specs/agents/05-reviewer-agent.agent.md`.

**6-2 — Review scope:**
The reviewer checks all changed files (staged changes since the last commit on this
subsystem) against the approved spec. The reviewer evaluates:
- TypeScript strict compliance
- Phaser 3 best practices
- Full FR coverage (every approved FR has corresponding implementation)
- 60 fps budget awareness (no unbounded loops in `update()`)
- No magic numbers
- JSDoc `@spec` / `@implements` annotations present

**6-3 — Review verdict:**
The reviewer outputs either `LGTM` or `REQUEST CHANGES` with inline comments
referencing spec FR IDs. If `REQUEST CHANGES`:
1. The implementer agent addresses every comment.
2. The reviewer re-reviews and must output `LGTM` before Phase 7 begins.
Repeat until `LGTM`.

**Phase 6 status line (output after LGTM):**
`[Phase 6 ✓] Review passed. LGTM issued by reviewer-agent.`

---

### Phase 7 — Archive and Commit

**7-1 — Archive OpenSpec proposal:**
Mark the proposal as implemented and closed in OpenSpec. Follow the archive
procedure in `.ai-specs/skills/` or the OpenSpec documentation for the project.

**7-2 — Commit:**
Stage all changed files (`finalfight-AAA/src/`, `finalfight-AAA/src/__tests__/`,
any updated `AssetKeys.ts`, OpenSpec archive marker). Then commit:

```
feat([subsystem]): implement, test, and archive OpenSpec proposal

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

**7-3 — Final output:**
Print the following summary:

```
═══════════════════════════════════════════════════════
ORCHESTRATOR — CYCLE COMPLETE
Subsystem:        [subsystem]
Spec entries:     [N] implemented
Test results:     [N] tests, [N] passing, [N] skipped
Reviewer verdict: LGTM
Archive status:   closed
Commit:           [short SHA] feat([subsystem]): implement, test, and archive OpenSpec proposal
═══════════════════════════════════════════════════════
```

**Phase 7 status line:**
`[Phase 7 ✓] Archived and committed. Cycle complete for subsystem "[subsystem]".`

---

## Hard Constraints

These constraints are non-negotiable. Any violation must cause the skill to halt
immediately and report the violation before taking further action.

| # | Constraint |
|---|-----------|
| C-01 | Never advance past Phase 2 without explicit "approved" from the human operator |
| C-02 | Never implement behaviour outside the approved OpenSpec proposal |
| C-03 | Never modify files under `finalfight-AAA/requirements/` |
| C-04 | Never reference `itch-io-resources/` paths in any generated source file, test, or config |
| C-05 | Build order is a hard gate — halt with BUILD ORDER ERROR if any dependency is not archived |
| C-06 | All commits follow Conventional Commits format |
| C-07 | Never skip a phase — every phase must complete (or explicitly be declared N/A) before the next begins |
| C-08 | Phase 5 (QA) may not be skipped even if the reviewer would pass the code without tests |

---

## Skills Used by This Skill

| Phase | Skill / Agent loaded |
|-------|---------------------|
| Pre-flight | `prompt-logger` |
| Phase 1 | `sprite-provisioner` |
| Phase 2 | OpenSpec (`/opsx:propose`) |
| Phase 3 | `03-implementer-agent` → `phaser-implementer` |
| Phase 5 | `04-qa-agent` → `game-qa` |
| Phase 6 | `05-reviewer-agent` |

---

## Error Reference

| Error | Cause | Resolution |
|-------|-------|-----------|
| `ORCHESTRATOR ERROR: unknown subsystem` | Input file path does not match a known subsystem | Check the file path and try again with a valid subsystem |
| `BUILD ORDER ERROR` | A dependency subsystem has not been archived | Run the orchestrator for the dependency first |
| `ASSET COVERAGE ERROR` | Required AssetKey missing for this subsystem | Re-run sprite-provisioner or add the missing key to AssetKeys.ts |
| `PHASE 2 GATE` | Waiting for human approval | Type "approved" to continue or provide revision feedback |
| `CHECKPOINT FAILURE` | Integration checkpoint criterion not met | Fix the failing criterion; the implementer agent will re-verify |
| `TEST FAILURE` | One or more Vitest tests fail | QA agent fixes tests; re-run until all pass |
| `REQUEST CHANGES` | Reviewer found issues | Implementer addresses comments; reviewer re-approves |
