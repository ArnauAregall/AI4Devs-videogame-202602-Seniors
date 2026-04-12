## ADDED Requirements

### Requirement: Leaderboard displays top 10 scores with name and score
`LeaderboardOverlay` SHALL render up to `HUD_LEADERBOARD_MAX_ENTRIES` (10) entries, each showing the player's name and score, sorted descending by score.

#### Scenario: Top 10 shown in descending order
- **WHEN** the leaderboard is displayed with 10 stored entries
- **THEN** entries are ordered from highest to lowest score

#### Scenario: Empty leaderboard shows no entries
- **WHEN** no scores have been recorded
- **THEN** the leaderboard shows an empty list (or placeholder message)

### Requirement: Leaderboard is accessible from Main Menu and Game Over screen
The leaderboard SHALL be reachable via an option in the Main Menu and as a navigation option after the Game Over screen.

#### Scenario: Main Menu has leaderboard option
- **WHEN** the Main Menu is displayed
- **THEN** a "High Scores" or "Leaderboard" option is present

#### Scenario: Game Over screen links to leaderboard
- **WHEN** the Game Over screen is displayed
- **THEN** a navigation option to the leaderboard is available

### Requirement: Leaderboard data persisted in localStorage
`LeaderboardStore` SHALL read and write the leaderboard array to `localStorage` using key `HUD_LEADERBOARD_STORAGE_KEY`. Reads and writes SHALL be wrapped in try/catch with in-memory fallback.

#### Scenario: Score persists across page reload
- **WHEN** a score is saved and the page is reloaded
- **THEN** the score appears in the leaderboard

#### Scenario: localStorage unavailable falls back gracefully
- **WHEN** `localStorage` throws on access
- **THEN** the leaderboard operates with an in-memory array and no crash occurs

### Requirement: Name-entry prompt shown when score qualifies for top 10
When a player's game-over or game-complete score qualifies to enter the top 10, the system SHALL prompt them to enter their name (up to `HUD_LEADERBOARD_NAME_MAX_LENGTH` characters) before displaying the leaderboard.

#### Scenario: Name prompt shown for qualifying score
- **WHEN** the player's score would place in the top 10
- **THEN** a name-entry prompt is shown before the leaderboard

#### Scenario: Name limited to max length
- **WHEN** the player types more than `HUD_LEADERBOARD_NAME_MAX_LENGTH` characters
- **THEN** input is capped at that length

#### Scenario: Name prompt skipped for non-qualifying score
- **WHEN** the player's score would not place in the top 10
- **THEN** no name prompt is shown; leaderboard is displayed directly
