## Context

The game has a Boot scene and Preload scene that were created in the original game-loop subsystem implementation. The Boot scene loads a single background image and immediately transitions — it never displays the image. The Preload scene builds a progress bar in `create()` and calls `loadAssets()` at the end, so the bar renders AFTER Phaser's next render cycle, meaning the progress bar's initial state (0%) is technically not visible before loading begins. Both scenes generate a blank frame during startup.

## Goals / Non-Goals

**Goals:**
- Boot scene renders a visible loading screen (background + text) during Phaser's render cycle before transitioning
- Preload scene renders a structural loading screen (background, track bar, fill bar, percentage) in `create()` before calling `this.load.start()`
- No blank frames during the boot → preload → main menu pipeline
- Progress bar starts visible at 0% and updates in real-time to 100%

**Non-Goals:**
- Adding audio file loading (no audio assets exist yet)
- Changing the asset loading strategy or adding lazy loading
- Modifying the Phaser game config or scene registration

## Decisions

1. **Display loading-bg in Boot.create() before transition**: The Boot scene renders the image it just loaded as a full-screen background and shows "Loading..." text. This eliminates the blank frame between boot and preload since Phaser renders the scene before the transition.

2. **Preload scene renders loading screen in `create()`, defers `load.start()`**: The loading screen UI (background, track bar, fill bar, percentage) is built in `create()`. The `loadAssets()` method adds assets to the loader queue but does NOT call `load.start()` — instead, the Phaser loader automatically starts when `create()` returns, so the progress events fire with the UI already rendered.

3. **Single-step progress bar update**: Use `this.load.on('progress', callback)` with direct width and text updates. No tween — the native progress callback fires frequently enough for smooth visual updates.

## Risks / Trade-offs

- [Phaser render timing] → Calling `this.load.start()` manually after adding assets may cause a one-frame delay. Fixed by NOT calling `load.start()` and instead letting Phaser auto-start the loader after `create()` returns, which happens after the first render.
- [Scene transition flash] → Phaser's `scene.start()` replaces the scene in the next frame. Since Boot renders its background before transitioning, no blank frame occurs.
