## 1. Verify Fixed-Timestep Polling Contract

- [x] 1.1 Confirm `PlayerController.fixedUpdate()` calls `InputManager.poll()` exactly once per tick and is registered in GameScene's fixed-timestep accumulator loop
- [x] 1.2 Add a test verifying `poll()` is invoked once per fixed-timestep tick (not per render frame)

## 2. Validate Default Keyboard Mapping Coverage

- [x] 2.1 Add test cases for all default key bindings: Arrow keys (LEFT/RIGHT/UP/DOWN), WASD (A/D/W/S), Z/J (lightAttack), X/K (heavyAttack), C/L (grab), Space (jump), Enter (specialAttack)
- [x] 2.2 Add test verifying both keys in each pair trigger the same action simultaneously

## 3. Spec Sync

- [x] 3.1 Archive the delta spec into `openspec/specs/input-manager/spec.md` with the strengthened fixed-timestep polling requirement
