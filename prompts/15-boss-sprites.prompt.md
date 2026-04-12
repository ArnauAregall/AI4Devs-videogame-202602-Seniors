# Role
You are a Senior Asset Pipeline Engineer working on the Final Fight clone inside Claude Code.

# Objective
Invoke the `sprite-provisioner` skill to copy and register the Brute Arms boss sprites into the game, then update all source files that currently reference punk enemy sprites for the boss to use the correct boss asset keys instead.

# Context

**New asset source (staging — read-only, never reference in game code):**
- `itch-io-resources/brute-arms-boss/sprite_individuals/` — individual frame images
- `itch-io-resources/brute-arms-boss/sprite_sheet/` — spritesheet(s)

**Current problem:** The boss enemy is using punk enemy sprite keys. All boss-related code must reference dedicated boss asset keys after this session.

**Asset destination:** `finalfight-AAA/public/assets/boss/`

**Key registry:** `finalfight-AAA/src/assets/AssetKeys.ts` — append new boss keys, do not modify existing keys.

**Copy rule (non-negotiable):** No path referencing `itch-io-resources/` may appear in any game source file, asset key, or skill output after this session.

# Steps to execute

## Step 1 — Invoke prompt-logger
Append this invocation to `.prompts-log.md` before any other action.

## Step 2 — Audit the new asset source
Recursively inspect both `itch-io-resources/brute-arms-boss/sprite_individuals/` and `itch-io-resources/brute-arms-boss/sprite_sheet/`. Produce an inventory listing every file with its name, type (individual frame or spritesheet), and inferred animation state (idle, walk, attack, hurt, death, etc.).

## Step 3 — Invoke the sprite-provisioner skill
Load `.ai-specs/skills/sprite-provisioner/SKILL.md` and invoke it with `boss` as the target subsystem. The skill must:
- Copy all files from both source directories into `finalfight-AAA/public/assets/boss/`
- Append one `AssetKey` constant per asset to `finalfight-AAA/src/assets/AssetKeys.ts` using the naming convention `boss-[state]` (e.g. `boss-idle`, `boss-walk`, `boss-attack`, `boss-hurt`, `boss-death`)
- Output a copy manifest listing every file copied and its destination path

## Step 4 — Audit boss references in game source
Search all files under `finalfight-AAA/src/` for any reference to punk asset keys (`punk-idle`, `punk-walk`, `punk-punch`, `punk-hurt`, or any other `punk-*` key) that appear in boss-related classes, constructors, or configuration. Identify every location where the boss is using punk sprite keys.

## Step 5 — Replace punk keys with boss keys
For each location found in Step 4, replace the punk asset key with the corresponding new boss asset key from `AssetKeys.ts`. Ensure the spritesheet frame dimensions (`frameWidth`, `frameHeight`) in the preload scene are updated to match the actual dimensions of the boss sprite sheets, not the punk sheets.

## Step 6 — Verify AssetKeys.ts integrity
Confirm:
- No new boss key maps to a path outside `finalfight-AAA/public/assets/boss/`
- No duplicate keys were introduced
- No `itch-io-resources/` path appears anywhere in game source files

## Step 7 — Commit
```
feat(assets): provision Brute Arms boss sprites and replace punk key references
```

# Constraints
- Do not modify or delete any existing asset keys in `AssetKeys.ts`
- Do not move or rename files under `itch-io-resources/`
- Do not alter boss AI behaviour or combat logic — only asset key references change
- All commits follow Conventional Commits format

# Output format
State each step number before executing it. At Step 2 produce the full inventory. At Step 4 list every file and line where punk keys are used for the boss. At Step 5 show a before/after table of replaced keys. End with confirmation that no `itch-io-resources/` references exist in game source.