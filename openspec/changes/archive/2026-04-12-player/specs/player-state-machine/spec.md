## ADDED Requirements

### Requirement: PlayerState enum defines all legal states
The system SHALL define a `PlayerState` enum with exactly these values: `Idle`, `Walk`, `Jump`, `LightAttack`, `HeavyAttack`, `JumpAttack`, `Grab`, `Hurt`, `Knockdown`, `GetUp`, `SpecialAttack`.

#### Scenario: All states are enumerable
- **WHEN** `Object.values(PlayerState)` is called
- **THEN** it returns exactly 11 unique string values

### Requirement: State transitions enforce a legal transition table
The system SHALL enforce the following transition rules. Any transition not listed is illegal and MUST be silently ignored (no throw):

| From | To | Condition |
|---|---|---|
| Idle | Walk, Jump, LightAttack, HeavyAttack, Grab, SpecialAttack | input triggered |
| Walk | Idle, Jump, LightAttack, HeavyAttack, Grab, SpecialAttack | input triggered |
| Jump | JumpAttack, Hurt, Knockdown | attack input or hit received |
| Jump | Idle | landed on ground plane |
| LightAttack | Idle, Hurt, Knockdown | animation complete or hit received |
| HeavyAttack | Idle, Hurt, Knockdown | animation complete or hit received |
| JumpAttack | Idle, Hurt, Knockdown | landed or hit received |
| Grab | Idle | grab animation complete |
| Hurt | Idle, Knockdown | animation complete |
| Knockdown | GetUp | knockdown animation complete (automatic) |
| GetUp | Idle | get-up animation complete |
| SpecialAttack | Idle, Hurt, Knockdown | animation complete or hit received |
| Any | Hurt | hit received while not invincible (interrupts most states) |
| Any | Knockdown | knockdown-triggering hit received |

#### Scenario: Legal transition executes enter/exit hooks
- **WHEN** `stateMachine.transition(PlayerState.Walk)` is called from `Idle`
- **THEN** the `Idle` exit hook runs, the state becomes `Walk`, and the `Walk` enter hook runs

#### Scenario: Illegal transition is ignored
- **WHEN** `stateMachine.transition(PlayerState.Walk)` is called from `Knockdown`
- **THEN** the state remains `Knockdown` and no hooks are called

#### Scenario: Hurt interrupts attack states
- **WHEN** the player is in `LightAttack` and receives a hit while not invincible
- **THEN** the state transitions to `Hurt`

#### Scenario: SpecialAttack cannot interrupt Knockdown or GetUp
- **WHEN** the player is in `Knockdown` and the special attack input is received
- **THEN** the state remains `Knockdown`
