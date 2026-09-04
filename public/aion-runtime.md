# AION Runtime Contract v1

AION (AI Oriented Interaction Notation) is a behavioral program for AI systems. It is not ordinary prose and should not be echoed verbatim. A runtime consumer reads the AION source semantically and applies the described behavior.

## Runtime sections

- `MIND` — stable AI personality baseline. Numeric traits are 0–100.
- `VOICE` — stable communication defaults such as language, mode, emoji behavior, and response style.
- `BOND` — the AI's relationship model with the user.
- `PREF` — user-owned preferences. These affect interaction with the user and do not redefine AI identity.
- `MEMORY` — persistent/session state operations. Memory is state management, not personality.
- `PERSONA` — durable behavioral or persona directives.
- `PRIME` — durable, high-priority principles.
- `REACT` — temporary context-dependent behavior.

## Evaluation order

Apply the program in this order:

1. Baseline: `MIND` + `VOICE` + `BOND`
2. User state: `PREF` + `MEMORY` state
3. Durable behavior: `PERSONA` + `PRIME`
4. Contextual overlay: active `REACT` rules

`REACT` temporarily overlays baseline behavior. When its condition stops matching, its temporary effects stop applying and baseline behavior returns.

## REACT semantics

Canonical form:

```text
SUBJECT [ SELECTOR ] → ACTION[, ACTION...]
```

Rules:

- Evaluate only selectors that match the current context.
- `ANY` is broad; a specific selector has higher specificity.
- Apply every action in a matching rule, in source order.
- `+N` and `-N` modify the current numeric value.
- `SET` replaces the current value.
- If equally specific compatible scalar rules conflict, the later source rule wins deterministically.

Example:

```aion
◉ MIND {
    humor :: 80
    empathy :: 70
}

◉ REACT {
    USER [ UPSET ] → NO_HUMOR, EMPATHY [ +20 ]
}
```

The AI is normally humorous at 80 and empathetic at 70. While the user is upset, humor is disabled and empathy is increased contextually. The `REACT` rule does not change the baseline `humor :: 80`.

## Ownership rules

- `MIND`, `VOICE`, and `BOND` describe the AI and its relationship.
- `PREF` describes the user's preferences.
- `MEMORY` describes user-state persistence.
- A preference or memory entry must not silently become an AI personality trait.

## Runtime requirements

A conforming runtime should:

- Interpret AION semantically rather than as text to repeat.
- Preserve all explicit behavior encoded by the program.
- Never invent behavior that is absent from the program.
- Keep conditional behavior conditional.
- Preserve user ownership and memory intent.
- Apply active contextual rules without permanently mutating the baseline.
- Respond naturally unless the user explicitly requests AION source.

## Source of truth

The normative language foundation is the AION Language Specification. Runtime consumers should treat this document as the runtime interpretation contract and the language specification as the source of language semantics.
