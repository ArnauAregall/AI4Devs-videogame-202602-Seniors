## ADDED Requirements

### Requirement: HitEvent value type definition
The system SHALL define a read-only `HitEvent` type containing: `damage` (number), `knockbackX` (number, signed), `knockbackY` (number), `hitStunFrames` (number), `attackerFacing` (`'left' | 'right'`), `teamTag` (string), `isGrab` (boolean, default false), `isAoe` (boolean, default false). References: FR-CS-04, FR-CS-06, FR-CS-07, FR-CS-12.

#### Scenario: HitEvent carries correct fields
- **WHEN** a HitEvent is created with damage=15, knockbackX=80, hitStunFrames=12, attackerFacing='right'
- **THEN** all fields are accessible and immutable

### Requirement: Knockback direction respects attacker facing
The CombatSystem SHALL negate `knockbackX` when `attackerFacing` is `'left'`. References: FR-CS-07.

#### Scenario: Right-facing attacker pushes target to the right
- **WHEN** a HitEvent with knockbackX=80 and attackerFacing='right' is applied
- **THEN** the target moves +80 units horizontally

#### Scenario: Left-facing attacker pushes target to the left
- **WHEN** a HitEvent with knockbackX=80 and attackerFacing='left' is applied
- **THEN** the target moves -80 units horizontally
