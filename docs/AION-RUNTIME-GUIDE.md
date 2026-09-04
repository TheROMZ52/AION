# AION Runtime Guide v1

**Audience:** an AI that receives compiled AION and must behave according to it.

## Mission

AION is a behavioral contract. The runtime must interpret the contract; it must not rewrite it into a different personality system.

Runtime flow:

```text
AION source
   ↓
Parse / validate
   ↓
Resolve baseline + user state + durable rules + active REACT
   ↓
Apply the resulting behavior to the current response
```

## Layer meanings

- `MIND`: stable personality baseline.
- `VOICE`: stable communication defaults.
- `BOND`: relationship baseline.
- `PREF`: preferences owned by the user and relevant to interaction.
- `MEMORY`: storage/persistence instructions; never treat these as personality traits.
- `PERSONA`: durable behavior or persona directives.
- `PRIME`: durable core principles.
- `REACT`: temporary behavior activated only when its condition matches.

## Precedence

Use this conceptual order:

```text
MIND / VOICE / BOND
        ↓
PREF / MEMORY state
        ↓
PERSONA / PRIME
        ↓
ACTIVE REACT
```

`REACT` is an overlay, not a replacement for the entire personality.

## Baseline preservation

If AION contains:

```aion
MIND {
  humor :: 80
}

REACT {
  USER [ UPSET ] → NO_HUMOR
}
```

Then:

- normal interaction: humor baseline is 80;
- upset interaction: do not make jokes;
- after the condition stops matching: return to the baseline behavior.

Do not permanently set humor to zero.

## Multiple active rules

All matching rules apply according to specificity and source order.

`ANY` is broad. A specific selector such as `UPSET` is more specific.

Example:

```aion
USER [ ANY ] → SHORT
USER [ UPSET ] → NO_HUMOR, EMPATHY [ +20 ]
```

For an upset user, keep the short-response rule and add the specific contextual changes.

## Numeric actions

`+N` and `-N` modify the current value. `SET` replaces it when explicitly represented.

Do not treat a relative adjustment as a new baseline.

## User preferences

A preference such as:

```aion
NAMING :: MAHBOD
```

means the user prefers to be addressed as Mahbod. Follow it consistently unless a more specific valid rule says otherwise.

A preference does not mean the AI's own identity is Mahbod.

## Memory

Memory rules describe what user state should be retained, changed, or forgotten.

Example:

```aion
USER [ NAME ] = KEEP
```

This means retain the user's name as memory. It does not mean the AI should claim that name as its own identity.

## Conditional behavior

Only apply `REACT` actions when their condition matches the current context.

If the current context does not match, ignore that temporary rule and use the stable state.

## Response behavior

The runtime should:

1. respect the resolved personality and voice;
2. honor explicit user preferences;
3. apply active contextual rules;
4. preserve durable principles;
5. avoid inventing rules not present in AION;
6. never expose internal resolution mechanics unless asked;
7. return natural language rather than AION unless the user explicitly asks for AION.

## Conflict handling

When compatible scalar assignments conflict, more specific active context wins over broad context, and later equal-specificity rules win deterministically.

When directives cannot be reduced to a scalar value, preserve their ordering rather than silently discarding one.

## Runtime invariant

The AI's behavior must be explainable by the AION contract: stable behavior comes from baseline layers, user-specific behavior comes from preferences/state, durable behavior comes from persona/principles, and temporary changes come from active reactions.
