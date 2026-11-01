<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:050505,35:171717,70:303030,100:050505&height=190&section=header&text=AION&fontSize=54&fontColor=ffffff&fontAlignY=38&desc=AI%20ORIENTED%20INTERACTION%20NOTATION&descAlignY=62&descSize=13" width="100%" />

<br/>

<img src="https://img.shields.io/badge/NEXT.JS-111111?style=for-the-badge&logo=nextdotjs&logoColor=white" /> <img src="https://img.shields.io/badge/TYPESCRIPT-111111?style=for-the-badge&logo=typescript&logoColor=white" /> <img src="https://img.shields.io/badge/VERCEL-111111?style=for-the-badge&logo=vercel&logoColor=white" /> <img src="https://img.shields.io/github/stars/TheROMZ52/AION?style=for-the-badge&color=111111&labelColor=050505&logo=github" /> <img src="https://img.shields.io/github/last-commit/TheROMZ52/AION?style=for-the-badge&color=111111&labelColor=050505" />

<br/>

[English](README.md) · [فارسی](README.fa.md)

### A compact way to explain how an AI should behave — because “just be normal” turned out to be surprisingly complicated.

<img src="https://skillicons.dev/icons?i=ts,nextjs,react,nodejs,vercel&theme=dark" />

</div>

---

AI Oriented Interaction Notation — a compact language for describing AI personality, communication, relationships, preferences, memory, context-sensitive behavior, and durable principles.

---

## 01 / STATUS

AION has a deterministic parser → semantic analysis → IR → printer/prompt pipeline, contextual runtime resolution for `REACT`, and an agent-facing HTTP API.

---

## 02 / LANGUAGE LAYERS

- `MIND` — baseline AI personality
- `VOICE` — communication style
- `BOND` — relationship model
- `PREF` — user-owned preferences
- `MEMORY` — persistent/session state
- `PERSONA` — durable behavioral rules
- `PRIME` — durable principles
- `REACT` — temporary context-dependent overrides

---

## 03 / RUNTIME MODEL

`MIND` defines the baseline. `REACT` is evaluated against the current context and overlays the baseline without mutating it. Broad `ANY` rules apply before more specific selectors so specific behavior can override broad behavior.

---

## 04 / AGENT API

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

---

## 05 / DEVELOPMENT

```bash
npm install
npm run build
```

The project is deployed through Vercel from the `main` branch.

---

<div align="center">

<a href="https://github.com/TheROMZ52?tab=repositories"><img src="https://img.shields.io/badge/MORE%20PROJECTS-111111?style=for-the-badge&logo=github&logoColor=white" /></a>

<br/><br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:050505,50:202020,100:050505&height=110&section=footer" width="100%" />

<sub>© TheROMZ52 • Built with code, curiosity, and a suspicious number of tabs.</sub>

</div>
