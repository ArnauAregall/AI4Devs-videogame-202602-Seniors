# Assets — Functional Requirements

## Overview

The assets subsystem defines the rules for organising, referencing, and provisioning all sprite and image resources used by the Final Fight clone. All assets originate from the staging directory `itch-io-resources/streets-of-fight/Assets` and must be copied into `finalfight-AAA/public/assets/` before any game code may reference them. No game source file or agent skill file may ever contain a path referencing `itch-io-resources/`.

The available asset pack (Streets of Fight) includes one player character (Brawler Girl), one enemy archetype (Enemy Punk), one stage with two background layers and a tileset, a shadow sprite, and a set of stage props. All available spritesheets use individual PNG frames; consolidated spritesheet PNGs are also provided and are the preferred format for Phaser loading.

## Functional Requirements

### Asset Copy Rule

FR-AS-01: All assets used by the game must reside under `finalfight-AAA/public/assets/` before the game is loaded; no asset may be loaded directly from `itch-io-resources/` at runtime.

FR-AS-02: The staging directory `itch-io-resources/` must never be modified, deleted, or referenced by any game source file, Phaser scene, or TypeScript module.

FR-AS-03: Asset provisioning must be performed by the sprite-provisioner skill before any implementer-agent session that requires sprites for the target subsystem.

### Directory Structure

FR-AS-04: The `finalfight-AAA/public/assets/` directory must be organised into the following subdirectories, each containing only assets relevant to the named entity:

- `player/` — all Brawler Girl spritesheets
- `enemies/punk/` — all Enemy Punk spritesheets
- `enemies/boss/` — boss character spritesheets (when available)
- `stage/layers/` — parallax background and foreground layer PNGs
- `stage/props/` — all stage prop PNGs including animated props
- `common/` — assets shared across entities (e.g. shadow)
- `hud/` — any HUD icon or UI image assets

FR-AS-05: Asset filenames under `public/assets/` must be lowercase, hyphen-separated, and must not contain spaces or uppercase letters.

### Sprite-to-Entity Mapping

FR-AS-06: The Brawler Girl spritesheets map to the following player states and must be copied to `public/assets/player/`:

- `idle.png` — Player Idle state (FR-PL-01); 4 frames
- `walk.png` — Player Walk state (FR-PL-02); 10 frames
- `jump.png` — Player Jump state (FR-PL-03); 4 frames
- `jab.png` — Player Light Attack / Jab state (FR-PL-04); 3 frames
- `punch.png` — Player Heavy Attack / Punch state (FR-PL-05); 3 frames
- `kick.png` — Player Heavy Attack / Kick variant (FR-PL-05); 5 frames
- `jump_kick.png` — Player Jump Attack state (FR-PL-06); 3 frames
- `dive_kick.png` — Player Jump Attack / Dive Kick variant (FR-PL-06); 5 frames
- `hurt.png` — Player Hurt state (FR-PL-08); 2 frames

FR-AS-07: The Enemy Punk spritesheets map to the following enemy states and must be copied to `public/assets/enemies/punk/`:

- `idle.png` — Enemy Punk Idle state (FR-EA-05); 4 frames
- `walk.png` — Enemy Punk Patrol and Aggro movement (FR-EA-06, FR-EA-08); 4 frames
- `punch.png` — Enemy Punk Attack state (FR-EA-09); 3 frames
- `hurt.png` — Enemy Punk Hurt state (FR-EA-11); 4 frames

FR-AS-08: The stage layer images must be copied to `public/assets/stage/layers/`:

- `back.png` — rearmost parallax background layer (FR-ST-04)
- `fore.png` — foreground parallax layer (FR-ST-04)
- `tileset.png` — ground plane and mid-layer tileset (FR-ST-04)

FR-AS-09: The stage prop images must be copied to `public/assets/stage/props/`:

- `barrel.png` — destructible barrel prop (FR-ST-09)
- `car.png` — destructible car prop (FR-ST-09)
- `hydrant.png` — non-destructible or destructible hydrant prop
- `banner-hor1.png` and `banner-hor2.png` — animated horizontal banner (2-frame animation)
- `ethereum-1.png` and `ethereum-2.png` — animated Ethereum sign (2-frame animation)
- `sushi-1.png` and `sushi-2.png` — animated sushi sign (2-frame animation)

FR-AS-10: The shadow sprite must be copied to `public/assets/common/`:

- `shadow.png` — ground shadow used under all characters (player and enemies)

### Phaser Texture Key Naming Convention

FR-AS-11: Every asset loaded in Phaser must use a texture key following the pattern `<entity>-<animation>`, where `entity` is the lowercased entity name and `animation` is the lowercased animation state name. Examples: `player-idle`, `player-walk`, `punk-idle`, `punk-hurt`, `stage-back`, `stage-fore`, `stage-tileset`, `prop-barrel`, `prop-car`, `common-shadow`.

FR-AS-12: All texture keys must be defined as exported string constants in `finalfight-AAA/src/assets/AssetKeys.ts`. No game source file may use a string literal as a texture key; it must import the constant from `AssetKeys.ts`.

FR-AS-13: `AssetKeys.ts` must also export the relative path under `public/assets/` for each key, to be used as the second argument to `this.load.spritesheet()` or `this.load.image()` in the Preload scene.

### Atlas and Frame Configuration

FR-AS-14: Each spritesheet must be loaded using `this.load.spritesheet()` with explicit `frameWidth` and `frameHeight` values defined as named constants, not inline pixel values.

FR-AS-15: Frame width and height constants for each spritesheet must be co-located with the corresponding AssetKey constant in `AssetKeys.ts` or in a sibling file `AssetFrameConfig.ts` imported by `AssetKeys.ts`.

FR-AS-16: All spritesheets use uniform frame sizes within a single file; no atlas JSON file is required for the current asset pack.

## Non-Functional Requirements

NFR-AS-01: No asset file path in any game source file (`.ts`, `.tsx`, scene files, data files) may reference the string `itch-io-resources`; a CI lint rule or pre-commit hook must enforce this.

NFR-AS-02: All Phaser texture keys must be defined in `AssetKeys.ts`; no ad-hoc string keys may appear in scene or entity source files.

NFR-AS-03: The total size of all assets under `public/assets/` must be below 10 MB to ensure fast initial load on a mid-range mobile connection.

NFR-AS-04: The `AssetKeys.ts` file must be the single source of truth for asset paths; any future asset addition requires a corresponding entry in this file before the asset may be referenced in game code.

## Open Questions

- Player Grab state (FR-PL-07): No grab or throw animation exists for the Brawler Girl in the current asset pack. Either a placeholder must be used, or the grab must be represented using existing frames (e.g. reusing punch frames) until a grab sprite is available.

- Player Knockdown state (FR-PL-09) and Get-Up state (FR-PL-10): No knockdown or get-up animation exists for the Brawler Girl. A placeholder or a flipped hurt frame may need to be used temporarily.

- Player Special Attack state (FR-PL-11): No special attack animation exists for the Brawler Girl. A placeholder or composite of existing frames is required.

- Enemy Punch Archetype B — Rusher (FR-EA-03): No sprite exists for this archetype. It must be created, sourced from another free pack, or stubbed until a matching asset is available.

- Enemy Archetype C — Knife Thrower (FR-EA-04): No sprite exists for this archetype or for the thrown projectile. Same resolution path as Archetype B.

- Enemy Knockdown and Death animations (FR-EA-12, FR-EA-13): Neither the Enemy Punk nor any other enemy archetype has knockdown or death animation frames in the current pack. Placeholders are required.

- Boss enemy (FR-EA-20, FR-EA-21): No boss character sprite exists in the current asset pack.

- HUD UI elements (FR-HU-01, FR-HU-04, FR-HU-08): No dedicated sprite assets exist for health bars, lives icons, timers, or score displays. These elements are expected to be drawn programmatically using Phaser Graphics and BitmapText, but a player icon for the lives display (FR-HU-04) is not yet available.

- Third parallax layer: The current pack provides `back.png`, `fore.png`, and `tileset.png`. FR-ST-04 requires a minimum of three parallax layers; confirm that `tileset.png` serves as the middle layer or identify an additional background image.

- Item pickup sprites (FR-ST-15, FR-EA-14): No health pickup or score item sprites are present. The sushi and ethereum sprites could serve as score items, but a health pickup sprite is absent.
