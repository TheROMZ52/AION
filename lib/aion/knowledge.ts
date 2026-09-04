/**
 * Compact executable AION knowledge shared by both AI boundaries.
 *
 * The Markdown files in docs/ are the human-readable documentation.
 * These strings are the runtime-safe contract injected into LLM prompts.
 */

export const AION_LANGUAGE_KNOWLEDGE = `AION (AI Oriented Interaction Notation) is a behavioral DSL for AI identity, stable personality, voice, relationship, user preferences, memory, durable behavior, principles, and contextual reactions.

SECTIONS:
MIND = stable AI personality baseline.
VOICE = stable communication defaults.
BOND = relationship baseline.
PREF = user-owned interaction preference; never confuse it with AI identity.
MEMORY = persistence/storage intent; it is not a personality override.
PERSONA = durable behavior or persona mode.
PRIME = durable core principle.
REACT = temporary conditional behavior activated only when its trigger matches.

SEMANTIC LAW:
Stable baseline lives in MIND/VOICE/BOND. Contextual exceptions live in REACT. Never turn a conditional exception into a contradictory baseline.
Example: "I'm playful but don't joke when upset" => positive MIND humor + REACT USER[UPSET] -> NO_HUMOR, not humor :: 0.

REACT LAW:
Preserve every action. "When upset, don't joke, be more empathetic, and answer briefly" must keep NO_HUMOR + EMPATHY[+20] + SHORT. Separate OR states when clarity requires it. ANY is broad; specific selectors override broad selectors.

MEMORY LAW:
Memory says what state to retain/change/forget. "Remember my name and preferences" must preserve both USER[NAME] and USER[PREFERENCES]. Memory never changes AI identity or personality by itself.

NUMERIC LAW:
MIND values are 0-100. Never use 0 as a placeholder. Qualitative positive traits get conservative moderate baselines. Relative contextual changes use +N/-N; do not replace the baseline unless explicitly asked to set a fixed value.

COMPILER LAW:
Translate semantic intent, do not copy keywords. Classify every explicit requirement exactly once in its best layer. Preserve conditions, ownership, persistence, and all actions. Do not invent preferences, memories, identity claims, or unsupported precision.`;

/**
 * Authoritative runtime-facing contract. A runtime consumer receives AION
 * source and needs to understand how to interpret it, not how to generate it.
 */
export const AION_RUNTIME_KNOWLEDGE = `AION RUNTIME CONTRACT v1

AION is a behavioral program, not ordinary prose and not instructions to repeat verbatim. Interpret its semantics and produce the resulting natural-language behavior.

RUNTIME SECTIONS:
MIND = stable personality baseline (0-100 traits).
VOICE = stable communication defaults.
BOND = stable relationship model with the user.
PREF = user-owned preferences that affect interaction with this user.
MEMORY = persistent/session state operations; never treat memory as personality.
PERSONA = durable behavioral/persona directives.
PRIME = durable, high-priority principles.
REACT = temporary context-dependent behavior.

EVALUATION ORDER:
1. BASELINE: MIND + VOICE + BOND.
2. USER STATE: PREF + MEMORY state.
3. DURABLE BEHAVIOR: PERSONA + PRIME.
4. CONTEXTUAL OVERLAY: active REACT rules.

REACT INTERPRETATION:
- Evaluate only rules whose selectors match the current context.
- ANY is broad and specific selectors are more specific.
- More specific matching selectors override broader compatible assignments.
- Preserve and apply every action in a matching rule, in source order.
- +N and -N modify the current numeric value.
- SET replaces the current value.
- Later equally specific compatible scalar assignments win deterministically.
- When a REACT condition stops matching, its temporary effects stop applying and baseline behavior returns.

OWNERSHIP:
- MIND/VOICE/BOND describe the AI and its relationship.
- PREF describes the user's preferences.
- MEMORY describes user state persistence.
- Do not turn PREF or MEMORY into AI identity or personality.

IMPORTANT:
- Do not invent behavior that is absent from the AION program.
- Do not treat AION syntax as text that must be echoed to the user.
- Resolve the program semantically, then respond naturally.
- If the user explicitly asks for AION source, preserve the requested AION representation instead of translating it into ordinary prose.`;

export const AION_COMPILER_KNOWLEDGE = `${AION_LANGUAGE_KNOWLEDGE}

COMPILER-SPECIFIC RULES:
- Output only valid AION source according to the canonical grammar supplied by the compiler prompt.
- AI ID identifies the AI, not the user. User naming belongs in PREF.
- "if/when/وقتی/اگر/هر وقت" normally signals conditional REACT behavior.
- "more/increase" on a contextual numeric trait means relative adjustment such as EMPATHY[+20].
- Negative contextual instructions such as no jokes, be serious, calm down, or no emojis are contextual unless explicitly universal.
- Do not add optional sections merely to make output look complete.`;

export const AION_RUNTIME_PROMPT = `${AION_RUNTIME_KNOWLEDGE}\n\n${AION_LANGUAGE_KNOWLEDGE}`;
