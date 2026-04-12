# Role
You are a Senior Phaser 3 Game Engineer fixing five gameplay bugs and one broken stage progression gate in the Final Fight clone, covering the full integration chain between barrels, enemies, combat, and stage advancement.

# Objective
Fix barrel passthrough, barrel dual-state rendering, punk knockback bounds, the ambiguous double-punk spawn, and the stage progression lock that blocks the player after clearing enemies — then verify the full integration between all affected systems.

# Context

**Current state:** The player can walk through the full stage. Barrels and punk enemies appear and interact with combat. Six bugs remain across props, enemies, and stage flow:

**Bug 1 — Barrels block player movement:**
Barrels have a physics body that collides with the player. Barrels must be walkable — the player moves through them freely. Only combat overlap should interact with barrels.

**Bug 2 — Both barrel sprite states visible simultaneously:**
The healthy and crushed barrel sprites render at the same time. Only one state should be visible. Barrels take 3 hits to destroy. Health item drop on destruction is deferred — do not implement.

**Bug 3 — Punks launch vertically off-screen when hit:**
Knockback applies excessive upward velocity, sending punks out of the world through the top edge. Knockback must be horizontal only (or with a small bounded arc) and enemies must be constrained by world bounds vertically.

**Bug 4 — Two punk sprites appear that may or may not be duplicates:**
Two punk sprites appear simultaneously at or near the same spawn zone. Before applying any fix, this must be confirmed: are these two genuinely different punks from the same spawn zone (correct behaviour, two enemies intended), or is it a single punk instantiated twice (bug)? Read the spawn zone data for the relevant zone and the enemy manager spawn call to determine the intended enemy count. Report the finding explicitly before deciding whether to fix it.

**Bug 5 — Player blocked after clearing punks, unable to advance:**
After all punks in a wave are defeated, the player hits an invisible wall and cannot proceed further right. This is a beat-'em-up stage gate: the stage should only unlock rightward progression once all enemies in a zone are cleared. The gate is triggering correctly on enemy spawn but is not releasing when enemies are defeated. The player must be able to advance once the enemy count for the current zone reaches zero.

**Integration chain that must work end-to-end:**
```
Player hits punk
  → CombatSystem applies damage + horizontal knockback
  → EnemyAI receives damage, plays hurt animation
  → On death: EnemyManager decrements active enemy count for current zone
    → If count reaches zero: StageManager / zone gate unlocks rightward progression
      → World bounds right edge extends to next zone boundary
        → Player can advance
```

**Project layout:**
- Game source: `finalfight-AAA/src/`
- Barrel logic: `Barrel.ts` or `PropManager.ts`
- Enemy manager and spawn zones: the file managing zone triggers and enemy counts
- Combat / knockback: `CombatSystem.ts` or equivalent
- Stage gate / progression: the file that locks and unlocks rightward movement per zone

# Steps to execute

## Step 1 — Invoke prompt-logger
Append this invocation to `.prompts-log.md` before any other action.

## Step 2 — Fix Bug 1: barrel passthrough
Replace `physics.add.collider(player, barrels)` with `physics.add.overlap(player, barrels)` or set barrel bodies as sensors. The player must move through barrels without physical resistance.

## Step 3 — Fix Bug 2: barrel dual-state and 3-hit destruction
On barrel creation set `healthySprite.setVisible(true)` and `crushedSprite.setVisible(false)`. Implement a hit counter (0 to 3). On the third hit: swap visibility, then destroy the barrel object after a short delay. Do not implement the health drop.

## Step 4 — Fix Bug 3: punk vertical knockback
Set the Y-axis knockback velocity to zero or cap it at a maximum of −60 pixels/second. Confirm `setWorldBounds` passes `true` for the top boundary check. Confirm enemy physics bodies have gravity enabled.

## Step 5 — Investigate and resolve Bug 4: confirm punk identity before fixing
Read the spawn zone data for the zone where two punks appear. Check the intended enemy count for that zone. Read the enemy manager spawn call to see how many instances are created per invocation.

**If two punks are intended:** Do not fix — this is correct behaviour. Document the finding.

**If only one punk is intended:** Locate the duplicate instantiation (double spawn call, double group registration, or double constructor body creation) and remove it so exactly one punk is created per spawn event.

State the finding explicitly before taking any action.

## Step 6 — Fix Bug 5: stage gate not releasing after enemy clear
Read the enemy manager death handler. Confirm it decrements a per-zone active enemy counter. Confirm the counter reaching zero triggers a stage gate release. Trace what the gate release does: it must extend or update the physics world right bound and camera right bound to the next zone's boundary.

Fix the broken link in this chain. Common failure points:
- Death handler fires but does not decrement the counter (event not wired)
- Counter decrements correctly but the zero-check never fires the gate release
- Gate release fires but updates the camera bound without updating the physics world bound (or vice versa), leaving an invisible wall
- Gate release uses a stale zone reference and unlocks the wrong boundary

After fixing, confirm the full chain: enemy death → counter zero → gate release → world bound extended → player can walk right.

## Step 7 — Integration smoke test
Run `npm run dev`, open `http://localhost:8081/`, and walk through the following sequence:
- Player walks past barrels without being blocked
- Player hits a barrel 3 times: sprite switches to crushed, barrel disappears on third hit
- Punk enemies spawn; player hits a punk: punk takes horizontal knockback, stays on the ground, no vertical exit
- All punks in the zone are defeated: the stage gate releases and the player can advance right
- Player reaches the next zone

## Step 8 — Commit
```
fix(gameplay): barrel passthrough, states, knockback bounds, punk identity, stage gate release
```

# Constraints
- Do not implement barrel health item drop — deferred
- Do not change spawn zone enemy counts unless Bug 4 confirms a duplicate instantiation
- Do not alter player movement speed or physics body
- Gate release must update both physics world bounds and camera bounds together — never one without the other
- All commits follow Conventional Commits format

# Output format
State each step number before executing it. At Step 5 state explicitly: "CONFIRMED DUPLICATE — fixing" or "CONFIRMED TWO SEPARATE PUNKS — no fix applied". At Step 6 state which link in the integration chain was broken. End with the smoke test result confirming all five behaviours pass.