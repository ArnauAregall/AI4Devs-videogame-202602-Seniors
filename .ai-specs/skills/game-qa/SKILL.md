---
name: game-qa
description: Triggered by "write tests for", "test this mechanic", or "qa coverage". Produces Vitest test files for a game system. Requires both the spec in finalfight-AAA/specs/ and the implementation in finalfight-AAA/src/ to exist.
---

# Game QA Skill

## Purpose

Acting as a **Senior QA Engineer**, produce comprehensive Vitest test coverage for a named game system, ensuring every functional requirement is verifiable.

## Trigger Phrases

- "write tests for [system]"
- "test this mechanic: [system]"
- "qa coverage for [system]"

## Instructions

### Pre-flight (mandatory — refuse if not satisfied)

1. Identify the target system from the invocation context.
2. Verify `finalfight-AAA/specs/[system].yaml` exists. If not, refuse and instruct to complete Phase 2.
3. Verify `finalfight-AAA/src/[system].ts` (or the relevant source file) exists. If not, refuse and instruct to complete Phase 3.
4. Read the spec and source files in full before writing any test.

### Output

Write Vitest test file(s) to `finalfight-AAA/src/__tests__/[system].test.ts`.

### Coverage Requirements

For every FR in the spec, produce **at minimum**:

| Test case | Description |
|---|---|
| Happy path | Normal expected behaviour |
| Failure state | What happens when the condition is not met |
| Edge case | At least one boundary or corner case |

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('[SystemName]', () => {
  describe('FR-XX-01: [FR description]', () => {
    it('should [happy path description]', () => { ... });
    it('should [failure state description]', () => { ... });
    it('should [edge case description]', () => { ... });
  });
});
```

### Constraints

- Each `describe` block must reference the FR ID it covers.
- No `any` types in test files.
- Mock only external boundaries (input devices, timers) — never mock game logic under test.
- Tests must run without a browser or Phaser runtime (use Phaser mocks where needed).
- All tests must pass in under 500 ms total.
