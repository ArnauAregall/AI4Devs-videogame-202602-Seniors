## MODIFIED Requirements

### Requirement: HUD constants centralised in HudConfig
`HudConfig.ts` SHALL export named constants for every colour value, font size, layout position, and threshold used by the HUD. No magic numbers shall appear in any other HUD source file.

Constants SHALL include at minimum:
- `HUD_HEALTH_GREEN`, `HUD_HEALTH_YELLOW`, `HUD_HEALTH_RED` (Phaser hex colours)
- `HUD_HEALTH_YELLOW_THRESHOLD` (fraction, value 0.5)
- `HUD_HEALTH_RED_THRESHOLD` (fraction, value 0.25)
- `HUD_HEALTH_BAR_X`, `HUD_HEALTH_BAR_Y` (pixel position of health bar top-left)
- `HUD_HEALTH_BAR_WIDTH`, `HUD_HEALTH_BAR_HEIGHT` (pixel dimensions of health bar)
- `HUD_TIMER_WARNING_SECONDS` (integer, e.g. 30)
- `HUD_TIMER_WARNING_COLOUR` (Phaser hex colour)
- `HUD_BOSS_BAR_Y` (pixel y-position of boss bar centre)
- `HUD_SCORE_X`, `HUD_SCORE_Y` (layout pixel positions)
- `HUD_LIVES_X`, `HUD_LIVES_Y`
- `HUD_FONT_SIZE_NORMAL`, `HUD_FONT_SIZE_LARGE`
- `HUD_COMBO_MIN_COUNT` (minimum hits before combo display, value 2)
- `HUD_MAX_CONTINUES` (integer, value 3)
- `HUD_LEADERBOARD_MAX_ENTRIES` (integer, value 10)
- `HUD_LEADERBOARD_NAME_MAX_LENGTH` (integer, value 10)
- `HUD_LEADERBOARD_STORAGE_KEY` (string, value `'finalfight_leaderboard'`)

#### Scenario: All constants are named exports
- **WHEN** another HUD module imports from HudConfig
- **THEN** every constant is accessible as a named import with no `any` type

#### Scenario: No magic numbers outside HudConfig
- **WHEN** any HUD source file other than HudConfig.ts is read
- **THEN** no numeric or colour literals appear outside of HudConfig import usages
