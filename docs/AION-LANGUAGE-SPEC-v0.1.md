# AION Language Specification v0.1

**Status:** Draft / normative foundation  
**Language:** AION 1  
**Purpose:** Define the semantic contract between AION source, the compiler, and a runtime/LLM consumer.

## 1. Core model

AION describes an AI's stable identity, baseline personality, communication style, relationship with the user, persistent user state, durable behavioral rules, and contextual reactions.

The compiler MUST preserve explicit user intent. It MUST NOT invent stronger personality traits merely because a rule mentions a contextual exception.

## 2. Sections

| Section | Ownership | Lifetime | Meaning |
|---|---|---|---|
| `MIND` | AI | baseline | Stable personality dimensions |
| `VOICE` | AI | baseline | Stable communication settings |
| `BOND` | AI/User relationship | baseline | Relationship model |
| `PREF` | User | persistent | User-owned preferences |
| `MEMORY` | User state | persistent/session | Memory operations |
| `PERSONA` | AI | durable | Explicit behavioral/persona directives |
| `PRIME` | AI | durable | Highest-priority durable principles |
| `REACT` | Context | temporary | Context-dependent behavioral overrides |

## 3. Baseline semantics

`MIND`, `VOICE`, and `BOND` define the default state when no contextual rule overrides it.

A contextual exception MUST NOT be lowered into a baseline value unless the source explicitly states that baseline behavior.

Example:

```aion
humor :: 70
USER [ UPSET ] → NO_HUMOR
```

This means the baseline humor is `70`; `NO_HUMOR` applies only while the `UPSET` condition matches. It MUST NOT become `humor :: 0`.

## 4. User-owned state

### PREF

`PREF` stores preferences belonging to the user. Preferences affect future interaction but do not redefine the AI's intrinsic personality.

Example:

```aion
NAMING :: MAHBOD
RESPONSE_LENGTH :: SHORT
```

### MEMORY

`MEMORY` describes persistence operations rather than behavioral personality.

Supported operations:

- `KEEP` — retain the referenced user state.
- `SET [ value ]` — persist a value.
- `FORGET` — remove the referenced state.

Example:

```aion
USER [ NAME ] = KEEP
USER [ PREFERENCES ] = KEEP
```

A memory operation MUST NOT be treated as a personality override.

## 5. REACT semantics

`REACT` rules are evaluated against runtime context and are ephemeral. They MUST NOT mutate the baseline IR.

Canonical form:

```aion
SUBJECT [ SELECTOR ] → ACTION[, ACTION...]
```

Examples:

```aion
USER [ UPSET ] → NO_HUMOR, EMPATHY [ +20 ]
TOPIC [ IMPORTANT ] → SERIOUS
```

All actions in a matching rule MUST be preserved and evaluated. A compiler MUST NOT discard later actions in a chain.

## 6. Matching

`ANY` is a wildcard selector and matches when the subject has any current value.

More specific selectors take precedence over `ANY` rules when both match.

Example:

```aion
USER [ ANY ] → SHORT
USER [ UPSET ] → NO_HUMOR
```

For an upset user, both rules apply. The broad rule establishes `SHORT`; the specific rule adds the contextual override.

## 7. Rule precedence

The semantic precedence model is:

```text
BASELINE
  MIND / VOICE / BOND
        ↓
USER STATE
  PREF / MEMORY
        ↓
DURABLE BEHAVIOR
  PERSONA / PRIME
        ↓
CONTEXTUAL OVERLAY
  REACT
```

`REACT` is the final behavioral overlay because it represents temporary context.

`MEMORY` is state storage and therefore MUST NOT be interpreted as a behavioral override simply because it appears in the precedence model.

Within `REACT`, broad rules (`ANY`) are applied before specific selectors. Later specific actions can override earlier compatible assignments.

## 8. Conflict resolution

When two rules target the same runtime property:

1. A contextual `REACT` assignment overrides the baseline value while its condition matches.
2. A more specific matching `REACT` selector overrides a broader matching selector.
3. Multiple actions in the same rule are all applied in source order.
4. Numeric `+N` and `-N` actions modify the current value.
5. A direct `SET` action replaces the current value.
6. If two equally specific rules conflict, source order is deterministic: the later rule wins for compatible scalar assignments.
7. Directives that cannot be represented as scalar state remain ordered directives and are not silently collapsed.

## 9. Compiler guarantees

A conforming AION semantic compiler SHOULD guarantee:

- Every explicit requirement from the natural-language input is represented somewhere in AION.
- Conditional behavior remains conditional.
- User preferences remain user-owned.
- Memory intent remains persistent state intent.
- Baseline personality is not inferred from contextual exceptions.
- Multiple actions are preserved.
- Ambiguous concepts are represented conservatively rather than invented.
- Canonical output is deterministic.

## 10. LLM generation contract

The LLM semantic compiler is a translation stage, not the runtime.

It MUST:

1. Identify entities, baseline traits, communication preferences, user preferences, memory requirements, durable principles, and contextual conditions.
2. Classify each requirement into the appropriate AION section.
3. Preserve condition/action relationships.
4. Avoid duplicating the same semantic requirement across unrelated sections unless the source explicitly requires both meanings.
5. Avoid assigning a baseline value solely from an exception rule.
6. Prefer explicit, conservative values when the source gives insufficient evidence for a precise numeric trait.

## 11. Versioning

This document defines **AION Language Specification v0.1**. Changes to grammar, section ownership, precedence, or semantic meaning require a specification version update and corresponding compiler tests.
