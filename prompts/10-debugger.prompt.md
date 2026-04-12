# Role
You are a Senior Phaser 3 Game Engineer debugging two related world bounds and camera boundary issues in the Final Fight clone.

# Objective
Diagnose and fix an invisible right-side collision wall that blocks the player from advancing through the stage, and a missing left boundary that lets the player walk off-screen.

# Context

**Current state:** Player movement and background scrolling are working correctly. Two boundary bugs remain:

**Bug 1 — Invisible right wall:** After moving right for approximately 4–5 seconds of gameplay, the player stops as if hitting a wall. There is no visible sprite for this wall. The player can still move up and down, and can move left away from it, but cannot advance further right. This is blocking all stage progression.

**Bug 2 — Missing left boundary:** The player can walk left past the left edge of the screen and go off-canvas entirely. Moving right brings the player back, but no boundary prevents exiting left. The player should not be able to move left of the stage start position (x = 0).

**Likely root causes to investigate:**
- Phaser Arcade Physics world bounds set to the initial viewport width rather than the full stage scroll width — creating an invisible right wall at exactly the viewport edge
- Camera bounds not matching the full stage world width, causing the camera to stop following the player before the stage ends
- A static physics group or collider object placed at a fixed x position with no visible sprite (invisible wall body)
- Left bound of the physics world set incorrectly or absent, allowing the player to exit the left edge
- Mismatch between the stage's intended total scrollable width and the value used to configure world bounds

**Project layout:**
- Game source: `finalfight-AAA/src/`
- Stage / world setup: locate under `finalfight-AAA/src/` (likely `Stage.ts`, `StageManager.ts`, or `GameScene.ts`)
- Physics config: the `physics.arcade.debug` setting and world bounds configuration
- Camera config: `this.cameras.main.setBounds()` call

# Steps to execute

## Step 1 — Invoke prompt-logger
Append this invocation to `.prompts-log.md` before any other action.

## Step 2 — Enable physics debug overlay
Temporarily set `physics.arcade.debug: true` in the Phaser game config and reload. This renders all physics bodies as coloured outlines, making the invisible wall body visible. Note the x position where the blocking body appears and whether it matches the viewport width or another known value.

## Step 3 — Audit world bounds configuration
Search all source files for `setWorldBounds`, `setBounds`, and `world.bounds`. For each call, record: the x, y, width, and height values passed. Compare the width value against the intended full stage scroll length. If world bounds width equals the viewport width (e.g. 1280) instead of the full stage width, that is the right wall bug — update it to the correct total stage width.

## Step 4 — Audit camera bounds
Search all source files for `cameras.main.setBounds`. Compare the bounds width against the physics world width from Step 3. Both must equal the full stage scroll width. If the camera bounds are narrower than the world, the camera stops following the player before the stage ends — correct the camera bounds to match the world width.

## Step 5 — Audit for invisible static bodies
Search all source files for static physics groups, `staticGroup`, `staticBody`, or `addStaticImage` calls. Identify any that have no corresponding visible sprite or have `setVisible(false)` called on them. If any static body is positioned at approximately the x coordinate where the wall was observed in Step 2, remove it or correct its position.

## Step 6 — Fix the left boundary
Confirm that `setWorldBounds` includes `true` for the left, right, top, and bottom collision flags (the 5th–8th arguments in Phaser 3: `setWorldBounds(x, y, width, height, checkLeft, checkRight, checkUp, checkDown)`). Ensure `checkLeft: true` so the player cannot exit the left edge. Set the left bound to x = 0.

## Step 7 — Disable physics debug and verify
Remove `physics.arcade.debug: true`. Run `npm run dev`, open `http://localhost:8081/`, start the game, and confirm:
- The player can move right continuously through the full stage without hitting any invisible wall
- The player cannot walk left past x = 0 (left edge of the stage)
- The camera follows the player across the full stage width
- Background continues rendering across the full scroll distance

## Step 8 — Commit
```
fix(stage): correct world bounds and camera bounds to full stage width; enforce left boundary
```

# Constraints
- Do not change player movement speed or camera follow settings unrelated to bounds
- Do not remove any visible colliders or physics bodies that have associated sprites
- Disable physics debug mode before committing
- All commits follow Conventional Commits format

# Output format
State each step number before executing it. At Step 2, describe what the debug overlay reveals. At Step 3 and 4, state the incorrect value found and the corrected value. End with confirmation that the player traverses the full stage width without obstruction and cannot exit left.