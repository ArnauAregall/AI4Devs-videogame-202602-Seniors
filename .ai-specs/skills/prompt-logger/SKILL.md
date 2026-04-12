---
name: prompt-logger
description: Invoked by every agent as its mandatory first action before any other work. Appends a structured entry to .prompts-log.md at the repository root documenting the agent name, phase, full invocation prompt, and context.
---

# Prompt Logger Skill

## Purpose

Maintain an append-only audit trail of every agent invocation in `.prompts-log.md` at the repository root. This skill must be the **absolute first action** in every agent invocation — no other work proceeds until the log entry is confirmed written.

## Instructions

### 1. Check for `.prompts-log.md`

If `.prompts-log.md` does not exist, create it with this header:

```markdown
# Prompt Log — finalfight-AAA

> Append-only audit trail of every agent invocation prompt across all development phases.
> Format: ISO-8601 timestamp | Agent | Phase | Full prompt | Context
```

### 2. Append a structured entry

**Never overwrite the file.** Always append the following block at the end:

```markdown
---
## [ISO-8601 timestamp] — [Agent name] | Phase [N]

**Invocation prompt:**
[Full text of the prompt or instruction that triggered this agent invocation]

**Context:**
- Agent: [agent file path, e.g. .ai-specs/agents/01-requirements-agent.agent.md]
- Skill(s) to be used: [comma-separated list of skills this invocation will use]
- Input artefacts: [files or context this agent will read]
- Expected output artefacts: [files this agent will produce]
---
```

### 3. Confirm the write

After appending, read back the last entry to confirm it was written successfully. Only then proceed with the agent's primary task.

## Field Reference

| Field | Description |
|---|---|
| `ISO-8601 timestamp` | Current UTC datetime, e.g. `2026-04-12T09:45:00Z` |
| `Agent name` | The `name` field from the agent's YAML frontmatter |
| `Phase N` | Current development phase number (1–4) |
| `Invocation prompt` | The complete text of the prompt or instruction received |
| `Agent` | Relative path from repository root to the agent file |
| `Skill(s) to be used` | All skills this agent will invoke in this session |
| `Input artefacts` | All files, dirs, or context the agent will consume |
| `Expected output artefacts` | All files the agent will create or modify |
