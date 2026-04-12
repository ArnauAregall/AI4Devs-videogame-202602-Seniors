## 1. Constants and Types

- [ ] 1.1 Create `src/combat/CombatConfig.ts` — export all hitbox/hurtbox dimensions, damage values, knockback vectors, hit-stun values, combo window, diminishing return constants, grab constants, and DEBUG_HITBOXES flag
- [ ] 1.2 Create `src/combat/HitEvent.ts` — export read-only `HitEvent` interface with all required fields (damage, knockbackX, knockbackY, hitStunFrames, attackerFacing, teamTag, isGrab, isAoe)

## 2. HurtboxComponent

- [ ] 2.1 Create `src/combat/HurtboxComponent.ts` — class with id, rect, teamTag, invincible flag, and update(x, y) method to reposition the rect to the character's world position
- [ ] 2.2 Add `registerHurtbox(id, rect, teamTag)` and `removeHurtbox(id)` methods to `CombatSystem` (stub — will be created in group 3)
- [ ] 2.3 Add invincibility guard: skip hurtboxes with `invincible=true` in overlap detection

## 3. CombatSystem Core

- [ ] 3.1 Create `src/combat/CombatSystem.ts` — class with: hurtbox registry Map, hitbox registry Map, hit-guard Set (hitboxId+targetId pairs), `fixedUpdate()` method
- [ ] 3.2 Implement `registerHitbox(id, rect, teamTag, damage, knockbackX, knockbackY, hitStunFrames, facing, isAoe?)` and `removeHitbox(id)` — removeHitbox clears hit-guard entries for this id
- [ ] 3.3 Implement per-tick overlap detection: iterate hitboxes × hurtboxes, team filter, hit-guard check, dispatch HitEvent
- [ ] 3.4 Implement AoE path: when `isAoe=true`, skip one-hit-per-swing guard and allow all enemy targets in the same tick
- [ ] 3.5 Implement `tryGrab(attackerX, attackerY, facing)` — proximity check, return HitEvent or null
- [ ] 3.6 Implement grab invincibility: when grab succeeds, mark attacker's hurtbox invincible for `GRAB_INVINCIBILITY_FRAMES`

## 4. ComboTracker

- [ ] 4.1 Create `src/combat/ComboTracker.ts` — Map of targetId → { counter, windowTimer }
- [ ] 4.2 Implement `recordHit(targetId, baseDamage, baseHitStun)` — returns `{ effectiveDamage, effectiveHitStun, comboCount }`
- [ ] 4.3 Implement diminishing returns formula: `max(DAMAGE_FLOOR, baseDamage * max(DIMINISHING_MIN_FACTOR, 1.0 - DIMINISHING_STEP * (comboCount - 1)))`
- [ ] 4.4 Implement hit-stun scaling: `min(HIT_STUN_MAX_FRAMES, baseHitStun + comboCount * HIT_STUN_COMBO_INCREMENT)`
- [ ] 4.5 Implement `tick()` method — decrement all window timers; reset counter to zero when timer reaches zero
- [ ] 4.6 Wire ComboTracker into CombatSystem: call `comboTracker.recordHit()` before dispatching HitEvent, update HitEvent with effective values

## 5. DebugRenderer

- [ ] 5.1 Create `src/combat/DebugRenderer.ts` — wraps `Phaser.GameObjects.Graphics`, reads hitbox and hurtbox lists from CombatSystem
- [ ] 5.2 Implement `update()` — if DEBUG_HITBOXES is true and visible, clear graphics, draw red outlines for hitboxes and green outlines for hurtboxes
- [ ] 5.3 Implement `setVisible(flag)` — show/hide the graphics object without destroying it
- [ ] 5.4 Add `DEBUG_HITBOXES` constant to `GameConfig.ts` (default false)

## 6. PlayerController Integration

- [ ] 6.1 Register player hurtbox with CombatSystem in `PlayerController` constructor/init (requires CombatSystem reference)
- [ ] 6.2 Remove player hurtbox in `PlayerController.destroy()`
- [ ] 6.3 Call `CombatSystem.registerHitbox()` on entering LightAttack, HeavyAttack, JumpAttack states with correct per-attack constants
- [ ] 6.4 Call `CombatSystem.removeHitbox()` on exiting each attack state
- [ ] 6.5 Register special attack as AoE hitbox (isAoe=true, PLAYER_SPECIAL_HITBOX dimensions)
- [ ] 6.6 Route Grab state to `CombatSystem.tryGrab()` and handle success/failure (invincibility flag, HitEvent dispatch)

## 7. GameScene Integration

- [ ] 7.1 Add `_combatSystem: CombatSystem | null` field and `getCombatSystem()` accessor to `GameScene`
- [ ] 7.2 Instantiate `CombatSystem` and `DebugRenderer` in `GameScene.create()`
- [ ] 7.3 Register `CombatSystem.fixedUpdate.bind(_combatSystem)` with `registerFixedUpdate`
- [ ] 7.4 Pass `CombatSystem` reference to `PlayerController` during construction
- [ ] 7.5 Call `DebugRenderer.update()` inside `GameScene.update()` (render frame, not fixed tick)

## 8. Tests — CombatSystem

- [ ] 8.1 Write `src/__tests__/CombatSystem.test.ts` — happy-path hit registration, same-team filtering, one-hit-per-swing guard, AoE multi-hit
- [ ] 8.2 Write tests for tryGrab — success path, failure path, invincibility grant

## 9. Tests — ComboTracker

- [ ] 9.1 Write `src/__tests__/ComboTracker.test.ts` — combo counter increment, window reset, window expiry, diminishing returns formula, hit-stun scaling cap

## 10. Tests — HurtboxComponent and DebugRenderer

- [ ] 10.1 Write tests for HurtboxComponent — register/remove, invincibility guard
- [ ] 10.2 Write tests for DebugRenderer — draws when enabled, hidden when disabled, setVisible toggle
