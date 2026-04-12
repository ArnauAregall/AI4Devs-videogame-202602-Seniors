# Role
You are a Senior Phaser 3 Game Engineer debugging a complete keyboard input failure in the Final Fight clone. The game renders correctly — welcome screen, background, and player idle sprite all work — but no keyboard input reaches the player character.

# Objective
Diagnose and fix why WASD movement and Z/X attack keys produce no response, so the player can move and attack and enemy loading can be verified.

# Context

**Current state:** The game boots fully. The welcome screen works. Clicking Start Game loads the game scene with the background and player idle sprite visible. Pressing W, A, S, D, Z, or X produces no visible response and no console errors.

**Expected key bindings:**
- W / A / S / D — player movement (up, left, down, right)
- Z — attack (punch/kick)
- X — attack (secondary)

**No console errors are present**, which means the issue is a silent wiring or registration failure, not a crash.

**Phaser 3 keyboard input failure checklist — investigate in this order:**

1. **PlayerController.update() not called from GameScene.update()** — the most common cause; if the scene's `update()` method does not call `this.playerController.update()` (or equivalent), input polling never runs
2. **Key objects never created** — `this.input.keyboard.addKey()` or `this.input.keyboard.createCursorKeys()` never called, or called but result not stored
3. **Keyboard plugin disabled** — Phaser game config has `input: { keyboard: false }` or the keyboard plugin is excluded
4. **Canvas focus** — the Phaser canvas does not have browser focus; `this.input.keyboard` exists but events are not received because the DOM element is not focused
5. **Wrong key codes** — key codes passed to `addKey()` do not match the actual keys (e.g. string `'Z'` vs `Phaser.Input.Keyboard.KeyCodes.Z`)
6. **Input consumed by the menu scene** — a previous scene (e.g. the menu) is still active and capturing all keyboard events without passing them through

**Project layout:**
- Game source: `finalfight-AAA/src/`
- Player controller: `finalfight-AAA/src/PlayerController.ts`
- Game scene: `finalfight-AAA/src/GameScene.ts` (or equivalent)
- Phaser game config: locate under `finalfight-AAA/src/`

# Steps to execute

## Step 1 — Invoke prompt-logger
Append this invocation to `.prompts-log.md` before any other action.

## Step 2 — Trace the update loop
Read `GameScene.ts`. Confirm whether the scene's `update()` method exists and whether it calls the player controller's update method. If `update()` does not call the player controller, add the call. This is the fix if confirmed as root cause.

## Step 3 — Trace key object creation
Read `PlayerController.ts`. Find where keyboard keys are created (`addKey`, `createCursorKeys`, or equivalent). Confirm the result is stored in an instance variable. Confirm those variables are read in the input-handling logic. If keys are created locally in `create()` without being stored, move them to instance variables.

## Step 4 — Check Phaser game config
Read the Phaser game config file. Confirm `input.keyboard` is not set to `false` and no input plugins are excluded. If disabled, re-enable it.

## Step 5 — Check canvas focus
Read the game bootstrap code. Confirm `this.game.canvas.setAttribute('tabindex', '1')` or equivalent focus handling is present so the canvas receives keyboard events after the scene starts. If missing, add it and call `this.game.canvas.focus()` on scene create.

## Step 6 — Check key codes
For each of the six keys (W, A, S, D, Z, X), confirm the key code used in `addKey()` matches `Phaser.Input.Keyboard.KeyCodes.[KEY]`. Replace any string literals used as key codes with the correct `KeyCodes` enum values.

## Step 7 — Check scene stack
Read the scene manager configuration. Confirm the menu scene is stopped (not paused or sleeping) when the game scene starts. A paused scene can still intercept input in Phaser 3. If the menu scene is not stopped, replace the `pause` or `sleep` call with `stop`.

## Step 8 — Verify
Open `http://localhost:8081/`, click Start Game, and confirm:
- Pressing A and D moves the player left and right
- Pressing W makes the player jump
- Pressing Z or X triggers an attack animation
- No new console errors appear

## Step 9 — Commit
```
fix(input): restore WASD movement and Z/X attack keyboard bindings
```

# Constraints
- Fix only the identified root cause — do not refactor the input system
- Do not change the key binding mappings (WASD + Z/X) unless they are confirmed wrong in the source
- All commits follow Conventional Commits format

# Output format
State each step number before executing it. At Step 2–7, state whether that check passed or failed before moving to the next. State the confirmed root cause explicitly before applying any fix. End with confirmation that all six keys respond correctly.