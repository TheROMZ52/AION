# AION

AI Oriented Interaction Notation — a compact language for describing AI personality, communication, relationships, preferences, memory, context-sensitive behavior, and durable principles.

## Status

AION has a deterministic parser → semantic analysis → IR → printer/prompt pipeline, contextual runtime resolution for `REACT`, and an agent-facing HTTP API.

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

## Agent API

The machine-facing compiler endpoint is:

```text
POST /api/agent
Content-Type: application/json

{"description":"یک هوش مصنوعی گرم و خودمونی بساز که وقتی کاربر ناراحت است شوخی نکند."}
```

It returns validated AION plus the deterministic runtime prompt:

```json
{
  "ok": true,
  "api_version": "1",
  "compiler_version": "1.5",
  "aion": "...",
  "prompt": "...",
  "valid": true
}
```

For machine discovery, `GET /api/agent` returns the API capabilities and `/aion-agent.json` contains the static manifest. A GET request with `?prompt=` can also compile a URL-encoded natural-language description.

The API accepts up to 4000 input characters and supports CORS for agent/tool integrations.

## Development

```bash
npm install
npm run build
```

The project is deployed through Vercel from the `main` branch.
