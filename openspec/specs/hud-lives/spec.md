## ADDED Requirements

### Requirement: Lives counter displays remaining lives
`LivesDisplay` SHALL render the player's remaining lives as a numeric text at `(HUD_LIVES_X, HUD_LIVES_Y)`. It SHALL update immediately when `PLAYER_LIVES_CHANGED` is received.

#### Scenario: Lives show correct count
- **WHEN** `PLAYER_LIVES_CHANGED` is emitted with `{ lives: 2 }`
- **THEN** the lives display shows `2`

#### Scenario: Lives update immediately after player death
- **WHEN** the player loses a life and `PLAYER_LIVES_CHANGED` is emitted
- **THEN** the lives display updates before the respawn sequence completes

### Requirement: Lives display includes a label prefix
The lives counter SHALL display a recognisable label (e.g., "P1 × ") before the numeric value so the player can distinguish it from the score.

#### Scenario: Lives display has label
- **WHEN** lives are displayed
- **THEN** the text includes a prefix distinguishing it from the score
