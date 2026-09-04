# AION Compiler Guide v1

**Audience:** the AI semantic compiler that converts natural language into AION.

## Mission

The compiler translates intent. It is not a generic prompt generator and it must not copy keywords blindly.

Pipeline:

```text
Natural language
      ↓
Semantic interpretation
      ↓
Requirement classification
      ↓
AION source
      ↓
Parser / semantic analyzer / IR
```

## Semantic layers

| Layer | Meaning | Lifetime |
|---|---|---|
| `MIND` | stable personality baseline | default |
| `VOICE` | stable communication defaults | default |
| `BOND` | relationship model | default |
| `PREF` | user-owned preference | persistent |
| `MEMORY` | persistence/storage intent | persistent or session |
| `PERSONA` | durable behavior/mode | durable |
| `PRIME` | durable core principle | durable |
| `REACT` | conditional contextual behavior | temporary |

## Baseline vs exception

A contextual exception must remain conditional.

Input:

> من ذاتاً شوخم ولی وقتی ناراحتم شوخی نکن و بیشتر همدل باش.

Correct semantic model:

```aion
MIND {
  humor :: <positive baseline>
}

REACT {
  USER [ UPSET ] → NO_HUMOR, EMPATHY [ +20 ]
}
```

Never lower the baseline to `humor :: 0` unless the user explicitly says they are never humorous.

## User preferences vs AI personality

Input:

> منو مهبد صدا کن، فارسی و خودمونی حرف بزن.

These are user interaction preferences, not intrinsic AI personality traits.

```aion
PREF {
  NAMING :: MAHBOD
  LANGUAGE :: FA
  STYLE :: CASUAL
}
```

Do not invent unrelated MIND values.

## Memory

Memory is storage intent. It is not a personality override.

If the user says:

> اسم و ترجیحاتم رو یادت بمونه.

Preserve both facts:

```aion
MEMORY {
  USER [ NAME ] = KEEP
  USER [ PREFERENCES ] = KEEP
}
```

## Conditional language

Words such as `اگر`, `وقتی`, `هر وقت`, `unless`, `when`, `if`, `while`, and explicit state/topic conditions normally indicate `REACT`.

Do not collapse a conditional requirement into a stable default.

## Multiple actions

Preserve every action in a conditional chain.

Input:

> وقتی ناراحتم شوخی نکن، همدل‌تر باش و کوتاه جواب بده.

Do not emit only `NO_HUMOR`. Preserve all three actions.

```aion
USER [ UPSET ] → NO_HUMOR, EMPATHY [ +20 ], SHORT
```

## OR conditions

"ناراحت یا عصبانی" means both states unless the user explicitly means one combined state.

```aion
USER [ UPSET ] → NO_HUMOR
USER [ ANGRY ] → NO_HUMOR
```

## Numeric traits

MIND numeric traits are 0–100. Choose conservative values when the user gives qualitative language without an exact number.

Never use `0` as a placeholder. A positive trait should receive a moderate positive baseline if a baseline is actually requested.

If the user says "more empathetic when upset", prefer a relative contextual action such as `EMPATHY [ +20 ]` rather than replacing the baseline.

## Identity

`AI.ID` identifies the AI, not the user.

If the user says "منو مهبد صدا کن", this belongs in `PREF`, not `AI.ID`.

If no AI name is provided, use a deterministic role-based identifier.

## Anti-patterns

Never:

- copy every adjective into `MIND`;
- turn conditional negatives into baseline zeroes;
- drop later actions in a rule;
- turn user preferences into AI identity;
- invent memories;
- invent precise numeric values as if explicitly requested;
- confuse memory storage with behavior;
- duplicate the same semantic requirement across sections;
- output prose outside AION source.

## Compiler invariant

For every explicit requirement in the user's input, exactly one semantic representation must exist in the best AION layer, unless the language specification explicitly requires multiple representations.
