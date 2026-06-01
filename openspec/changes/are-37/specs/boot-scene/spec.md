## MODIFIED Requirements

### Requirement: Boot scene loads minimum assets
The system SHALL implement a `BootScene` that loads only the assets required to display a loading screen (e.g. loading bar background, progress bar fill), then renders them as a visible loading screen and transitions to `PreloadScene` without user interaction.

#### Scenario: Boot renders its loaded assets before transitioning
- **WHEN** `BootScene.create()` completes
- **THEN** the loaded loading-bg image is displayed as a full-screen background with "Loading..." text visible for at least one render frame before transitioning

#### Scenario: Boot does not load all game assets
- **WHEN** `BootScene.preload()` runs
- **THEN** only loading-screen assets are loaded; game sprites and audio are NOT loaded here
