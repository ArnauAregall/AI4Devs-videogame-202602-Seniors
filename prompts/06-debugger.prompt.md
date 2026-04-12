
# Role
You are a Senior Phaser 3 Game Engineer and debugger working on the Final Fight clone inside Claude Code. You diagnose and fix a boot failure caused by universal asset loading errors and a subsequent runtime crash in `PlayerController.ts`.

# Objective
Diagnose the root cause of all asset loading failures and the `PlayerController.ts:225` runtime crash, fix both issues, and verify the game boots to a playable state in the browser.

# Context

**The game fails to start at `http://localhost:8081/` with two distinct problem layers:**

**Layer 1 — Universal asset loading failure (all assets, every key):**
Every single spritesheet and image key fails at the Phaser preload stage with
`Failed to process file`. Affected keys include: `loading-bg`, `player-idle`,
`player-walk`, `player-jab`, `player-jump`, `player-punch`, `player-kick`,
`player-knockdown`, `player-getup`, `player-grab`, `player-jump-kick`,
`player-special`, `player-dive-kick`, `player-hurt`, `punk-idle`, `punk-punch`,
`punk-walk`, `punk-hurt`, `stage-fore`, `stage-back`, `stage-tileset`,
`cyberpunk-layer-1` through `cyberpunk-layer-6`, all `prop-*` keys,
`cyberpunk-decorations`, `common-shadow`.

**Layer 2 — Runtime crash caused by Layer 1:**
Because no textures loaded, Phaser has no animation frames. `PlayerController.ts:225`
calls `play('player-idle')` inside `create()`, which crashes with:
`Uncaught TypeError: can't access property "duration", state.currentFrame is undefined`
Stack: `getFirstTick → startAnimation → play → PlayerController → create → GameScene`.

**Project layout:**
- Asset source (staging, read-only): `itch-io-resources/`
- Asset destination (game, must be only reference): `finalfight-AAA/public/assets/`
- Asset key registry: `finalfight-AAA/src/assets/AssetKeys.ts`
- Preload scene (where `this.load.spritesheet()` / `this.load.image()` calls live): locate under `finalfight-AAA/src/`
- Player controller: `finalfight-AAA/src/PlayerController.ts`, line 225

**Available skills:** `prompt-logger`, `sprite-provisioner` (`.ai-specs/skills/sprite-provisioner/SKILL.md`)

# Steps to execute

## Step 1 — Invoke prompt-logger
Append this session's invocation to `.prompts-log.md` before any other action.

## Step 2 — Audit actual files on disk
List the full contents of `finalfight-AAA/public/assets/` recursively. Produce a flat
inventory of every file present (path + filename). If the directory is empty or missing,
note it explicitly — this is the primary suspect.

## Step 3 — Audit the preload scene
Read the Phaser preload scene source file. Extract every `this.load.image()`,
`this.load.spritesheet()`, and `this.load.atlas()` call. For each call, record:
- The key string used
- The path string passed as the URL argument

## Step 4 — Audit AssetKeys.ts
Read `finalfight-AAA/src/assets/AssetKeys.ts`. List every exported key constant and
the path value it maps to.

## Step 5 — Cross-reference and identify the root cause
Compare the three inventories from Steps 2, 3, and 4:
- Are the path values in Step 3 and Step 4 consistent with each other?
- Do those paths resolve to files that actually exist on disk (Step 2)?
- Are the filenames and extensions an exact match (case-sensitive)?
Identify the specific mismatch type: missing files, wrong paths, wrong filenames,
wrong directory structure, or the `sprite-provisioner` skill never ran.

## Step 6 — Fix asset availability
If files are missing from `finalfight-AAA/public/assets/`:
Load and invoke the `sprite-provisioner` skill with input `all` to copy all required
assets from `itch-io-resources/` into the correct subdirectories under
`finalfight-AAA/public/assets/` and update `AssetKeys.ts`.

If files exist but paths are wrong in the preload scene or `AssetKeys.ts`:
Correct the path strings in the preload scene and `AssetKeys.ts` to match the actual
file locations on disk. Do not move or rename the asset files — fix the code.

## Step 7 — Fix PlayerController.ts:225
Add a null guard before the `play()` call at line 225 to prevent the crash when a
texture is not found. The guard must: check that the animation key exists in
`this.scene.anims.anims` before calling `play()`; if the key is not found, log a
warning with the missing key name and skip the call rather than throwing.
This is a defensive fix only — the root cause is the asset loading failure in Steps 2–6.

## Step 8 — Verify
Run `npm run dev` inside `finalfight-AAA/`. Open `http://localhost:8081/` and confirm:
- Zero `Failed to process file` errors in the console
- Zero `Texture not found` errors
- No `TypeError` crash at `PlayerController.ts`
- The Phaser canvas renders and the game loop starts

## Step 9 — Commit
```
fix(assets): resolve universal asset loading failure and PlayerController crash
```

# Constraints
- Do not move or rename files under `itch-io-resources/` — it is a read-only staging area
- Do not hardcode asset paths in game source — all paths must go through `AssetKeys.ts`
- The null guard in Step 7 is temporary defensive code; the real fix is correct asset loading
- Fix only what the console errors identify — do not refactor unrelated code
- All commits follow Conventional Commits format

# Output format
State each step number before executing it. For Steps 2–4 produce the full inventory/audit output. For Step 5 state the exact root cause in one sentence before proceeding to the fix. For Step 8 confirm zero errors or list any remaining errors with their fix.