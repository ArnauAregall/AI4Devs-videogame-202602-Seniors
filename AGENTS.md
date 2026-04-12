# AGENTS.md — Final Fight Clone: Vendor-Agnostic AI Meta-Manifest

> Readable by Claude Code, GitHub Copilot, and any future AI tool.
> Single source of truth for agent orchestration, skill definitions, and development workflow.

---

## Product Context

| Field | Value |
|---|---|
| **Game name** | Final Fight Clone |
| **Genre** | Side-scrolling 2D beat-'em-up |
| **Framework** | Phaser 3 + TypeScript (strict mode) |
| **Build tool** | Vite |
| **Current phase** | Phase 1 — Requirements |
| **Phase 1 source of truth** | `finalfight-AAA/requirements/` |
| **Phase 2 source of truth** | `finalfight-AAA/specs/` |
| **Game source** | `finalfight-AAA/src/` |

---

## Prompt Logging

`.prompts-log.md` at the repository root is the **append-only audit trail** of every agent invocation.

**Rule:** Every agent must invoke the `prompt-logger` skill as its **absolute first action** before any other work. No exceptions.

---

## Skills

| Skill | Path | When to invoke |
|---|---|---|
| `prompt-logger` | `.ai-specs/skills/prompt-logger/SKILL.md` | Mandatory first action for every agent invocation |
| `game-requirements` | `.ai-specs/skills/game-requirements/SKILL.md` | "write requirements for", "define subsystem", "document behaviour of" |
| `phaser-implementer` | `.ai-specs/skills/phaser-implementer/SKILL.md` | "implement", "code this feature", "write the Phaser scene" |
| `game-qa` | `.ai-specs/skills/game-qa/SKILL.md` | "write tests for", "test this mechanic", "qa coverage" |
| `sprite-provisioner` | `.ai-specs/skills/sprite-provisioner/SKILL.md` | "provision sprites", "copy assets", "set up assets for", "prepare sprites for [subsystem]" — invoke before any implementer-agent session that requires sprites for the target subsystem |
| `orchestrator` | `.ai-specs/skills/orchestrator/SKILL.md` | `/orchestrator @finalfight-AAA/requirements/[subsystem].md` — invoke once per subsystem, in build order, with all dependencies archived first |

---

## Agent Orchestration

| # | Agent | Path | Responsibility | Skills used |
|---|---|---|---|---|
| 01 | `requirements-agent` | `.ai-specs/agents/01-requirements-agent.agent.md` | Produce plain-English functional requirements per subsystem | `prompt-logger`, `game-requirements` |
| 02 | `architect-agent` | `.ai-specs/agents/02-architect-agent.agent.md` | Review all requirements and produce architecture document | `prompt-logger` |
| 03 | `implementer-agent` | `.ai-specs/agents/03-implementer-agent.agent.md` | Implement game features in Phaser 3 + TypeScript | `prompt-logger`, `phaser-implementer` |
| 04 | `qa-agent` | `.ai-specs/agents/04-qa-agent.agent.md` | Write Vitest test coverage for game systems | `prompt-logger`, `game-qa` |
| 05 | `reviewer-agent` | `.ai-specs/agents/05-reviewer-agent.agent.md` | Review changed files against their specs | `prompt-logger` |

---

## Workflow Rules

1. **No phase skipping.** Agents may not begin Phase N+1 work until Phase N output exists.
2. **Requirements gate.** No feature may be implemented without a corresponding file in `finalfight-AAA/requirements/`.
3. **Spec gate.** No feature may be implemented without a corresponding spec in `finalfight-AAA/specs/`.
4. **Prompt logging is mandatory.** Every agent invocation must log to `.prompts-log.md` first.
5. **Requirements are plain English.** No YAML, JSON, or code blocks inside `finalfight-AAA/requirements/*.md`.
6. **Each FR must be independently testable.**
7. **All commits follow Conventional Commits format.**

---

## Symlink Map

```
.claude/agents    →  ../.ai-specs/agents/
.github/agents    →  .ai-specs/agents/
.github/skills    →  .ai-specs/skills/
```

---

## Phase Map

| Phase | Name | Input | Output | Agent(s) |
|---|---|---|---|---|
| 1 | Requirements | Game concept, tech stack | `finalfight-AAA/requirements/*.md`, `finalfight-AAA/docs/architecture.md` | `requirements-agent`, `architect-agent` |
| 2 | Specification | `finalfight-AAA/requirements/*.md` | `finalfight-AAA/specs/*.yaml` | TBD (OpenSpec) |
| 3 | Implementation | `finalfight-AAA/specs/*.yaml` | `finalfight-AAA/src/**/*.ts` | `implementer-agent` |
| 4 | QA & Polish | `finalfight-AAA/src/**/*.ts`, `finalfight-AAA/specs/*.yaml` | `finalfight-AAA/src/__tests__/**/*.test.ts` | `qa-agent`, `reviewer-agent` |

---

## Commit Message Format

All commits follow **Conventional Commits**:

```
<type>(<scope>): <description>

Types: feat, fix, chore, docs, test, refactor, style, ci
Scope: phase-1, phase-2, phase-3, phase-4, agent, skill, requirements, specs, src, docs
```
