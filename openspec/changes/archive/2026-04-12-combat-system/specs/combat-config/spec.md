## ADDED Requirements

### Requirement: Combat named constants
All combat dimensions, damage values, knockback magnitudes, stun durations, combo parameters, and debug flags SHALL be defined as exported named constants in `CombatConfig.ts`. No inline pixel values or magic numbers are permitted in any combat source file. References: FR-CS-16.

#### Scenario: Hitbox width is referenced by constant
- **WHEN** CombatSystem creates a hitbox for a jab attack
- **THEN** it uses PLAYER_JAB_HITBOX_W and PLAYER_JAB_HITBOX_H, not literal numbers

#### Scenario: Combo window constant used throughout
- **WHEN** ComboTracker initialises a window timer
- **THEN** it references COMBO_WINDOW_FRAMES, not a literal number

### Requirement: Constants definition scope
The following constants SHALL be exported from `CombatConfig.ts`:

**Hitbox dimensions (pixels):** `PLAYER_JAB_HITBOX_W`, `PLAYER_JAB_HITBOX_H`, `PLAYER_PUNCH_HITBOX_W`, `PLAYER_PUNCH_HITBOX_H`, `PLAYER_KICK_HITBOX_W`, `PLAYER_KICK_HITBOX_H`, `PLAYER_SPECIAL_HITBOX_W`, `PLAYER_SPECIAL_HITBOX_H`.

**Hurtbox dimensions (pixels):** `PLAYER_HURTBOX_W`, `PLAYER_HURTBOX_H`, `ENEMY_HURTBOX_W`, `ENEMY_HURTBOX_H`.

**Damage values:** `PLAYER_JAB_DAMAGE`, `PLAYER_PUNCH_DAMAGE`, `PLAYER_KICK_DAMAGE`, `PLAYER_SPECIAL_DAMAGE_MULTIPLIER`, `PLAYER_GRAB_DAMAGE`.

**Knockback:** `PLAYER_LIGHT_KNOCKBACK_X`, `PLAYER_LIGHT_KNOCKBACK_Y`, `PLAYER_HEAVY_KNOCKBACK_X`, `PLAYER_HEAVY_KNOCKBACK_Y`.

**Hit stun:** `LIGHT_HIT_STUN_FRAMES`, `HEAVY_HIT_STUN_FRAMES`, `HIT_STUN_COMBO_INCREMENT`, `HIT_STUN_MAX_FRAMES`.

**Combo:** `COMBO_WINDOW_FRAMES`, `DIMINISHING_STEP`, `DIMINISHING_MIN_FACTOR`, `DAMAGE_FLOOR`.

**Grab:** `GRAB_RANGE`, `GRAB_HEIGHT_TOLERANCE`, `GRAB_INVINCIBILITY_FRAMES`.

#### Scenario: All required constants are exported
- **WHEN** CombatConfig.ts is imported
- **THEN** every constant listed above is accessible via named import

#### Scenario: No magic numbers in combat source
- **WHEN** any combat source file is statically analysed
- **THEN** no numeric literal appears in hitbox/hurtbox rect definitions or damage/stun calculations
