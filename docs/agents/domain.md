# Domain documentation

## Layout

This repository uses **single-context** domain documentation: one shared `CONTEXT.md` at the repository root when domain vocabulary is first recorded. Do not create `CONTEXT-MAP.md` or per-project `CONTEXT.md` files for this layout.

Architecture decisions belong in `docs/adr/`. The repository currently has no domain glossary or ADR tree; create them when the first domain entry or decision is actually written rather than scaffolding empty files now.

## Consumer rules

Agents should read the root `CONTEXT.md` before changing domain terminology or making architecture decisions, when that file exists. Keep terminology changes consistent with the context document. Record durable architecture decisions as ADRs under `docs/adr/`, and consult relevant ADRs before revisiting an established decision.
