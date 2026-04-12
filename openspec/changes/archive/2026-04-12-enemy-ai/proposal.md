## Why

Player and stage subsystems are complete, and the combat engine is wired. The game world is empty: no non-player combatants exist, so there is nothing to fight. Without enemy AI the core gameplay loop — patrol, detection, aggro, attack, take damage, die — cannot function.

## What Changes

- Introduce `EnemyConfig`: all named constants for every enemy parameter (HP, speed, damage, ranges, drop weights, combo limits, boss thresholds).
- Introduce `EnemyState` enum: seven states shared by all archetypes (Idle, Patrol, Aggro, Attack, Hurt, Knockdown, Death).
- Introduce `EnemyStateMachine`: validates legal transitions, fires enter/exit hooks.
- Introduce `EnemyController`: abstract base class providing patrol-bounce, aggro movement, hurt interrupt, knockdown accumulation, death sequencing, CombatSystem hurtbox/hitbox registration.
- Introduce `BrawlerController`: Archetype A — medium speed, patrol, heavy-punch attack.
- Introduce `RusherController`: Archetype B — stationary until aggro radius, then charge + flurry.
- Introduce `KnifeThrowerController`: Archetype C — maintains preferred distance, throws `KnifeProjectile`; if the projectile is deflected, it deals full damage back to the thrower.
- Introduce `KnifeProjectile`: Phaser game object travelling at fixed velocity; a player melee hit sets `reflected = true`; on target impact dispatches a HitEvent through CombatSystem.
- Introduce `BossController`: unique enemy at end of stage scroll; 3 phase transitions at full HP, 50 %, 25 %; each phase unlocks new attacks and increases speed/frequency.
- Introduce `AttackerCoordinator`: token-based system capping simultaneous attackers at 2; enemies must hold a token before entering Attack state.
- Introduce `EnemyManager`: creates, tracks, and destroys enemy instances; registers each with CombatSystem; listens for HitEvents; enforces no-respawn; pauses all enemy attacks during player grab sequences.
- Modify `game-scene`: add `getEnemyManager()` accessor; register EnemyManager fixed-update.

## Capabilities

### New Capabilities

- `enemy-config`: Named constants for all 3 archetypes + boss: HP, walk speed, patrol speed, aggro radius, attack range, preferred distance, damage values, knockback, hit-stun, drop table weights, boss phase thresholds. References: FR-EA-01, FR-EA-19, NFR-EA-01, NFR-EA-02.
- `enemy-state`: Enum of seven EnemyState values (Idle, Patrol, Aggro, Attack, Hurt, Knockdown, Death) shared by all archetypes. References: FR-EA-05 through FR-EA-13.
- `enemy-controller`: Abstract base providing shared FSM, patrol, aggro movement, hurt/knockdown/death logic, hurtbox registration with CombatSystem, hitbox activation on attack, item drop on death. References: FR-EA-05 through FR-EA-15, FR-EA-17, FR-EA-25.
- `brawler-controller`: Archetype A — patrols zone at medium speed; closes to melee range; executes a single heavy-punch hitbox (150 % base damage, HEAVY knockback). References: FR-EA-01, FR-EA-02.
- `rusher-controller`: Archetype B — stays Idle at spawn; transitions to Aggro when player enters radius; charges at high speed; attacks with 3-hit flurry (JAB damage × 3, LIGHT knockback, 8-frame gaps between hits). References: FR-EA-01, FR-EA-03.
- `knife-thrower-controller`: Archetype C — maintains preferred horizontal distance; fires `KnifeProjectile` when player is within LOS range and outside melee range; transitions Aggro↔Retreat to stay at preferred distance. References: FR-EA-01, FR-EA-04.
- `knife-projectile`: Phaser rectangle game object travelling at `KNIFE_SPEED` px/tick; hits player hurtbox via CombatSystem; player melee hitbox overlap sets `reflected = true` and reverses velocity toward thrower; each projectile may impact at most one target. References: FR-EA-04.
- `boss-controller`: Single boss per stage; phase 1 (full HP) — patrol + punch; phase 2 (below 50 % HP) — adds spinning kick hitbox; phase 3 (below 25 % HP) — increases speed by `BOSS_PHASE3_SPEED_MULTIPLIER`, halves `BOSS_ATTACK_COOLDOWN_FRAMES`. Boss arrival emits `bossArrived` event to lock camera. References: FR-EA-20 through FR-EA-24.
- `attacker-coordinator`: Holds at most `MAX_SIMULTANEOUS_ATTACKERS` (= 2) tokens; enemies call `requestAttackToken()` before entering Attack state; `releaseToken()` on exit from Attack, Hurt, or Death. References: FR-EA-16.
- `enemy-manager`: Owns the live enemy Set; creates enemies from `EnemySpawnEntry`; dispatches `enemyDefeated`; handles grab-pause (FR-EA-18); enforces one-spawn-per-zone (FR-EA-25); wires each enemy's CombatSystem hurtbox listener. References: FR-EA-13 through FR-EA-16, FR-EA-18, FR-EA-25, NFR-EA-02.

### Modified Capabilities

- `game-scene`: Add `getEnemyManager(): EnemyManager | null` accessor; register EnemyManager fixed-update in `create()`; listen for player grab events to call `EnemyManager.pauseAttacks()`. References: FR-EA-18.

## Impact

- New files: `src/enemy/EnemyConfig.ts`, `src/enemy/EnemyState.ts`, `src/enemy/EnemyStateMachine.ts`, `src/enemy/EnemyController.ts`, `src/enemy/BrawlerController.ts`, `src/enemy/RusherController.ts`, `src/enemy/KnifeThrowerController.ts`, `src/enemy/KnifeProjectile.ts`, `src/enemy/BossController.ts`, `src/enemy/AttackerCoordinator.ts`, `src/enemy/EnemyManager.ts`
- Modified: `src/game/scenes/GameScene.ts`
- No new external dependencies; Boss phase-transition animation uses Phaser tweens.
