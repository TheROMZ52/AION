# AION

AI Oriented Interaction Notation — a compact language for describing AI personality, communication, relationships, preferences, memory, context-sensitive behavior, and durable principles.

## Status

AION currently has a deterministic parser → semantic analysis → IR → printer/prompt pipeline, plus contextual runtime resolution for `REACT` rules.

## Language layers

- `MIND` — baseline AI personality
- `VOICE` — communication style
- `BOND` — relationship model
- `PREF` — user-owned preferences
- `MEMORY` — persistent/session state
- `PERSONA` — durable behavioral rules
- `PRIME` — durable principles
- `REACT` — temporary context-dependent overrides

## Runtime model

`MIND` defines the baseline. `REACT` is evaluated against the current context and overlays the baseline without mutating it. Broad `ANY` rules apply before more specific selectors so specific behavior can override broad behavior.

## Development

```bash
npm install
npm run build
```

The project is deployed through Vercel from the `main` branch.
