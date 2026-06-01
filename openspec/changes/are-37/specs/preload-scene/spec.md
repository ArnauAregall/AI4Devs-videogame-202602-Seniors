## ADDED Requirements

### Requirement: Preload scene renders a structural loading screen
The system SHALL render a visible loading screen in `PreloadScene.create()` before any assets begin loading. The loading screen MUST include a background image, a track bar (outline), a fill bar, and a percentage text label.

#### Scenario: Loading screen is visible before the first load progress event
- **WHEN** `PreloadScene.create()` executes
- **THEN** the background image, track bar outline, fill bar (at 0% width), and "0%" text are rendered before `this.load.start()` is called

## MODIFIED Requirements

### Requirement: Preload scene shows a progress indicator
The system SHALL implement a `PreloadScene` that renders a visible loading progress bar that updates as assets load. The bar MUST be visible from 0% to 100%. The bar MUST include a numeric percentage label that updates in real time.

#### Scenario: Progress bar advances during loading
- **WHEN** assets are loading in `PreloadScene`
- **THEN** a progress bar is visible, its fill width increases proportionally to the number of files loaded, and the percentage text updates to match

### Requirement: Preload scene loads all game assets
The system SHALL load all game assets (spritesheets, images) in `PreloadScene`. No other scene SHALL call `this.load.*` for game assets. The Preload scene SHALL NOT call `this.load.start()` explicitly — Phaser auto-starts after `create()` returns.

#### Scenario: All AssetKeys paths are loaded
- **WHEN** `PreloadScene.create()` completes
- **THEN** every key defined in `AssetKeys.ASSET_PATH` has been queued for loading, and loading begins automatically

### Requirement: Preload transitions to MainMenu on completion
The system SHALL transition from `PreloadScene` to `MainMenuScene` immediately after all assets finish loading.

#### Scenario: Auto-transition to main menu
- **WHEN** the Phaser `load.on('complete')` event fires in `PreloadScene`
- **THEN** `this.scene.start('MainMenuScene')` is called
