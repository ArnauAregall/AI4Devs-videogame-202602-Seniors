## 1. Update Boot Scene

- [x] 1.1 Add background image rendering and "Loading..." text in Boot.create() before scene transition
- [x] 1.2 Verify Boot scene renders the loading-bg full-screen with no blank frame before transitioning

## 2. Update Preload Scene

- [x] 2.1 Restructure Preloader.ts to render loading screen (background, track bar, fill bar, percentage text) in create() before load queue starts
- [x] 2.2 Remove explicit this.load.start() call — let Phaser auto-start after create() returns
- [x] 2.3 Wire percentage text update into the progress event handler
- [x] 2.4 Verify progress bar is visible at 0% before any assets load

## 3. Verify No Blank Frames

- [x] 3.1 Confirm Boot → Preload → MainMenu pipeline has no visible blank frames
- [x] 3.2 Confirm progress indicator updates in real-time during asset loading
