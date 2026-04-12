# Tasks — enemy-ai

## Group 1: EnemyConfig
- [x] Create `src/enemy/EnemyConfig.ts` with all named constants for 3 archetypes + boss + shared values (KNOCKDOWN_THRESHOLD, DEATH_LINGER_FRAMES, ENEMY_SEPARATION_MIN_PX, MAX_SIMULTANEOUS_ATTACKERS)

## Group 2: EnemyState + EnemyStateMachine
- [x] Create `src/enemy/EnemyState.ts` — enum of 7 states
- [x] Create `src/enemy/EnemyStateMachine.ts` — transition table, onEnter/onExit hooks, canTransition()

## Group 3: EnemyController (base)
- [x] Create `src/enemy/EnemyController.ts` — abstract class with patrol, aggro movement, hurt interrupt, knockdown accumulation, death sequence, hurtbox registration, hitbox registration/removal, item drop delegation, separation push, fixedUpdate() dispatcher

## Group 4: BrawlerController
- [x] Create `src/enemy/BrawlerController.ts` — extends EnemyController; implements _onEnterAttack (heavy punch hitbox) and _onUpdateAggro (close to melee range check)

## Group 5: RusherController
- [x] Create `src/enemy/RusherController.ts` — extends EnemyController; Idle until aggro; charge at RUSHER_CHARGE_SPEED; 3-hit flurry with RUSHER_FLURRY_GAP_FRAMES spacing

## Group 6: KnifeThrowerController
- [x] Create `src/enemy/KnifeThrowerController.ts` — extends EnemyController; maintain preferred distance band; fire KnifeProjectile on cooldown

## Group 7: KnifeProjectile
- [x] Create `src/enemy/KnifeProjectile.ts` — Phaser rectangle game object; travel; one-tick hitbox registration; reflected flag; max range destroy; thrower reference for reflected damage

## Group 8: BossController
- [x] Create `src/enemy/BossController.ts` — extends EnemyController; _phase (1/2/3); threshold detection; phase-2 spinning-kick attack; phase-3 speed+frequency boost; bossArrived event on spawn; _transitioning flag

## Group 9: AttackerCoordinator
- [x] Create `src/enemy/AttackerCoordinator.ts` — counter (0–MAX_SIMULTANEOUS_ATTACKERS); requestAttackToken(); releaseToken()

## Group 10: EnemyManager
- [x] Create `src/enemy/EnemyManager.ts` — factory for all 4 enemy types; enemySpawn listener; one-time spawn guard (zoneId Set); onHit routing; onEnemyDeath + item drop resolution; playerGrabStart/End listeners; fixedUpdate() calls all active enemy fixedUpdate(); emits enemyDefeated

## Group 11: GameScene integration
- [x] Modify `src/game/scenes/GameScene.ts` — import EnemyManager; create in create(); register fixedUpdate; add getEnemyManager() accessor; emit playerGrabStart/End from PlayerController grab state transitions

## Group 12: Tests
- [x] Create `src/__tests__/EnemyStateMachine.test.ts` — transition table, hooks, interrupt
- [x] Create `src/__tests__/EnemyController.test.ts` — patrol bounce, aggro movement, hurt interrupt, knockdown threshold, death sequence, hurtbox lifecycle
- [x] Create `src/__tests__/BrawlerController.test.ts` — patrol→aggro, attack hitbox, return to aggro
- [x] Create `src/__tests__/RusherController.test.ts` — idle until aggro, charge speed, 3-hit flurry
- [x] Create `src/__tests__/KnifeThrowerController.test.ts` — distance maintenance, projectile creation, cooldown
- [x] Create `src/__tests__/KnifeProjectile.test.ts` — travel, hit player, max range, reflect, reflected hit thrower
- [x] Create `src/__tests__/BossController.test.ts` — phase-2 trigger, phase-3 trigger, single transitions, bossArrived event
- [x] Create `src/__tests__/AttackerCoordinator.test.ts` — token grant/deny/release
- [x] Create `src/__tests__/EnemyManager.test.ts` — spawn event, one-time guard, HitEvent routing, grab pause, item drop
