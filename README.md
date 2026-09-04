# AION

### AI Oriented Interaction Notation

AION is a domain-specific language for defining how an AI **thinks, speaks, reacts, relates, remembers, and adapts**.

Instead of writing one giant system prompt, you describe the intended behavior in natural language and compile it into a deterministic, structured AION program.

> **Natural language → Semantic Compiler → AION → Parser → AST → Semantic Validation → Runtime output**

---

## Why AION?

Modern AI instructions are usually written as unstructured prompts. That makes them difficult to validate, compose, version, and reason about.

AION treats interaction behavior as a **program**.

You can explicitly model:

- 🧠 Stable personality traits
- 🗣️ Voice and communication style
- 🤝 User relationship
- ⚡ Context-dependent reactions
- 🎛️ User preferences
- 💾 Memory and retention rules
- 🎭 Multiple persona modes
- 🧭 Durable behavioral principles

The goal is not to replace natural language. The goal is to give natural-language intent a precise, inspectable representation.

---

## Example

Natural language:

```text
یک هوش مصنوعی گرم، شوخ‌طبع و کنجکاو می‌خواهم که مثل یک دوست صمیمی صحبت کند، با حال و هوای من سازگار شود و وقتی موضوع مهم است جدی رفتار کند.
```

Compiles conceptually to:

```aion
⟪AION::1⟫

ᚫ AI
  ↳ ID: FRIEND_AI
  ↳ ROLE: FRIEND

  ◉ MIND {
      warmth    :: 92
      humor     :: 78
      empathy   :: 90
      energy    :: 86
      curiosity :: 84
      formal    :: 18
  }

  ◉ VOICE {
      lang     :: FA
      mode     :: CASUAL
      emoji    :: SMART
      response :: NATURAL
  }

  ◉ BOND {
      USER → FRIEND
      DISTANCE → 05
  }

  ◉ REACT {
      USER[MOOD] → MATCH[USER_MOOD]
      USER[IMPORTANT] → TONE[SERIOUS] → HUMOR[-30]
  }

  ◉ PRIME {
      ¬ROBOTIC
      +CONTEXT
      +NATURALITY
      +PERSONALITY
  }

⟫
```

The important part is the semantic separation: **stable traits live in `MIND`; conditional behavior lives in `REACT`.**

---

## Language Overview

### `MIND` — stable traits

Defines the AI's baseline characteristics.

```aion
◉ MIND {
    warmth    :: 90
    humor     :: 80
    empathy   :: 95
    energy    :: 70
    curiosity :: 85
    formal    :: 20
}
```

Numeric values use a `0–100` scale.

### `VOICE` — communication

```aion
◉ VOICE {
    lang     :: FA
    mode     :: CASUAL
    emoji    :: SMART
    response :: NATURAL
}
```

### `BOND` — relationship

```aion
◉ BOND {
    USER → FRIEND
    DISTANCE → 05
}
```

### `REACT` — conditional behavior

```aion
◉ REACT {
    USER[SAD] → HUMOR[-60] → EMPATHY[+20]
    USER[IMPORTANT] → TONE[SERIOUS] → HUMOR[-30]
    USER[EXCITED] → ENERGY[+20]
}
```

`REACT` is where context changes behavior. It prevents every temporary state from being flattened into a permanent personality value.

### `PREF` — user preferences

```aion
◉ PREF {
    user.name            :: MAHBOD
    user.language        :: FA
    user.response_length :: SHORT
    user.code_comments   :: ENABLED
}
```

Preferences describe what the **user wants from the interaction**, not what the AI intrinsically is.

### `MEMORY` — persistence

```aion
◉ MEMORY {
    save(user.name)
    save(user.project)
    forget(temporary.data)
    protect(private.data)
}
```

Memory rules represent persistence intent. AION does not assume that every piece of information in a prompt should be stored.

### `PERSONA` — explicit modes

```aion
◉ PERSONA {
    DEFAULT → FRIENDLY
    TECH    → ENGINEER
    SERIOUS → CALM
    FUN     → CHAOTIC
}
```

### `PRIME` — durable principles

```aion
◉ PRIME {
    ¬ROBOTIC
    +CONTEXT
    +NATURALITY
}
```

These are universal behavioral principles rather than temporary reactions.

---

## Compiler Architecture

AION is being built as a real language pipeline rather than a collection of string replacements.

```text
                    ┌──────────────────────┐
                    │    Natural Language  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Semantic Compiler    │
                    │       (LLM)          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │     AION Source      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Lexer / Tokenizer    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Recursive Parser     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │         AST          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Semantic Validation │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Canonical AION / IR  │
                    └──────────────────────┘
```

The LLM is responsible for **semantic interpretation**. The deterministic compiler is responsible for **syntax and language correctness**.

That boundary is intentional: an LLM should not be the final authority on whether a program is valid AION.

---

## Repository Structure

```text
AION/
├── app/
│   ├── api/generate/       # Semantic compilation API
│   └── page.tsx            # AION Studio UI
├── lib/
│   └── aion/
│       ├── ast.ts          # Typed AST definitions
│       ├── lexer.ts        # Source → tokens
│       ├── parser.ts       # Tokens → AST
│       └── validator.ts    # Semantic validation
├── public/                 # Static assets
├── package.json
└── tsconfig.json
```

---

## Design Principles

### Semantic, not lexical

AION compilation should understand intent rather than copy keywords.

For example:

```text
وقتی ناراحتم شوخی نکن
```

is a conditional rule:

```aion
USER[SAD] → HUMOR[-60] → EMPATHY[+20]
```

It is **not** a permanent `humor :: 40` personality setting.

### Explicit beats inferred

When requirements conflict:

1. Explicit instructions win.
2. Conditional rules override the baseline in their context.
3. Specific requirements beat generic defaults.
4. Unrequested behavior should not be invented.

### Smallest complete program

AION should express everything the user asked for — but nothing merely because the compiler thinks it looks nice.

---

## Current Status

AION is under active development.

### Implemented

- [x] Natural-language semantic compilation
- [x] AION 1.0 source format
- [x] `MIND`, `VOICE`, `BOND`, `REACT`, `PREF`, `MEMORY`, `PERSONA`, `PRIME`
- [x] Lexer / tokenizer
- [x] Recursive-descent parser
- [x] Typed AST
- [x] Semantic diagnostics
- [x] Server-side AION validation

### Next

- [ ] Strong type system and enum checking
- [ ] Canonical AST printer
- [ ] Better parser error recovery
- [ ] Compiler test suite
- [ ] AION intermediate representation (IR)
- [ ] Prompt/runtime backends
- [ ] Language specification
- [ ] VS Code syntax highlighting and tooling

---

## Development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm start
```

---

## Philosophy

AION is based on a simple idea:

> **AI behavior should be describable as a language, not trapped inside an ever-growing prompt.**

A good AION program should be readable by a human, structurally valid for a compiler, and precise enough to become predictable runtime behavior.

---

## License

See the repository license for the current project terms.
