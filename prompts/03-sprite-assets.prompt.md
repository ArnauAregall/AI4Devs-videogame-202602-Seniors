
# Role
You are a senior software engineering orchestrator running inside Claude Code.

# Objective
Audit the available free-to-use sprite assets, review all existing requirements for asset gaps, write a new `assets.md` requirement file, create a `sprite-provisioner` skill that copies and organises sprites into `finalfight-AAA/` on demand, and update `AGENTS.md` to register the new skill.

# Context

**Asset source:** Free-to-use sprite resources are located at `itch-io-resources/streets-of-fight/Assets` in the repository root. This directory is a staging area only — game code and agents must never reference it directly. All assets used by the game must be copied into `finalfight-AAA/public/assets/` before use.

**Existing requirements:** Six requirement files exist under `finalfight-AAA/requirements/`: game-loop, player, enemy-ai, combat-system, stage, hud. They were written without knowledge of the specific available sprites and may need asset-related gaps identified.

**What is missing:** No requirement file covers asset provisioning, sprite organisation, or the mapping between game entities and their sprite files. No skill exists to automate the copy-and-organise step.

# Steps to execute

## Step 1 — Invoke prompt-logger
Append this session's invocation to `.prompts-log.md` before any other action.

## Step 2 — Audit the asset source
Recursively inspect `itch-io-resources/streets-of-fight/Assets`. Produce a structured inventory:
- Directory tree with all files listed
- For each file: name, type (spritesheet, single frame, background, audio, etc.), and inferred game entity it belongs to (player, enemy type, stage element, HUD element, etc.)
- Identify any asset categories that are present but not yet covered by existing requirements, and any game entities referenced in requirements that have no matching asset

## Step 3 — Review existing requirements for asset gaps
Read all six requirement files under `finalfight-AAA/requirements/`. For each file, identify:
- FRs or NFRs that imply sprite or asset usage but do not specify the asset source or format
- Entities (player states, enemy archetypes, stage layers, HUD elements) that now have a matching asset in the inventory and where the requirement should acknowledge this
- Entities mentioned in requirements for which no asset exists in the inventory (flag as an open question)

## Step 4 — Write the assets requirement file
Produce `finalfight-AAA/requirements/assets.md` using the standard requirement file structure:

- `# Assets — Functional Requirements`
- `## Overview`
- `## Functional Requirements` — cover: asset copy rule (source is staging only, game references only `finalfight-AAA/public/assets/`), directory structure under `public/assets/` (organised by entity: `player/`, `enemies/`, `stage/`, `hud/`), sprite-to-entity mapping derived from the Step 2 inventory, Phaser texture key naming convention, and atlas/frame config generation
- `## Non-Functional Requirements` — cover: no asset file path in game source code may reference `itch-io-resources/`; all asset keys must be defined in a single TypeScript constants file
- `## Open Questions` — list any entities in existing requirements with no matching asset

## Step 5 — Create the sprite-provisioner skill
Produce `.ai-specs/skills/sprite-provisioner/SKILL.md` with:

Frontmatter: `name: sprite-provisioner`, `description` (trigger phrases: "provision sprites", "copy assets", "set up assets for", "prepare sprites for [subsystem]").

Instructions: acting as a Senior Asset Pipeline Engineer, this skill copies the required sprites from `itch-io-resources/streets-of-fight/Assets` into the correct subdirectory under `finalfight-AAA/public/assets/`, then generates or updates `finalfight-AAA/src/assets/AssetKeys.ts` — a TypeScript constants file that maps every Phaser texture key to its relative path under `public/assets/`. The skill must:
- Accept a subsystem name as input (player, enemy-ai, stage, hud, combat-system, or `all`)
- Copy only the assets relevant to the requested subsystem (or all assets if `all` is passed)
- Never modify or delete files under `itch-io-resources/`
- Never produce game source code that references `itch-io-resources/` paths
- After copying, output a manifest listing every file copied and its destination path
- After generating `AssetKeys.ts`, verify no key maps to a path outside `finalfight-AAA/public/assets/`

## Step 6 — Update AGENTS.md
Add the `sprite-provisioner` skill to the Skills table in `AGENTS.md` with: skill name, path (`.ai-specs/skills/sprite-provisioner/`), and invocation context (invoke before any implementer agent session that requires sprites for the target subsystem).

## Step 7 — Commit
```
feat(assets): asset audit, assets requirement, and sprite-provisioner skill
```

# Constraints
- Do not copy any assets in this session — the skill is created now; provisioning is triggered separately per subsystem before Phase 3 implementation begins
- Do not modify any existing requirement file — only surface gaps as a report; the new `assets.md` is the only new file under `finalfight-AAA/requirements/`
- Game source code and agent skill files must never contain paths referencing `itch-io-resources/`
- All commits follow Conventional Commits format

# Output format
Execute each step in order, stating the step number. Produce all file contents in full. End with a summary listing: asset inventory count by category, gaps identified in existing requirements, and the sprite-provisioner skill invocation syntax.