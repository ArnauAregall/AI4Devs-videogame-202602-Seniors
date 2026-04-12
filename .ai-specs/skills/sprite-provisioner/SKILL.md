---
name: sprite-provisioner
description: >
  Triggered by "provision sprites", "copy assets", "set up assets for",
  "prepare sprites for [subsystem]", or "run sprite-provisioner".
  Copies required sprites from the staging area into finalfight-AAA/public/assets/
  and generates or updates finalfight-AAA/src/assets/AssetKeys.ts.
---

# Sprite Provisioner Skill

## Role

You are a Senior Asset Pipeline Engineer. Your responsibility is to copy game-ready sprite assets from the staging directory into the correct location under `finalfight-AAA/public/assets/`, then generate or update the TypeScript constants file `finalfight-AAA/src/assets/AssetKeys.ts` so that every Phaser texture key maps to a verified relative path.

## Inputs

- **Subsystem name** (required): one of `player`, `enemy-ai`, `stage`, `hud`, `combat-system`, or `all`.
  - `player` — copy Brawler Girl assets only.
  - `enemy-ai` — copy Enemy Punk assets and the common shadow only.
  - `stage` — copy Stage Layers and Stage Props only.
  - `hud` — copy any HUD icon assets only (currently none; output a warning if nothing to copy).
  - `combat-system` — no dedicated assets; output a confirmation that all required assets are covered by player and enemy-ai subsystems.
  - `all` — copy all of the above.

## Source and Destination Mapping

The staging root is `itch-io-resources/streets-of-fight/Assets/`.
The destination root is `finalfight-AAA/public/assets/`.

| Subsystem | Source path (relative to staging root) | Destination path (relative to destination root) |
|---|---|---|
| player | `Spritesheets/Brawler Girl/idle.png` | `player/player-idle.png` |
| player | `Spritesheets/Brawler Girl/walk.png` | `player/player-walk.png` |
| player | `Spritesheets/Brawler Girl/jump.png` | `player/player-jump.png` |
| player | `Spritesheets/Brawler Girl/jab.png` | `player/player-jab.png` |
| player | `Spritesheets/Brawler Girl/punch.png` | `player/player-punch.png` |
| player | `Spritesheets/Brawler Girl/kick.png` | `player/player-kick.png` |
| player | `Spritesheets/Brawler Girl/jump_kick.png` | `player/player-jump-kick.png` |
| player | `Spritesheets/Brawler Girl/dive_kick.png` | `player/player-dive-kick.png` |
| player | `Spritesheets/Brawler Girl/hurt.png` | `player/player-hurt.png` |
| enemy-ai | `Spritesheets/Enemy Punk/idle.png` | `enemies/punk/punk-idle.png` |
| enemy-ai | `Spritesheets/Enemy Punk/walk.png` | `enemies/punk/punk-walk.png` |
| enemy-ai | `Spritesheets/Enemy Punk/punch.png` | `enemies/punk/punk-punch.png` |
| enemy-ai | `Spritesheets/Enemy Punk/hurt.png` | `enemies/punk/punk-hurt.png` |
| enemy-ai | `Sprites/shadow.png` | `common/common-shadow.png` |
| stage | `Stage Layers/back.png` | `stage/layers/stage-back.png` |
| stage | `Stage Layers/fore.png` | `stage/layers/stage-fore.png` |
| stage | `Stage Layers/tileset.png` | `stage/layers/stage-tileset.png` |
| stage | `Stage Layers/props/barrel.png` | `stage/props/prop-barrel.png` |
| stage | `Stage Layers/props/car.png` | `stage/props/prop-car.png` |
| stage | `Stage Layers/props/hydrant.png` | `stage/props/prop-hydrant.png` |
| stage | `Stage Layers/props/banner-hor/banner-hor1.png` | `stage/props/prop-banner-hor-1.png` |
| stage | `Stage Layers/props/banner-hor/banner-hor2.png` | `stage/props/prop-banner-hor-2.png` |
| stage | `Stage Layers/props/Ethereum/ethereum-1.png` | `stage/props/prop-ethereum-1.png` |
| stage | `Stage Layers/props/Ethereum/ethereum-2.png` | `stage/props/prop-ethereum-2.png` |
| stage | `Stage Layers/props/Sushi/sushi-1.png` | `stage/props/prop-sushi-1.png` |
| stage | `Stage Layers/props/Sushi/sushi-2.png` | `stage/props/prop-sushi-2.png` |

## Instructions

### Step 1 — Invoke prompt-logger

Append this session's invocation to `.prompts-log.md` before any other action.

### Step 2 — Validate inputs

1. Confirm that the staging root `itch-io-resources/streets-of-fight/Assets/` exists in the repository.
2. Confirm that each source file listed in the subsystem's row(s) of the mapping table exists at its source path.
3. If any source file is missing, output a WARNING listing each missing file and continue with the files that do exist; do not abort.

### Step 3 — Create destination directories

Create all required destination subdirectories under `finalfight-AAA/public/assets/` if they do not already exist. Use `mkdir -p` or equivalent.

Directories to create for `all`:
- `finalfight-AAA/public/assets/player/`
- `finalfight-AAA/public/assets/enemies/punk/`
- `finalfight-AAA/public/assets/enemies/boss/`
- `finalfight-AAA/public/assets/stage/layers/`
- `finalfight-AAA/public/assets/stage/props/`
- `finalfight-AAA/public/assets/common/`
- `finalfight-AAA/public/assets/hud/`

### Step 4 — Copy assets

For each file in the subsystem's mapping rows:

1. Copy from `<staging-root>/<source-path>` to `finalfight-AAA/public/assets/<destination-path>`.
2. If the destination file already exists, overwrite it.
3. Never modify, move, or delete any file under `itch-io-resources/`.
4. Never produce a copy command or path that references `itch-io-resources/` in any game source file.

### Step 5 — Generate or update AssetKeys.ts

Create `finalfight-AAA/src/assets/` directory if it does not exist.

Generate or fully replace `finalfight-AAA/src/assets/AssetKeys.ts` with:

1. A string-const export for every Phaser texture key, named as `ASSET_KEY_<ENTITY>_<ANIMATION>` in SCREAMING_SNAKE_CASE. Examples:
   - `export const ASSET_KEY_PLAYER_IDLE = 'player-idle';`
   - `export const ASSET_KEY_PUNK_WALK = 'punk-walk';`
   - `export const ASSET_KEY_STAGE_BACK = 'stage-back';`
   - `export const ASSET_KEY_PROP_BARREL = 'prop-barrel';`
   - `export const ASSET_KEY_COMMON_SHADOW = 'common-shadow';`

2. A companion `ASSET_PATH` record mapping each key constant to its relative path under `public/assets/`. Example:
   ```
   export const ASSET_PATH: Record<string, string> = {
     [ASSET_KEY_PLAYER_IDLE]: 'player/player-idle.png',
     ...
   };
   ```

3. A frame-config export object `ASSET_FRAME_CONFIG` mapping each spritesheet key to its `{ frameWidth, frameHeight }`. Frame dimensions must be read from the actual PNG dimensions divided by the known frame count. If dimensions cannot be determined at generation time, use placeholder comments marked with `// TODO: measure and set correct frame dimensions`.

4. Only include entries for subsystems that have been provisioned. If running for a single subsystem, append new entries to any existing `AssetKeys.ts` rather than replacing the whole file, preserving already-provisioned entries.

### Step 6 — Verify no external paths in AssetKeys.ts

After generating `AssetKeys.ts`, search its contents for any occurrence of the string `itch-io-resources`. If found, report an error and abort. This file must never reference the staging directory.

### Step 7 — Output manifest

Print a manifest in the following format:

```
=== Sprite Provisioner Manifest ===
Subsystem: <subsystem>
Date: <ISO timestamp>

Files copied (N):
  [OK]  <source-path>  →  finalfight-AAA/public/assets/<destination-path>
  [WARN] <source-path>  — source file not found, skipped

AssetKeys.ts: <created|updated>
  Keys added: <list of key constant names>
  Keys updated: <list>
  Keys unchanged: <list>

Verification: no itch-io-resources references found in AssetKeys.ts ✓
```

## Constraints

- Never modify or delete any file under `itch-io-resources/`.
- Never produce game source code or skill files that contain paths referencing `itch-io-resources/`.
- All copied filenames must be lowercase and hyphen-separated (rename during copy if source uses different casing or underscores).
- AssetKeys.ts must use strict TypeScript — no `any` types, no implicit returns.
- If a subsystem has no available assets (e.g. `hud` currently), output a clear WARNING and take no action rather than creating empty directories or stub keys.
