# Role
You are a Senior Phaser 3 Game Engineer debugging three distinct rendering issues in the Final Fight clone. The game now boots and reaches the game screen, but sprites are invisible, the enemy spritesheets have wrong frame dimensions, and the canvas renders at the wrong resolution.

# Objective
Diagnose and fix all three active issues — wrong spritesheet frame dimensions for punk enemies, invisible player and enemy sprites, and incorrect canvas resolution — so the game renders at the correct scale with all sprites visible.

# Context

**Current state:** The game boots, the start screen appears, the HUD is visible with numbers, but the player sprite and enemy sprites are not visible. The canvas/HUD renders at noticeably low resolution.

**Console errors to fix:**

```
18:16:52.588 Failed to process file: image "loading-bg"
18:16:52.630 SpriteSheet frame dimensions will result in zero frames for texture: punk-idle
18:16:52.631 SpriteSheet frame dimensions will result in zero frames for texture: punk-walk
18:16:52.631 SpriteSheet frame dimensions will result in zero frames for texture: punk-punch
18:16:52.631 SpriteSheet frame dimensions will result in zero frames for texture: punk-hurt
```

**Three independent problems:**

**Problem A — `loading-bg` still missing:** One image file was not resolved by the previous fix. Its path or filename is still incorrect.

**Problem B — Punk spritesheet zero frames:** The four `punk-*` textures loaded successfully (no "Failed to process file" for them), but Phaser reports zero frames. This means the image file exists and is valid, but the `frameWidth` and/or `frameHeight` values passed to `this.load.spritesheet()` do not match the actual pixel dimensions of the sprite cells in those files.

**Problem C — Player and enemies invisible, low resolution canvas:** No texture errors appear for player sprites, so they loaded. Invisibility is caused by one or more of: wrong position (spawned off-screen), wrong camera configuration, incorrect game canvas `width`/`height` in the Phaser game config, wrong `resolution` or `zoom` setting, or objects being created at depth/layer that places them behind the background.

**Project layout:**
- Game source: `finalfight-AAA/src/`
- Asset keys: `finalfight-AAA/src/assets/AssetKeys.ts`
- Assets on disk: `finalfight-AAA/public/assets/`
- Phaser game config: locate under `finalfight-AAA/src/`

# Steps to execute

## Step 1 — Invoke prompt-logger
Append this invocation to `.prompts-log.md` before any other action.

## Step 2 — Fix Problem A: loading-bg
Locate the `this.load.image('loading-bg', ...)` call. Find the actual file under
`finalfight-AAA/public/assets/` that is intended as the loading background. Correct
the path in the preload call and in `AssetKeys.ts` to match the real filename and
directory exactly (case-sensitive).

## Step 3 — Fix Problem B: punk spritesheet frame dimensions
For each of the four punk spritesheets (`punk-idle`, `punk-walk`, `punk-punch`,
`punk-hurt`):
1. Find the actual image file under `finalfight-AAA/public/assets/`
2. Read its pixel dimensions (width × height)
3. Count the number of animation frames visually present in the sheet (columns × rows)
4. Calculate the correct `frameWidth` = total width ÷ columns, `frameHeight` = total
   height ÷ rows
5. Update the `this.load.spritesheet()` call with the correct `frameWidth` and
   `frameHeight` values
6. If the frame count implies a different number of animation frames than what the
   animation definition currently uses, update the animation `end` frame index to match

## Step 4 — Fix Problem C: invisible sprites and resolution
Investigate in this order, stopping at the first confirmed root cause:

**4a — Canvas resolution:** Read the Phaser game config. Check `width`, `height`,
`resolution`, and `scale` properties. The canvas must match the intended game
resolution (e.g. 1280×720 or equivalent). If `resolution` is set to a value below 1
or `zoom` is incorrectly set, correct it.

**4b — Player spawn position:** Read the player creation code. Log or check the x/y
coordinates where the player is instantiated. If the spawn point is outside the
camera bounds or canvas dimensions, correct it to a visible position (e.g. centre
of the stage at ground level).

**4c — Camera configuration:** Check whether `this.cameras.main` has a scroll, zoom,
or bounds setting that excludes the area where the player and enemies are spawned.
Correct any camera bounds or scroll offset that would hide game objects.

**4d — Depth/layer ordering:** Check the `depth` or `setDepth()` values on the
player, enemies, and background. If the background has a higher depth than the
sprites, bring the sprites to the correct depth above the background layer.

## Step 5 — Verify
Run `npm run dev` inside `finalfight-AAA/`. Open `http://localhost:8081/`, click
start, and confirm:
- Zero `Failed to process file` errors
- Zero `SpriteSheet frame dimensions will result in zero frames` warnings
- Player sprite is visible at the correct size and position
- At least one punk enemy is visible
- The canvas renders at the correct resolution without blurriness

## Step 6 — Commit
```
fix(rendering): correct punk frame dimensions, loading-bg path, and canvas resolution
```

# Constraints
- Fix only what the console errors and observations identify — do not refactor unrelated code
- Do not alter asset filenames or move files under `finalfight-AAA/public/assets/`
- All path corrections must go through `AssetKeys.ts` — no hardcoded strings in scene files
- All commits follow Conventional Commits format

# Output format
State each step number before executing it. For Step 3, show the calculated frameWidth and frameHeight for each punk sheet. For Step 4, state which root cause was confirmed before applying the fix. End with a confirmation that all five console issues are resolved.