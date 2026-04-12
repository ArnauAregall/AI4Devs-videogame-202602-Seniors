## 1. Constants and Configuration

- [x] 1.1 Add `BOSS_STANDARD_DAMAGE`, `BOSS_STANDARD_KNOCKBACK`, `BOSS_CRITICAL_DAMAGE`, `BOSS_CRITICAL_KNOCKBACK` to `EnemyConfig.ts`
- [x] 1.2 Add `BOSS_CRITICAL_PROBABILITY`, `BOSS_CRITICAL_COOLDOWN_TICKS`, `BOSS_CRITICAL_TELEGRAPH_FRAMES` to `EnemyConfig.ts`
- [x] 1.3 Add `BOSS_PHASE2_CRITICAL_BOOST` and `BOSS_PHASE3_CRITICAL_BOOST` to `EnemyConfig.ts`
- [x] 1.4 Add `BOSS_ANIM_CRITICAL_TELEGRAPH` and `BOSS_ANIM_CRITICAL_ATTACK` string constants to `EnemyConfig.ts`

## 2. Animation Registration

- [x] 2.1 Register `BOSS_ANIM_CRITICAL_TELEGRAPH` animation clip using `boss-attack-3` frames in `EnemyAnimations.ts`
- [x] 2.2 Register `BOSS_ANIM_CRITICAL_ATTACK` animation clip using `boss-attack-4` frames in `EnemyAnimations.ts`

## 3. BossController State Machine

- [x] 3.1 Add `CriticalTelegraph` and `CriticalAttack` values to `BossState` enum in `BossController.ts`
- [x] 3.2 Add `_criticalCooldownTicks: number` field (initialised to 0) to `BossController`
- [x] 3.3 Implement `_selectAttack()` method: rolls `Math.random()` against effective critical probability; returns `CriticalTelegraph` if roll succeeds and cooldown is 0, else `StandardAttack`
- [x] 3.4 In `_onEnterState(CriticalTelegraph)`: set `_criticalCooldownTicks = BOSS_CRITICAL_COOLDOWN_TICKS`, play `BOSS_ANIM_CRITICAL_TELEGRAPH`, no hitbox
- [x] 3.5 On `animationcomplete` for `BOSS_ANIM_CRITICAL_TELEGRAPH`: transition to `CriticalAttack` state and play `BOSS_ANIM_CRITICAL_ATTACK`
- [x] 3.6 In `_onEnterState(CriticalAttack)`: activate critical hitbox with `BOSS_CRITICAL_DAMAGE` and `BOSS_CRITICAL_KNOCKBACK`
- [x] 3.7 Decrement `_criticalCooldownTicks` by 1 each `fixedUpdate` tick when it is greater than 0 and boss is not in CriticalTelegraph/CriticalAttack state
- [x] 3.8 Update phase 2 transition to add `BOSS_PHASE2_CRITICAL_BOOST` to effective critical probability
- [x] 3.9 Update phase 3 transition to add `BOSS_PHASE3_CRITICAL_BOOST` to effective critical probability

## 4. Standard Attack Refactor

- [x] 4.1 Ensure standard attack in `BossController` uses `BOSS_STANDARD_DAMAGE` and `BOSS_STANDARD_KNOCKBACK` (replacing any hard-coded values)
- [x] 4.2 Replace direct attack-trigger logic with a call to `_selectAttack()` to route to standard or critical path

## 5. Tests

- [x] 5.1 Write `BossAttacks.test.ts`: standard attack fires when in range, cooldown 0, and probability gate returns false
- [x] 5.2 Test critical attack fires when in range, cooldown 0, and probability gate returns true
- [x] 5.3 Test critical is blocked when `_criticalCooldownTicks > 0`
- [x] 5.4 Test `_criticalCooldownTicks` is set to `BOSS_CRITICAL_COOLDOWN_TICKS` on telegraph entry
- [x] 5.5 Test no hitbox active during telegraph phase
- [x] 5.6 Test cooldown decrements per tick
- [x] 5.7 Test phase 2 and phase 3 boost effective critical probability
