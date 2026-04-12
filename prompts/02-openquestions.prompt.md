# Role

You are a game designer defining the core mechanics and scope of a 2D beat 'em up game inspired by classics like Streets of Rage and Final Fight. Your task is to make key design decisions that will shape the player experience, combat system, enemy behavior, stage structure, and overall game flow. The decisions you make will directly impact the development effort required in Phase 2, so consider both creative vision and practical constraints.


# Context

Answering the open questions:

```
  Open questions surfaced (require human decisions before Phase 2)

  Architecture-level
  - How many playable characters / is there a character select screen?
  - How many stages in scope for initial release?
  - Is there a time limit per stage?

  Combat / Player
  - Exact HP max and default lives count
  - Does the Special Attack have a cooldown or is it purely health-gated?
  - Should combo hits deal diminishing damage returns?
  - Is hit stun duration scaled by combo count?

  Enemy AI
  - Is there a boss archetype per stage with phase transitions?
  - Can enemies drop health pickups, or only point items?
  - Should the Knife Thrower's projectile be deflectable?

  Stage
  - Stage data format: JSON, TypeScript constants, or Tiled map?
  - Do item pickups despawn after a time limit?

  HUD
  - Are continues limited in number?
  - Is there a high score leaderboard with name entry?
```

Architecture-level:
- Single playable character, character select screen not needed for initial release.
- Three stages in scope for initial release.
- Yes, there is a time limit of 3 minutes per stage.

Combat / Player:
- HP max is 100, default lives count is 3.
- The Special Attack has a cooldown of 10 seconds after use.
- Combo hits deal diminishing damage returns, with a 10% reduction per additional hit after the first.
- Hit stun duration is scaled by combo count.

Enemy AI:
- Yes, there is a boss archetype for each stage with phase transitions at 50% and 25% HP.
- Enemies can drop health pickups as well as point items.
- The Knife Thrower's projectile is deflectable by the player's melee attack.


Stage:
- Don't have a strong opinion, use whichever is most efficient for development using Phaser framework.
- Yes, item pickups despawn after 15 seconds if not collected.

HUD:
- Continues are limited to 3 per player.
- Yes, there is a high score leaderboard with name entry, storing the top 10 scores


# Outcome

Adapt project requierments based on the answers. Adapt as well `.ai-agents` if needed. Commit the changes to the repo and update the project plan for Phase 2 accordingly.