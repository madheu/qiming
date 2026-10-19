# Learnings

Corrections, insights, and knowledge gaps captured during development.

**Categories**: correction | insight | knowledge_gap | best_practice

---

## [LRN-20261008-001] correction

**Logged**: 2026-10-08
**Priority**: high
**Status**: pending
**Area**: frontend

### Summary
The naming feature should use a one-shot rule-guided agent rather than a large hardcoded final-name database.

### Details
The earlier execution plan drifted toward maintaining hundreds of precomposed Chinese names and relation rows. The user correctly identified that this looks hardcoded and does not model name composition. A better approach is a one-shot structured generation agent with explicit cultural rules, schema validation, and a small deterministic fallback.

### Suggested Action
Use an agent that returns JSON only; keep the browser UI and validation deterministic. Do not expose provider keys in the static site. Add schema checks, retries for invalid JSON, prompt-injection resistance, and a fallback path when the model/API is unavailable.

### Metadata
- Source: user_feedback
- Related Files: name-data.js, given-names.js
- Tags: naming-engine, llm, architecture, simplify
- Pattern-Key: naming.llm-over-hardcoded-catalog
- Recurrence-Count: 1

---
