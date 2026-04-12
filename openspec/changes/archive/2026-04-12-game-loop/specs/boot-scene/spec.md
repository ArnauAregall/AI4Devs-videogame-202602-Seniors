## ADDED Requirements

### Requirement: Boot scene loads minimum assets
The system SHALL implement a `BootScene` that loads only the assets required to display a loading screen (e.g. loading bar background, progress bar fill), then transitions to `PreloadScene` without user interaction.

#### Scenario: Boot transitions to Preload automatically
- **WHEN** `BootScene.create()` completes loading the minimum assets
- **THEN** the scene transitions to `PreloadScene` with no user input required

#### Scenario: Boot does not load all game assets
- **WHEN** `BootScene.preload()` runs
- **THEN** only loading-screen assets are loaded; game sprites and audio are NOT loaded here
