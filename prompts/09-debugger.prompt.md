# Role
You are a Senior Phaser 3 Game Engineer debugging three independent stage and enemy issues in the Final Fight clone.

# Objective
Diagnose and fix the stage scroll speed mismatch, the background going black after scrolling, and the `unknown enemy type undefined` error that prevents any enemy from spawning.

# Context

**Current state:** The game boots, the player moves and attacks correctly. Three new issues appear when moving right:

**Bug 1 — Scroll speed mismatch:** When the player moves right, the background and stage objects scroll at a faster rate than the player character moves. The player effectively falls behind the moving scene.

**Bug 2 — Background turns black:** After scrolling a distance, the background becomes completely black. The parallax layers stop rendering.

**Bug 3 — Unknown enemy type undefined / no enemies spawn:** The console logs `unknown enemy type undefined` from the enemy manager. No enemy sprite appears at any point in the stage. The enemy type value reaching the spawn logic is `undefined`.

**Project layout:**
- Game source: `finalfight-AAA/src/`
- Stage / scroll logic: locate under `finalfight-AAA/src/` (likely `Stage.ts` or `StageManager.ts`)
- Parallax background: locate under `finalfight-AAA/src/`
- Enemy manager: the file that logs `unknown enemy type undefined`
- Spawn zone / stage data: the config or data file that defines enemy spawn zones

# Steps to execute

## Step 1 — Invoke prompt-logger
Append this invocation to `.prompts-log.md` before any other action.

## Step 2 — Fix Bug 1: scroll speed mismatch
Read the stage scroll or camera follow logic. Identify where the scroll offset or camera position is updated relative to player movement. Common causes:
- The scroll speed is a hardcoded constant instead of being derived from the player's actual velocity or position delta
- The camera is following both the player movement and an independent auto-scroll simultaneously, doubling the effective speed
- The parallax multiplier is applied to the wrong reference value

Correct the scroll logic so the stage advances only in response to the player's actual position, at the same rate the player moves.

## Step 3 — Fix Bug 2: background goes black
Read the parallax background implementation. Identify how each layer is rendered and how far it extends. Common causes:
- The background images have a finite pixel width and the camera scrolls past their right edge with no tiling
- `setScrollFactor` is set to a non-zero value on a non-tiling image, causing it to scroll off screen
- World bounds are smaller than the full stage scroll range, clipping the background

Fix by ensuring all parallax background layers either tile infinitely (`tileSprite` or equivalent) or are wide enough to cover the full scrollable world width. Confirm `setScrollFactor` values are correct for each layer depth.

## Step 4 — Fix Bug 3: unknown enemy type undefined
Read the enemy manager source file — specifically the function that logs `unknown enemy type undefined`. Identify the property name it expects on the spawn config object (e.g. `type`, `enemyType`, `kind`).

Then read the stage spawn zone data (config file, JSON, or inline data). Find the property name used there for the enemy type. Compare the two: if the property names do not match exactly, align them. If the spawn zone data is missing the property entirely, add the correct enemy type identifier to each spawn zone entry.

After fixing the mismatch, confirm the enemy type string passed to the manager matches one of its known/registered types. If registered type keys differ from what the spawn data provides, update the registration or the data to be consistent.

## Step 5 — Verify
Open `http://localhost:8081/`, start the game, and confirm:
- Moving right advances the player through the stage at a consistent pace with no scroll lag or over-scroll
- The background parallax layers remain visible across the full width of the stage without going black
- At least one enemy spawns when the player reaches a spawn zone
- No `unknown enemy type` errors appear in the console

## Step 6 — Commit
```
fix(stage): correct scroll speed, parallax bounds, and enemy spawn type mismatch
```

# Constraints
- Fix only the three identified bugs — do not refactor stage, camera, or enemy systems
- Do not change spawn zone positions, only the data property names if mismatched
- All commits follow Conventional Commits format

# Output format
State each step number before executing it. For each bug, state the confirmed root cause in one sentence before applying the fix. End with confirmation that all three issues are resolved.