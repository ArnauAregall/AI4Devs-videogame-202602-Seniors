## ADDED Requirements

### Requirement: Maximum 2 simultaneous attackers
`AttackerCoordinator` SHALL hold a counter initialised to 0. `requestAttackToken()` returns `true` and increments the counter if it is below `MAX_SIMULTANEOUS_ATTACKERS` (= 2); returns `false` if already at maximum. `releaseToken()` decrements the counter (floor 0). References: FR-EA-16.

#### Scenario: First two requests are granted
- **WHEN** requestAttackToken() is called twice
- **THEN** both return true and counter equals 2

#### Scenario: Third request is denied
- **WHEN** requestAttackToken() is called when counter = 2
- **THEN** it returns false and counter remains 2

#### Scenario: Release makes room for next request
- **WHEN** releaseToken() is called and then requestAttackToken()
- **THEN** the new request returns true

#### Scenario: Counter does not go below zero
- **WHEN** releaseToken() is called when counter = 0
- **THEN** counter remains 0
