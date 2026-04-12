## ADDED Requirements

### Requirement: Enemy-hit-to-player-damage wiring
`GameScene` SHALL register (within `create()`) an additional `onHit` callback branch: when `targetId === 'player'` AND `event.teamTag === 'enemy'`, it SHALL call `this._player?.applyHit(event)`. This branch is added to the existing `onHit` lambda — no second `onHit` subscription is needed. References: FR-EB-14.

#### Scenario: Player takes damage from enemy attack
- **WHEN** CombatSystem dispatches HitEvent with targetId='player' and teamTag='enemy'
- **THEN** `player.applyHit` is called with that event

#### Scenario: Combo counter unchanged on enemy hit
- **WHEN** CombatSystem dispatches HitEvent with teamTag='enemy'
- **THEN** `_comboCount` remains unchanged and no COMBO_UPDATED event is emitted

#### Scenario: No null-pointer when player is null
- **WHEN** `this._player` is null and an enemy hit event arrives
- **THEN** no exception is thrown (optional chaining `?.` guards the call)
