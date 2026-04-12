## ADDED Requirements

### Requirement: Score display updates on SCORE_CHANGED events
`ScoreDisplay` SHALL show the current score as a right-aligned numeric text at `(HUD_SCORE_X, HUD_SCORE_Y)`. It SHALL update immediately when a `SCORE_CHANGED` event is received.

#### Scenario: Initial score is zero
- **WHEN** `HudScene.create()` completes
- **THEN** the score display shows `0`

#### Scenario: Score increments on event
- **WHEN** `SCORE_CHANGED` is emitted with `{ score: 1200 }`
- **THEN** the score display shows `1200`

### Requirement: Score is right-aligned
The score text SHALL be right-aligned so the rightmost digit is anchored at `HUD_SCORE_X`.

#### Scenario: Score text is right-aligned
- **WHEN** the score is any value
- **THEN** the text object origin x is at the right edge (`setOrigin(1, 0)` or equivalent)

### Requirement: Score values per enemy archetype are configurable
Point values for each enemy archetype SHALL be defined as named constants in `HudConfig`. `GameScene` SHALL emit `SCORE_CHANGED` with the correct delta for each defeated enemy type.

#### Scenario: Defeating a brawler awards the correct points
- **WHEN** a brawler enemy is defeated
- **THEN** `SCORE_CHANGED` is emitted with `delta` equal to the brawler point constant
