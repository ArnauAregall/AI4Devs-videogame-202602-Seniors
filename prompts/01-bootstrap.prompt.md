# Role
You are a senior software engineering orchestrator running inside Claude Code. Your mission in this session is Phase 1 only: bootstrap the repository, establish the vendor-agnostic agent and skill layout, wire the platform-specific symlinks, and have the Requirements Agent produce plain functional requirements for every game subsystem. No game implementation happens in this phase.

# Objective
Set up a production-grade, vendor-agnostic AI-assisted development environment for a Final Fight clone (browser-based 2D beat-'em-up), following the `.ai-specs/` pattern as the single source of truth for agents and skills, with `.claude/` and `.github/` containing only symlinks into it. All game source code and documentation lives under `finalfight-AAA/`. Every prompt issued to any agent is appended to `.prompts-log.md` at the repository root.

# Context

**Game concept:** Final Fight clone — side-scrolling 2D beat-'em-up, stage-based, multiple enemy types, 1–2 players.

**Tech stack (non-negotiable):**
- Framework: Phaser 3 (best AI training coverage, ideal Arcade Physics for beat-'em-up hitboxes, official Vite integration)
- Build tool: Vite
- Language: TypeScript (strict mode)
- Scaffold base: official Phaser Vite TypeScript template — `phaserjs/template-vite-ts`

**Vendor-agnostic AI tooling conventions (follow exactly):**
- `.ai-specs/` is the single source of truth for all agents and skills — lives at the repository root
- `.claude/` contains only a subfolder `agents/` which is a symlink to `.ai-specs/agents/` — no other files
- `.github/` contains only two subfolders: `agents/` (symlink to `.ai-specs/agents/`) and `skills/` (symlink to `.ai-specs/skills/`) — no other files
- `AGENTS.md` at the repository root is the vendor-agnostic meta-manifest (readable by Claude Code, GitHub Copilot, and future tools)
- Agent files live at `.ai-specs/agents/[NN]-[name].agent.md` and use YAML frontmatter (`name`, `model`, `description`) followed by markdown operating instructions
- Skill files live at `.ai-specs/skills/[name]/SKILL.md` and use YAML frontmatter (`name`, `description`) followed by markdown operating instructions
- Templates for a skill live at `.ai-specs/skills/[name]/templates/`

**Prompt logging convention:** Every agent must invoke the `prompt-logger` skill as its very first action, before any other work. This appends a structured entry — including timestamp, phase, agent name, and the full invocation prompt — to `.prompts-log.md` at the repository root.

**Game project layout:** All Phaser scaffold files, game source, requirements, specs, and docs live inside `finalfight-AAA/`. The AI tooling files (`AGENTS.md`, `.ai-specs/`, `.claude/`, `.github/`) and the prompt log (`.prompts-log.md`) remain at the repository root.

**Development workflow (phases):**
- Phase 1 (this session): bootstrap repo, configure agents and skills, write plain functional requirements
- Phase 2 (future): translate requirements into OpenSpec specifications using the OpenSpec tool
- Phase 3 (future): implement game features using the Phaser Implementer Agent and skill
- Phase 4 (future): QA and polish

# Steps to execute

## Step 1 — Scaffold Phaser template inside `finalfight-AAA/`
```bash
mkdir finalfight-AAA
cd finalfight-AAA
npm create phaser-game@latest . -- --template vite-ts
npm install
npm run dev   # verify dev server starts, then stop it
cd ..
```
Commit with: `chore: scaffold finalfight-AAA from phaserjs/template-vite-ts`

## Step 2 — Create the full directory structure
The final layout at repository root must be:

```
AGENTS.md                            ← vendor-agnostic meta-manifest
.prompts-log.md                      ← append-only prompt audit trail
.ai-specs/
  agents/                            ← agent definitions (source of truth)
  skills/
    prompt-logger/
      SKILL.md
    game-requirements/
      SKILL.md
    phaser-implementer/
      SKILL.md
    game-qa/
      SKILL.md
.claude/
  agents  →  symlink: ../.ai-specs/agents
.github/
  agents  →  symlink: ../.ai-specs/agents
  skills  →  symlink: ../.ai-specs/skills
finalfight-AAA/                      ← ALL game content lives here
  package.json                       (from Phaser scaffold)
  vite.config.ts                     (from Phaser scaffold)
  tsconfig.json                      (from Phaser scaffold)
  index.html                         (from Phaser scaffold)
  src/                               (game source — Phase 3)
  public/                            (assets — Phase 3)
  requirements/                      ← Phase 1 output
    game-loop.md
    player.md
    enemy-ai.md
    combat-system.md
    stage.md
    hud.md
  specs/                             ← Phase 2 output (empty now)
  docs/
    architecture.md                  ← Phase 1 output (Architect Agent)
```

Run these setup commands from the repository root:
```bash
mkdir -p .claude .github .ai-specs/agents .ai-specs/skills
ln -s ../.ai-specs/agents .claude/agents
ln -s .ai-specs/agents .github/agents
ln -s .ai-specs/skills .github/skills
mkdir -p finalfight-AAA/requirements finalfight-AAA/specs finalfight-AAA/docs
touch .prompts-log.md
```

## Step 3 — Write AGENTS.md (root vendor-agnostic manifest)
`AGENTS.md` is the single meta-manifest read by Claude Code, GitHub Copilot, and any future AI tool. It must cover:

- **Product context**: game name, genre, tech stack, current phase, `finalfight-AAA/requirements/` as Phase 1 source of truth, `finalfight-AAA/specs/` as Phase 2 source of truth
- **Prompt logging**: `.prompts-log.md` at the repository root is the append-only audit trail; every agent must invoke the `prompt-logger` skill before any other action
- **Skills table**: each skill name, path under `.ai-specs/skills/`, and when to invoke it
- **Agent orchestration table**: each agent number, name, path under `.ai-specs/agents/`, responsibility, and which skill(s) it uses
- **Workflow rules**: no agent may skip a phase; no feature may be implemented without a requirement in `finalfight-AAA/requirements/` and a spec in `finalfight-AAA/specs/`; every agent logs its prompt first
- **Symlink map**: `.claude/agents` and `.github/agents` → `.ai-specs/agents/`, `.github/skills` → `.ai-specs/skills/`
- **Phase map**: Phase 1 → 2 → 3 → 4 with input/output directories per phase
- **Commit message format**: Conventional Commits

## Step 4 — Write the skill definitions

### `.ai-specs/skills/prompt-logger/SKILL.md`
Frontmatter: `name: prompt-logger`, `description` (trigger: invoked by every agent as its mandatory first action before any other work).

Instructions: append a structured entry to `.prompts-log.md` at the repository root. Never overwrite the file — always append. The entry format is:

```markdown
---
## [ISO-8601 timestamp] — [Agent name] | Phase [N]

**Invocation prompt:**
[Full text of the prompt or instruction that triggered this agent invocation]

**Context:**
- Agent: [agent file path]
- Skill(s) to be used: [comma-separated list]
- Input artefacts: [files or context this agent will read]
- Expected output artefacts: [files this agent will produce]
---
```

After appending, confirm the write succeeded before proceeding. If `.prompts-log.md` does not exist, create it with a header:
```markdown
# Prompt Log — finalfight-AAA

> Append-only audit trail of every agent invocation prompt across all development phases.
> Format: ISO-8601 timestamp | Agent | Phase | Full prompt | Context
```

### `.ai-specs/skills/game-requirements/SKILL.md`
Frontmatter: `name: game-requirements`, `description` (trigger phrases: "write requirements for", "define subsystem", "document behaviour of"). Instructions: acting as a Senior Game Designer and Systems Analyst, produce plain-English functional requirements for a named game subsystem. All output files are written to `finalfight-AAA/requirements/[subsystem].md`. Output structure per file:
- `# [Subsystem] — Functional Requirements`
- `## Overview` (2–3 sentences: what this subsystem does and why)
- `## Functional Requirements` — `FR-[ID]: [one testable behaviour per line]`
- `## Non-Functional Requirements` — `NFR-[ID]: [performance, UX, or accessibility constraint]`
- `## Open Questions` — decision points requiring human input before specs can be written

No YAML, no code blocks, no implementation detail inside requirement files.

### `.ai-specs/skills/phaser-implementer/SKILL.md`
Frontmatter: `name: phaser-implementer`, `description` (trigger phrases: "implement", "code this feature", "write the Phaser scene"). Instructions: acting as a Senior Phaser 3 Game Engineer, implement a game feature in Phaser 3 + TypeScript. Pre-flight: read the corresponding spec from `finalfight-AAA/specs/` before writing a single line of code; refuse to proceed if no spec exists. Output: TypeScript class(es) in `finalfight-AAA/src/`, with JSDoc referencing the spec. Stack constraints: Phaser 3 Arcade Physics, ES2022 modules, strict TypeScript, no external game libraries beyond Phaser.

### `.ai-specs/skills/game-qa/SKILL.md`
Frontmatter: `name: game-qa`, `description` (trigger phrases: "write tests for", "test this mechanic", "qa coverage"). Instructions: acting as a Senior QA Engineer, produce test coverage for a game system. Pre-flight: read the spec from `finalfight-AAA/specs/` and the implementation from `finalfight-AAA/src/`. Output: Vitest test files in `finalfight-AAA/src/__tests__/`, covering happy path, failure state, and at least one edge case per FR.

## Step 5 — Write the agent definitions

Every agent definition must include in its pre-flight section:
1. `prompt-logger` invocation (mandatory first action)
2. Then its domain skill invocation

### `.ai-specs/agents/01-requirements-agent.agent.md`
Frontmatter: `name: requirements-agent`, `model: claude-sonnet-4-6`, `description`. Pre-flight: (1) invoke `prompt-logger` skill — append this invocation to `.prompts-log.md`; (2) load `.ai-specs/skills/game-requirements/SKILL.md`. Role: Senior Game Designer and Systems Analyst. Objective: for each subsystem named in the invocation context, invoke the `game-requirements` skill once and write the output to `finalfight-AAA/requirements/[subsystem].md`. Default subsystems if not overridden: game-loop, player, enemy-ai, combat-system, stage, hud. Output: one file per subsystem — no preamble, no commentary.

### `.ai-specs/agents/02-architect-agent.agent.md`
Frontmatter: `name: architect-agent`, `model: claude-sonnet-4-6`, `description`. Pre-flight: (1) invoke `prompt-logger` skill; (2) confirm all `finalfight-AAA/requirements/*.md` files exist. Role: Senior Game Architect. Objective: review all requirement files and produce `finalfight-AAA/docs/architecture.md` covering Phaser scene graph, game object hierarchy, data flow between subsystems, and key architectural decisions. Output: prose only — no implementation code.

### `.ai-specs/agents/03-implementer-agent.agent.md`
Frontmatter: `name: implementer-agent`, `model: claude-sonnet-4-6`, `description`. Pre-flight: (1) invoke `prompt-logger` skill; (2) load `.ai-specs/skills/phaser-implementer/SKILL.md`. Role: Senior Phaser 3 Game Engineer. Objective: implement one named game feature per invocation. Hard rule: refuse if no spec exists in `finalfight-AAA/specs/`. Output: TypeScript source in `finalfight-AAA/src/`.

### `.ai-specs/agents/04-qa-agent.agent.md`
Frontmatter: `name: qa-agent`, `model: claude-sonnet-4-6`, `description`. Pre-flight: (1) invoke `prompt-logger` skill; (2) load `.ai-specs/skills/game-qa/SKILL.md`. Role: Senior QA Engineer. Objective: write test coverage for one named game system per invocation. Requires both `finalfight-AAA/specs/[system].yaml` and `finalfight-AAA/src/[system].ts` to exist. Output: Vitest test file in `finalfight-AAA/src/__tests__/`.

### `.ai-specs/agents/05-reviewer-agent.agent.md`
Frontmatter: `name: reviewer-agent`, `model: claude-sonnet-4-6`, `description`. Pre-flight: (1) invoke `prompt-logger` skill; (2) confirm corresponding spec in `finalfight-AAA/specs/` exists for every changed file. Role: Staff Engineer and Code Reviewer. Objective: review all changed files against their spec. Check: TypeScript strict compliance, Phaser 3 best practices, spec FR coverage, 60 fps budget awareness, no magic numbers. Output: structured review with LGTM / REQUEST CHANGES verdict and inline comments referencing spec FRs.

## Step 6 — Run the Requirements Agent (Phase 1 output)
Acting as the Requirements Agent — invoking `prompt-logger` first, then loading `.ai-specs/skills/game-requirements/SKILL.md` — produce the six requirement files under `finalfight-AAA/requirements/`. Subsystems to cover:

- **game-loop**: target frame rate, fixed-timestep update, scene lifecycle (boot, preload, game, pause, gameover), Phaser game config
- **player**: character states (idle, walk, jump, attack variants, hurt, knockdown, get-up), keyboard and gamepad input mapping, health points, lives, invincibility frames
- **enemy-ai**: at least 3 enemy archetypes, patrol behaviour, aggro detection radius, attack patterns, hit reactions, death and item-drop behaviour
- **combat-system**: hitbox/hurtbox definitions, damage calculation, knockback vectors, combo counter, hit stun frames, combo window timing
- **stage**: horizontal scroll trigger, parallax background layers (minimum 3), enemy spawn zones, destructible props, stage clear condition, transition to next stage
- **hud**: player health bar, lives counter, score display, enemy health indicators (bosses), game over screen, stage clear screen, pause menu

## Step 7 — Commit Phase 1
```
feat(phase-1): vendor-agnostic agent setup, skills, prompt logger, and functional requirements
```

# Constraints
- `AGENTS.md`, `.ai-specs/`, `.claude/`, `.github/`, and `.prompts-log.md` stay at the repository root — never inside `finalfight-AAA/`
- All game source, docs, requirements, and specs live exclusively inside `finalfight-AAA/`
- `.claude/` contains only the `agents/` symlink — no `CLAUDE.md`, no other files
- `.github/` contains only the `agents/` and `skills/` symlinks — no other files
- `.prompts-log.md` is append-only — never truncated, never overwritten
- Every agent must invoke `prompt-logger` as its absolute first action
- Do not write any game implementation code in this session
- Do not create OpenSpec YAML files — that is Phase 2
- Requirements must be plain English: no YAML, no JSON, no code blocks inside requirement files
- Each FR must be independently testable
- All commits follow Conventional Commits format

# Output format
Execute each step in order. State the step number before starting it. Produce all file contents in full — no summaries or placeholders. End with a Phase 1 completion summary listing: files created, symlinks established, prompt log entries written, and open questions surfaced by the Requirements Agent.
