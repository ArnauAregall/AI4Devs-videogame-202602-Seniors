# hurtbox-component Specification

## Purpose
TBD - created by archiving change combat-system. Update Purpose after archive.
## Requirements
### Requirement: Hurtbox registration and deregistration
Every damageable character SHALL register a hurtbox with the CombatSystem via `registerHurtbox(id, rect, teamTag)` on creation and call `removeHurtbox(id)` on death or scene shutdown. The hurtbox represents the character's vulnerable rectangular region in world-space. References: FR-CS-02.

#### Scenario: Registered hurtbox is targetable
- **WHEN** a character registers a hurtbox
- **THEN** it is included in the per-tick overlap checks

#### Scenario: Removed hurtbox is no longer targetable
- **WHEN** removeHurtbox is called for a given id
- **THEN** subsequent ticks do not check that hurtbox

### Requirement: Invincible state suppresses hurtbox
The HurtboxComponent SHALL support an `invincible` flag. While invincible, the hurtbox is excluded from the overlap detection loop. References: FR-CS-15.

#### Scenario: Invincible character cannot be hit
- **WHEN** a character's hurtbox is marked invincible
- **THEN** hitbox-hurtbox overlaps on that hurtbox produce no HitEvent

#### Scenario: Invincibility ends and hurtbox becomes active again
- **WHEN** the invincible flag is cleared
- **THEN** the hurtbox participates normally in the next tick's overlap checks

