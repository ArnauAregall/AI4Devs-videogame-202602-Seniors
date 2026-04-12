# Stage — Functional Requirements

## Overview

The stage subsystem defines the scrollable environment through which the player progresses, including camera movement, layered visual backgrounds, enemy spawn management, interactive props, and the conditions that advance the game to the next stage. It is the container within which all gameplay takes place.

## Functional Requirements

FR-ST-01: The stage must scroll horizontally — the camera advances to the right as the player moves forward, and must not scroll backward.
FR-ST-02: The camera must not advance past a scroll trigger boundary until all enemies within the current combat zone have been defeated.
FR-ST-03: A scroll trigger boundary is an invisible vertical line at a defined horizontal position in the stage; when the player reaches it, the camera locks and enemies in the associated spawn zone begin spawning.
FR-ST-04: The stage background must use a minimum of three parallax layers, each scrolling at a different speed relative to the camera, with the rearmost layer scrolling slowest.
FR-ST-05: Each parallax layer must tile seamlessly — no visible seam when the layer repeats horizontally.
FR-ST-06: The walkable ground plane must be a defined vertical band within the stage, with a minimum and maximum Y coordinate; the player and enemies may not move outside this band.
FR-ST-07: Each stage must define one or more enemy spawn zones; each zone specifies the enemy archetypes to spawn, the number of enemies, and the spawn trigger (scroll trigger or timed after entering zone).
FR-ST-08: Enemies in a spawn zone must not all appear at once; they must enter the screen from the right edge or from off-screen positions, staggered by a defined delay between each spawn.
FR-ST-09: The stage must contain at least two types of destructible props (e.g. barrels, crates); the player can destroy these by attacking them.
FR-ST-10: When a destructible prop is destroyed, it must play a destruction animation and optionally reveal an item pickup that the player can collect.
FR-ST-11: The stage clear condition is met when the player has defeated all enemies in all spawn zones within the stage and has reached the end of the stage's horizontal extent.
FR-ST-12: When the stage clear condition is met, the camera must stop scrolling, the stage clear sequence must play, and the game must transition to the next stage or to the end screen if no further stages exist.
FR-ST-13: Stage data (scroll trigger positions, spawn zone definitions, parallax layer speeds, prop positions) must be defined in a data file or configuration object, not hardcoded inside scene logic.
FR-ST-14: The stage must define left and right boundary walls that neither the player nor enemies may pass through.
FR-ST-15: If the player walks into an item pickup on the ground plane, the item must be collected immediately and its effect applied.

## Non-Functional Requirements

NFR-ST-01: Parallax scrolling must not cause any visible tearing or layer desynchronisation at 60 fps.
NFR-ST-02: The camera scroll and lock logic must execute within the fixed-timestep update, not the render step, to remain frame-rate independent.
NFR-ST-03: The stage must support at least 5000 pixels of horizontal extent without performance degradation.
NFR-ST-04: Destructible props must complete their destruction animation within 500 ms.

## Open Questions

- How many stages are in scope for the initial release?
- Are stage transitions animated (e.g. a wipe or fade), or instant?
- Should item pickups remain on screen indefinitely or despawn after a time limit?
- Are there any vertical elements to the stage (e.g. stairs, elevation changes that affect combat)?
- Should the stage data format be JSON, TypeScript constants, or a Tiled map file?
- Are there mid-stage boss encounters that lock the camera at a specific point before a sub-boss appears?
