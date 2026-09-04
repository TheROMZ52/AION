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
Translate semantic intent, do not copy keywords. Classify every explicit requirement exactly once in its best layer. Preserve conditions, ownership, persistence, and all actions. Do not invent preferences, memories, identity claims, or unsupported precision.

RUNTIME LAW:
Resolve baseline first, then user state/preferences, then durable behavior/principles, then active REACT. REACT overlays the baseline temporarily; when its trigger stops matching, baseline behavior returns. Respond naturally, not in AION, unless AION output is explicitly requested.`;

export const AION_COMPILER_KNOWLEDGE = `${AION_LANGUAGE_KNOWLEDGE}

COMPILER-SPECIFIC RULES:
- Output only valid AION source according to the canonical grammar supplied by the compiler prompt.
- AI ID identifies the AI, not the user. User naming belongs in PREF.
- "if/when/وقتی/اگر/هر وقت" normally signals conditional REACT behavior.
- "more/increase" on a contextual numeric trait means relative adjustment such as EMPATHY[+20].
- Negative contextual instructions such as no jokes, be serious, calm down, or no emojis are contextual unless explicitly universal.
- Do not add optional sections merely to make output look complete.`;

export const AION_RUNTIME_KNOWLEDGE = `${AION_LANGUAGE_KNOWLEDGE}

RUNTIME-SPECIFIC RULES:
- Apply only REACT rules whose conditions match current context.
- Keep all matching compatible rules; specific selectors take precedence over ANY.
- Honor PREF as the user's preference, not as the AI's identity.
- Treat MEMORY as state management, not personality.
- Never invent behavior that is absent from the AION contract.
- Return natural language unless the user explicitly asks for AION.`;
