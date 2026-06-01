## Why

The Boot and Preload scenes exist but are too minimal — Boot loads a single asset and immediately transitions without displaying anything, creating a visible blank frame. The Preload scene's progress bar is functional but lacks a structural loading screen (background, text). Neither scene shows any loading state to the player during the startup pipeline. This ticket refines both scenes to eliminate blank frames and provide clear visual feedback during asset loading.

## What Changes

- Boot scene renders the loaded background image and a "Loading..." text before transitioning to Preload
- Preload scene renders a structural loading screen (background, track bar, fill bar, percentage text) that updates in real time
- Both scenes ensure no blank frame appears between scene transitions
- Preload scene progress bar is created in `create()` BEFORE `load.start()` is called, so the bar container is already rendered at 0%

## Capabilities

### New Capabilities
- (none — existing boot-scene and preload-scene specs cover this)

### Modified Capabilities
- `boot-scene`: Boot scene must display a visible loading screen (background + text) during its brief lifetime; not just load assets and immediately transition
- `preload-scene`: Preload scene must render a structural loading screen (background, track bar, fill bar, percentage) BEFORE calling load.start(), ensuring 0% bar is visible

## Impact

- `finalfight-AAA/src/game/scenes/Boot.ts` — add background rendering and loading text in create()
- `finalfight-AAA/src/game/scenes/Preloader.ts` — restructure to render loading screen in create() before loadAssets(), add percentage text
