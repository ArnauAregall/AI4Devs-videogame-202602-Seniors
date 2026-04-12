# Role
You are a senior software engineering orchestrator running inside Claude Code.

# Objective
Audit the newly added `itch-io-resources/cyberpunk-platformer-worldstarter` asset directory, cross-reference it against the 9 missing asset categories identified in the previous sprite-provisioner run, copy any matches into `finalfight-AAA/public/assets/`, update `AssetKeys.ts` and `finalfight-AAA/requirements/assets.md` accordingly, and report remaining gaps.

# Context

**Previously completed:** The sprite-provisioner skill was run against `itch-io-resources/streets-of-fight/Assets`. It identified 9 missing asset categories across the subsystems: player, enemy-ai, boss, HUD, and item-pickup. Those gaps were recorded as Open Questions in `finalfight-AAA/requirements/assets.md`.

**New asset source:** A second free-to-use sprite pack has been added at `itch-io-resources/cyberpunk-platformer-worldstarter`. It must be treated as a staging area — game code and agents must never reference it directly. Any assets used by the game must be copied into `finalfight-AAA/public/assets/`.

**Copy rule (non-negotiable):** Both `itch-io-resources/` directories are staging only. All game source code and skill files reference exclusively paths under `finalfight-AAA/public/assets/`. No path to `itch-io-resources/` may appear in any game file, asset key, or skill output.

# Steps to execute

## Step 1 — Invoke prompt-logger
Append this session's invocation to `.prompts-log.md` before any other action.

## Step 2 — Re-read the known gaps
Read `finalfight-AAA/requirements/assets.md`. Extract the full list of Open Questions — specifically the 9 missing asset categories and which subsystem each belongs to. This is the checklist this session must resolve.

## Step 3 — Audit the new asset source
Recursively inspect `itch-io-resources/cyberpunk-platformer-worldstarter`. Produce a structured inventory:
- Directory tree with all files listed
- For each file: name, type (spritesheet, single frame, tileset, background layer, UI element, audio, etc.), and inferred game entity
- For each of the 9 known gaps: explicitly state whether this new pack contains a usable match, a partial match, or no match

## Step 4 — Provision matched assets
For each known gap that has a usable or partial match in the new pack, invoke the `sprite-provisioner` skill (`.ai-specs/skills/sprite-provisioner/SKILL.md`) to:
- Copy the matched files from `itch-io-resources/cyberpunk-platformer-worldstarter` into the correct subdirectory under `finalfight-AAA/public/assets/` (organised by entity: `player/`, `enemies/`, `boss/`, `hud/`, `items/`)
- Add the new entries to `finalfight-AAA/src/assets/AssetKeys.ts` without removing or modifying existing keys
- Output a copy manifest listing every file copied and its destination

For partial matches, copy the asset and flag it as `status: partial — may require additional frames or animation states` in the manifest.

## Step 5 — Update assets.md
In `finalfight-AAA/requirements/assets.md`, update the Open Questions section:
- Mark each gap that has been resolved (fully or partially) with its provisioned asset path
- Retain any gaps that remain unresolved with a note that neither asset pack covers them
- If partial matches were copied, add a new NFR noting the limitation

## Step 6 — Verify AssetKeys.ts integrity
After all copies and updates, verify:
- No key in `AssetKeys.ts` maps to a path outside `finalfight-AAA/public/assets/`
- No duplicate keys exist
- Every file copied in Step 4 has a corresponding key

## Step 7 — Commit
```
feat(assets): provision missing asset categories from cyberpunk-platformer-worldstarter
```

# Constraints
- Do not modify any files under either `itch-io-resources/` directory
- Do not alter existing asset keys in `AssetKeys.ts` — only append
- Do not modify any requirement file other than `finalfight-AAA/requirements/assets.md`
- Do not provision assets that do not address one of the 9 known gaps — do not bulk-copy the entire new pack
- All commits follow Conventional Commits format

# Output format
Execute each step in order, stating the step number. End with a resolution summary table:

| Gap # | Subsystem | Category | Status | Provisioned path |
|-------|-----------|----------|--------|-----------------|
| 1 | player | … | Resolved / Partial / Still missing | … |
…

List any still-missing categories explicitly so the human operator knows what requires manual sourcing or a design decision.