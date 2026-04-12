## MODIFIED Requirements

### Requirement: FR-SM-02 Scroll-trigger locking
When the camera reaches a scroll-trigger world position, the StageManager SHALL lock camera advance and activate the associated spawn zone. When the activated zone emits `'zoneCleared'`, the StageManager SHALL immediately set `_locked = false` — unconditionally, regardless of how many other zones remain. Each subsequent scroll trigger will re-lock the camera when reached.

#### Scenario: Camera locks at trigger
- **WHEN** `cameraX + CANVAS_WIDTH >= trigger.worldX` for an unfired trigger
- **THEN** camera advance is suspended and the spawn zone is activated

#### Scenario: Camera unlocks when active zone cleared
- **WHEN** the most-recently-activated spawn zone emits `'zoneCleared'`
- **THEN** `StageManager._locked` is set to `false` and camera advance resumes immediately

#### Scenario: Partial stage progress still unlocks gate
- **WHEN** zone-1a (first of three zones) clears all enemies
- **THEN** the stage gate unlocks and the player can walk rightward to the next trigger

#### Scenario: Camera re-locks at next trigger
- **WHEN** the player advances to the next scroll trigger after gate unlock
- **THEN** `_locked` becomes `true` again and the next zone activates
