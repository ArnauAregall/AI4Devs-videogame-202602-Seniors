# preload-scene Specification

## Purpose
TBD - created by archiving change game-loop. Update Purpose after archive.
## Requirements
### Requirement: Preload scene shows a progress indicator
The system SHALL implement a `PreloadScene` that renders a visible loading progress bar that updates as assets load. The bar MUST be visible from 0% to 100%.

#### Scenario: Progress bar advances during loading
- **WHEN** assets are loading in `PreloadScene`
- **THEN** a progress bar is visible and its fill width increases proportionally to the number of files loaded

### Requirement: Preload scene loads all game assets
The system SHALL load all game assets (spritesheets, images, audio) in `PreloadScene.preload()`. No other scene SHALL call `this.load.*` for game assets.

#### Scenario: All AssetKeys paths are loaded
- **WHEN** `PreloadScene.preload()` completes
- **THEN** every key defined in `AssetKeys.ASSET_PATH` has been loaded into the Phaser texture cache

### Requirement: Preload transitions to MainMenu on completion
The system SHALL transition from `PreloadScene` to `MainMenuScene` immediately after all assets finish loading.

#### Scenario: Auto-transition to main menu
- **WHEN** the Phaser `load.on('complete')` event fires in `PreloadScene`
- **THEN** `this.scene.start('MainMenuScene')` is called

