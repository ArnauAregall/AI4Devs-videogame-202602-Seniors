## ADDED Requirements

### Requirement: Brawler patrol and heavy punch
`BrawlerController` SHALL patrol its zone at `BRAWLER_PATROL_SPEED`, transition to Aggro when the player enters `BRAWLER_AGGRO_RADIUS`, close to `BRAWLER_ATTACK_RANGE`, and then register a single heavy-punch hitbox for `BRAWLER_ATTACK_ACTIVE_FRAMES` ticks. References: FR-EA-01, FR-EA-02.

#### Scenario: Brawler transitions Patrol → Aggro when player enters radius
- **WHEN** distance(brawler, player) ≤ BRAWLER_AGGRO_RADIUS
- **THEN** state transitions from Patrol to Aggro

#### Scenario: Brawler registers hitbox in Attack state
- **WHEN** BrawlerController enters Attack state
- **THEN** `combatSystem.registerHitbox(id_attack, ...)` is called with BRAWLER_PUNCH_DAMAGE

#### Scenario: Brawler returns to Aggro after attack
- **WHEN** attack animation timer expires
- **THEN** state transitions back to Aggro
