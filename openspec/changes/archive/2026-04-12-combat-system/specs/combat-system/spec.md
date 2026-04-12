## ADDED Requirements

### Requirement: Hit detection runs every fixed tick
The CombatSystem SHALL perform hitbox-versus-hurtbox overlap checks during every fixed-timestep update tick. Each registered hitbox is tested against every registered hurtbox that belongs to a different team. Detection MUST resolve all overlaps and dispatch HitEvents within the same tick. References: FR-CS-03, NFR-CS-01, NFR-CS-02.

#### Scenario: Overlapping hitbox and enemy hurtbox registers a hit
- **WHEN** a player hitbox rect overlaps an enemy hurtbox rect during fixedUpdate
- **THEN** a HitEvent is dispatched to the target and the overlap is not re-processed in the same swing

#### Scenario: Same-team hitbox/hurtbox overlap is ignored
- **WHEN** a player hitbox rect overlaps a player hurtbox rect
- **THEN** no HitEvent is dispatched

#### Scenario: Non-overlapping hitbox and hurtbox produce no hit
- **WHEN** a hitbox rect and a hurtbox rect do not geometrically overlap
- **THEN** no HitEvent is dispatched

### Requirement: One hit per swing guard
A hitbox instance SHALL deal damage to a given hurtbox at most once per activation window. The system MUST track which (hitboxId, targetId) pairs have already connected and skip them on subsequent ticks until the hitbox is deactivated. References: FR-CS-14.

#### Scenario: Hitbox that already hit target is skipped
- **WHEN** a hitbox overlaps the same hurtbox on a second consecutive tick in the same swing
- **THEN** no additional HitEvent is dispatched

#### Scenario: Hit guard resets when hitbox is removed
- **WHEN** removeHitbox is called and the same hitbox ID is registered again (new swing)
- **THEN** it may hit the same target again

### Requirement: Team tag filtering
The CombatSystem SHALL assign each hitbox and hurtbox a team tag (`player` or `enemy`). Hits MUST only register between hitboxes and hurtboxes of opposing teams. References: FR-CS-03.

#### Scenario: Player hitbox only hits enemy hurtbox
- **WHEN** a hitbox with team `player` is tested against hurtboxes
- **THEN** it only registers hits on hurtboxes with team `enemy`

### Requirement: Grab proximity check
The CombatSystem SHALL expose a `tryGrab(attackerX, attackerY, facing)` method that performs a rectangular proximity check instead of hitbox-hurtbox overlap. If an enemy is within `GRAB_RANGE` horizontally and `GRAB_HEIGHT_TOLERANCE` vertically, the grab succeeds. On success the attacker is flagged as grab-active (invincible) and a HitEvent with `isGrab: true` is dispatched at throw-impact. References: FR-CS-15, FR-CS-20.

#### Scenario: Grab connects when enemy is in range
- **WHEN** tryGrab is called and an enemy is within GRAB_RANGE and GRAB_HEIGHT_TOLERANCE
- **THEN** the grab succeeds, attacker is flagged invincible, and a HitEvent with isGrab=true is returned

#### Scenario: Grab fails when no enemy in range
- **WHEN** tryGrab is called and no enemy is within range
- **THEN** the method returns null and no HitEvent is dispatched

#### Scenario: Grab sequence cannot be interrupted
- **WHEN** attacker is in grab-active (invincible) state
- **THEN** incoming HitEvents targeting the attacker are discarded

### Requirement: AoE special attack hits all enemies simultaneously
The CombatSystem SHALL allow a hitbox registration with `isAoe: true`. An AoE hitbox is tested against all hurtboxes of the opposing team in the same tick, and each may receive at most one hit from that activation. References: FR-CS-21.

#### Scenario: AoE hits multiple enemies
- **WHEN** an AoE hitbox overlaps three enemy hurtboxes
- **THEN** three separate HitEvents are dispatched, one per enemy

#### Scenario: AoE only hits each enemy once per use
- **WHEN** an AoE hitbox overlaps the same enemy hurtbox on two consecutive ticks
- **THEN** only one HitEvent is dispatched for that enemy per activation
