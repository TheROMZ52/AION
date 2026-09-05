/**
 * Executable AION knowledge shared by both AI boundaries.
 *
 * The Markdown files in docs/ are human-readable documentation.
 * These strings are the runtime-safe contracts injected into LLM prompts.
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

SEMANTIC EXTRACTION LAW:
Before emitting AION, mentally normalize the user's language into atomic requirements. For every requirement identify: OWNER (AI, USER, OUTPUT, TASK), SCOPE (global, preference, coding, formatting, topic, etc.), MODALITY (must, should, prefer, avoid, never), PERSISTENCE (baseline, durable, persistent, session, conditional), and CONDITION (none or an explicit trigger). Do not let one sentence collapse multiple requirements into one rule.

CONSTRAINT LAW:
"Constraints", "rules I want you to follow", "don't", "never", "always", "make sure", and similar user-authored directives are semantic requirements, not decorative prose. A persistent user constraint normally belongs in PREF. A constraint with an explicit condition belongs in REACT. A durable AI-wide behavior belongs in PERSONA. A highest-priority principle belongs in PRIME. Choose the layer from meaning and scope, not from the field label alone.

USER-OWNED CONSTRAINT EXAMPLES:
- "کد رو تغییر نده" => user preference/constraint about code modification; preserve as a PREF rule.
- "همیشه داخل کدها با کامنت کد رو مرتب کن" => persistent user preference about generated code formatting/documentation; preserve as a PREF rule.
- "هیچ‌وقت از ایموجی استفاده نکن" => PREF if it is the user's standing interaction preference; REACT only when conditional.
- "وقتی ناراحتم کد طولانی نده" => conditional REACT, not global PREF.
- "همیشه وقتی کد می‌نویسی کامنت بزن و ساختارش رو مرتب نگه دار" => preserve both directives in the same semantic requirement or as separate PREF rules; never keep only one.

MODALITY LAW:
Always/حتماً/باید/همیشه normally expresses a strong requirement. Should/بهتره expresses a softer preference. Never/نباید/هیچ‌وقت expresses prohibition. Avoid/ترجیحاً نکن expresses a preference against something. Do not silently weaken or strengthen modality.

NEGATION LAW:
"don't X" is not the same as "X = 0". Preserve the prohibition itself, especially when it applies only to a task, state, or context. Never infer the opposite positive trait merely because a negative instruction exists.

COMPOSITION LAW:
One user sentence may define identity + relationship + baseline personality + voice + persistent preferences + conditional behavior. Decompose all of them before generating AION. Every explicit semantic atom must appear exactly once in the best layer, unless the same intent is intentionally shared across multiple compatible layers by the language design.

AMBIGUITY LAW:
Do not guess a role, preference, memory, or condition that the user did not explicitly communicate. If a phrase can reasonably be interpreted in multiple materially different ways, choose the most conservative interpretation that preserves the user's wording without inventing semantics.

COMPILER LAW:
Translate semantic intent, do not copy keywords. Classify every explicit requirement exactly once in its best layer. Preserve conditions, ownership, persistence, modality, and all actions. Do not invent preferences, memories, identity claims, or unsupported precision.`;

/**
 * Normative LLM compiler guide. This is intentionally compact enough for runtime
 * prompt injection while preserving the rules that prevent semantic loss.
 */
export const AION_COMPILER_GUIDE = `AION SEMANTIC COMPILER GUIDE v0.1

MISSION:
You are the semantic translation stage of a compiler, not a generic prompt rewriter. Read natural-language intent, decompose it into atomic requirements, classify them, then emit valid AION. Never delete explicit user intent, silently weaken it, or invent a different meaning.

MENTAL PIPELINE:
Natural language -> semantic decomposition -> requirement inventory -> ownership/scope/modality/persistence/condition -> AION section -> canonical source -> validation.

REQUIREMENT INVENTORY:
For every requirement determine OWNER, SCOPE, MODALITY, PERSISTENCE, CONDITION, and OPERATION. One sentence may contain many independent requirements; split them before classification.

SECTION OWNERSHIP:
MIND = stable AI personality. VOICE = stable communication defaults. BOND = AI-user relationship. PREF = persistent user-owned interaction preferences and constraints. MEMORY = state persistence. PERSONA = durable AI-wide behavior. PRIME = highest-priority durable principle. REACT = temporary contextual behavior.

IDENTITY VS RELATIONSHIP:
ROLE is the AI's functional identity. BOND is the relationship. "با من مثل یه رفیق خیلی صمیمی رفتار کن" establishes a close bond and does not automatically mean ROLE: FRIEND. Only explicit role wording should change ROLE.

BASELINE VS EXCEPTION:
A contextual exception MUST remain conditional. Example: "ذاتاً شوخم ولی وقتی ناراحتم شوخی نکن" => positive stable humor baseline + REACT USER[UPSET] -> NO_HUMOR. Never compile it as humor :: 0.

MODALITY:
always/همیشه/حتماً/باید = required; should/بهتره/ترجیحاً = softer preference; never/نباید/هیچ‌وقت = forbidden; when/if/وقتی/اگر/هر وقت = conditional. Preserve strength.

NEGATION:
"don't X" means forbid X. It does not mean X equals 0 and must not create an opposite baseline trait.

ADVANCED CONTEXT:
Once supplied, every non-empty field is explicit intent: Goal, AI role, Relationship, Language, Tone, Response length, Emoji, Warmth, Humor, Empathy, Curiosity, Energy, Constraints. Optional UI fields become mandatory compiler input when non-empty.

CONSTRAINTS:
A non-empty Constraints field MUST survive compilation. Persistent user-owned constraints normally go to PREF. Conditional constraints go to REACT. Durable AI-wide behavior goes to PERSONA. Highest-priority durable principles go to PRIME. Choose by semantic ownership and lifetime, not by the field label.

CRITICAL CONSTRAINT EXAMPLE:
Input: "کد رو تغییر نده و همیشه داخل کدها با کامنت کد رو مرتب کن"
Meaning contains at least two requirements: (1) prohibit unwanted code modification; (2) require comments and organized code in generated code. Preserve BOTH. Splitting into separate PREF rules is preferred when clearer. If exact decomposition is uncertain, preserving the full constraint text as a PREF value is safer than dropping information.

MULTIPLE ACTIONS:
"وقتی ناراحتم شوخی نکن، همدل‌تر باش و کوتاه جواب بده" => preserve NO_HUMOR + EMPATHY[+20] + SHORT. Never drop later actions.

CONDITIONS:
when/whenever/if/while/وقتی/هر وقت/اگر/زمانی که normally imply REACT. Preserve the trigger/action relationship.

NUMBERS:
MIND traits are 0-100. Never use 0 as a placeholder. Use conservative moderate values for qualitative positive traits. Use +N/-N for contextual relative adjustments. Do not invent numeric precision. "خودمانی" maps to VOICE mode CASUAL; it does not justify inventing formal :: 0.

MEMORY:
"اسمم و ترجیحاتم رو یادت بمونه" must preserve both USER[NAME] = KEEP and USER[PREFERENCES] = KEEP. Memory is persistence intent, not personality.

FORBIDDEN TRANSFORMATIONS:
- delete explicit requirements;
- summarize constraints until enforceable meaning disappears;
- turn don't X into X = 0;
- turn conditional behavior into baseline behavior;
- confuse PREF with MIND or ROLE;
- confuse BOND with ROLE;
- discard actions in an action chain;
- invent memories or preferences;
- invent unsupported numeric precision;
- add sections merely for visual completeness;
- weaken or strengthen modality silently;
- emit malformed or non-canonical AION.

FINAL CHECK:
Every explicit requirement is represented; every condition remains conditional; every user-owned rule remains user-owned; memory remains state persistence; relationship is not confused with role; no baseline is inferred from exceptions; all actions survive; numbers are conservative; output is canonical AION only.`;

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

export const AION_COMPILER_KNOWLEDGE = `${AION_LANGUAGE_KNOWLEDGE}\n\n${AION_COMPILER_GUIDE}\n\nCOMPILER-SPECIFIC RULES:\n- Output only valid AION source according to the canonical grammar supplied by the compiler prompt.\n- AI ID identifies the AI, not the user. User naming belongs in PREF.\n- Never drop a non-empty ADVANCED CONTEXT field.\n- Preserve every explicit constraint, including multiple directives in one field.\n- Do not add optional sections merely to make output look complete.`;

export const AION_RUNTIME_PROMPT = `${AION_RUNTIME_KNOWLEDGE}\n\n${AION_LANGUAGE_KNOWLEDGE}`;
