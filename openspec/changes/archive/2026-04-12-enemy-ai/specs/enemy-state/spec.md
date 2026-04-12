## ADDED Requirements

### Requirement: EnemyState enum defines seven states
`EnemyState` SHALL export exactly seven values: Idle, Patrol, Aggro, Attack, Hurt, Knockdown, Death. All archetype controllers and the base class use this enum exclusively. References: FR-EA-05 through FR-EA-13.

#### Scenario: All seven state values exist and are unique
- **WHEN** `Object.values(EnemyState)` is evaluated
- **THEN** it contains exactly 7 unique string values

### Requirement: EnemyStateMachine enforces legal transitions
`EnemyStateMachine` SHALL implement a transition table. Illegal transitions are silently ignored. Legal transitions call `onExit(prev)` then `onEnter(next)`. References: FR-EA-05 through FR-EA-13.

Legal transitions:
- Idle → Patrol, Aggro
- Patrol → Idle, Aggro, Hurt
- Aggro → Attack, Hurt, Knockdown, Death
- Attack → Aggro, Hurt, Knockdown, Death
- Hurt → Aggro, Knockdown, Death
- Knockdown → Death, Aggro
- Death → (none)
- Any state → Hurt (interrupt) except Death

#### Scenario: Illegal transition is silently ignored
- **WHEN** `transition(EnemyState.Knockdown, EnemyState.Patrol)` is called
- **THEN** state does not change and no hooks fire

#### Scenario: Hurt interrupts Attack
- **WHEN** enemy is in Attack state and `transition(EnemyState.Hurt)` is called
- **THEN** onExit(Attack) and onEnter(Hurt) both fire and state becomes Hurt
