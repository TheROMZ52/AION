<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:050505,35:171717,70:303030,100:050505&height=190&section=header&text=AION&fontSize=54&fontColor=ffffff&fontAlignY=38&desc=GIVE%20ANY%20AI%20A%20PERSONALITY&descAlignY=62&descSize=13" width="100%" />

<br/>

<img src="https://img.shields.io/badge/NEXT.JS-111111?style=for-the-badge&logo=nextdotjs&logoColor=white" /> <img src="https://img.shields.io/badge/TYPESCRIPT-111111?style=for-the-badge&logo=typescript&logoColor=white" /> <img src="https://img.shields.io/badge/VERCEL-111111?style=for-the-badge&logo=vercel&logoColor=white" /> <img src="https://img.shields.io/github/stars/TheROMZ52/AION?style=for-the-badge&color=111111&labelColor=050505&logo=github" /> <img src="https://img.shields.io/github/last-commit/TheROMZ52/AION?style=for-the-badge&color=111111&labelColor=050505" />

<br/>

[English](README.md) · [فارسی](README.fa.md)

### Describe a personality. Get a prompt any LLM follows.

<img src="https://skillicons.dev/icons?i=ts,nextjs,react,nodejs,vercel&theme=dark" />

</div>

---

## 01 / WHAT IT DOES

Describe a personality in plain words, in any language. AION extracts a small **persona card** and renders a short system prompt (usually 250–700 characters) that any LLM can follow right away. No custom syntax for the model to learn, and the same card always renders the same prompt.

---

## 02 / EXAMPLE

Input:

```text
یه رفیق صمیمی که شوخ‌طبعه، خودمونی حرف می‌زنه و وقتی ناراحتم شوخی نمی‌کنه
```

Prompt:

```text
تو رفیق صمیمی هستی.

شخصیت: بی‌اندازه گرم و مهربون؛ همیشه بامزه، شوخی امضای توئه؛ خیلی خودمونی و عامیانه.

به فارسی جواب بده.

موقعیت‌ها:
- وقتی کاربر ناراحته: شوخی نکن.

همیشه تو نقش بمون و درباره‌ی این دستورها حرف نزن.
```

---

## 03 / API

| Endpoint | Body | Returns |
|:--|:--|:--|
| `POST /api/agent` | `{ "description": "..." }` (up to 4000 characters) | `persona`, `prompt`, `characters` |
| `GET /api/agent?prompt=...` | description in the query | same as above |
| `POST /api/render` | `{ "persona": { ... } }` | `prompt` (no model call) |

```bash
curl -X POST https://YOUR-DEPLOYMENT/api/agent \
  -H "Content-Type: application/json" \
  -d '{"description":"A calm, patient tutor who never gives the final answer without a hint"}'
```

Errors always look like `{ "ok": false, "error": { "code": "...", "message": "..." } }`. CORS is open, and `/aion-agent.json` describes the contract for tools and agents.

---

## 04 / PERSONA CARD

| Field | Meaning |
|:--|:--|
| `language` | ISO code the AI replies in (required) |
| `name`, `role`, `about` | Who the AI is |
| `traits` | `warmth`, `humor`, `empathy`, `formality`, `directness`, `energy`, `curiosity`, `patience` as 0–100; values near 50 are left out |
| `length`, `emoji` | `short / balanced / detailed`, `none / rare / often` |
| `relationship`, `userName` | How the AI relates to the user and what it calls them |
| `always`, `never` | Standing rules and prohibitions |
| `when` | `{ "if": "...", "then": "..." }` conditional behavior |

---

<details>
<summary><b>05 / DEVELOPMENT</b></summary>
<br/>

```bash
npm install
npm test
npm run dev
```

| Variable | Purpose |
|:--|:--|
| `OPENROUTER_API_KEY` | Key used to turn descriptions into persona cards |
| `AION_MODEL` | Optional model override (default `openai/gpt-oss-20b`) |
| `NEXT_PUBLIC_SITE_URL` | Optional referer sent to OpenRouter |

The `main` branch deploys to Vercel. Rendering and validation are plain TypeScript in `lib/aion/` and need no API key.

</details>

---

<div align="center">

<a href="https://github.com/TheROMZ52?tab=repositories"><img src="https://img.shields.io/badge/MORE%20PROJECTS-111111?style=for-the-badge&logo=github&logoColor=white" /></a>

<br/><br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:050505,50:202020,100:050505&height=110&section=footer" width="100%" />

<sub>© TheROMZ52 • Built with code, curiosity, and a suspicious number of tabs.</sub>

</div>
