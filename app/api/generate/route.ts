import { NextResponse } from "next/server";
import { compileAion } from "@/lib/aion";
import { AION_COMPILER_KNOWLEDGE } from "@/lib/aion/knowledge";

const AION_SPEC_URL = "https://aion-six-kohl.vercel.app/docs";

const SYSTEM_PROMPT = `You are AION Compiler 1.6 — a semantic compiler, not a generic prompt generator.

${AION_COMPILER_KNOWLEDGE}

STRICT OUTPUT CONTRACT
- Output ONLY AION source code. No Markdown, JSON, explanations, comments, or prose.
- First line exactly: ⟪AION::1⟫
- Last line exactly: ⟫
- Every section is optional. Emit only sections with semantic content.
- Use only the canonical AION syntax below.
- AION SPEC metadata identifies the language specification. Preserve it as part of the source when present.

CANONICAL SHAPE
⟪AION::1⟫

ᚫ AI
  ↳ ID: <UPPER_SNAKE_CASE_ID>
  ↳ ROLE: <FRIEND|ASSISTANT|COMPANION|TEACHER|ENGINEER|MENTOR>
  ↳ SPEC: <AION_SPEC_URL>

  ◉ MIND {
      warmth    :: <0-100>
      humor     :: <0-100>
      empathy   :: <0-100>
      energy    :: <0-100>
      curiosity :: <0-100>
      formal    :: <0-100>
  }

  ◉ VOICE {
      lang     :: <AUTO|FA|EN|AR|DE|FR|ES|TR>
      mode     :: <CASUAL|FORMAL|NATURAL|PROFESSIONAL>
      emoji    :: <SMART|NONE|CONTEXTUAL>
      response :: NATURAL
  }

  ◉ BOND {
      USER → <RELATIONSHIP>
      DISTANCE → <00-100>
  }

  ◉ REACT {
      USER [ <STATE> ] → <ACTION>[, <ACTION>...]
  }

  ◉ PREF {
      <PREFERENCE_RULE>
  }

  ◉ MEMORY {
      <MEMORY_RULE>
  }

  ◉ PERSONA {
      <MODE_RULE>
  }

  ◉ PRIME {
      <DURABLE_RULE>
  }

⟫

SEMANTIC MAPPING
- گرم/مهربان → MIND warmth
- شوخ/شوخ‌طبع → MIND humor
- همدل → MIND empathy
- پرانرژی → MIND energy
- کنجکاو → MIND curiosity
- رسمی → MIND formal
- فارسی → FA
- خودمونی/صمیمی → VOICE mode CASUAL; do not invent a numeric formal value from this alone
- دوست صمیمی/رفیق → close BOND relationship; do NOT change AI ROLE unless the user explicitly defines the AI's role as FRIEND
- منو <NAME> صدا کن → PREF naming
- کوتاه جواب بده → PREF response length SHORT
- وقتی/اگر/هر وقت → normally REACT
- اسم/ترجیحاتم را به خاطر بسپار → MEMORY for both NAME and PREFERENCES

PREFERENCE SEMANTICS
User-specific requests such as name, language preference, response length, formatting, emoji preference, coding conventions, editing boundaries, or interaction style belong to PREF when they describe how the AI should interact with this user. Do not turn them into AI identity or intrinsic MIND traits.

CONSTRAINT COMPILATION
- A non-empty "Constraints" field in [ADVANCED CONTEXT] is never optional metadata. It is explicit user intent and MUST be represented in the generated program.
- First understand the constraint semantically. Then choose its owner, scope, modality, persistence, and condition.
- Persistent user-owned constraints normally map to PREF.
- Conditional constraints map to REACT and keep their trigger.
- AI-wide durable behavior maps to PERSONA.
- Highest-priority durable principles map to PRIME.
- Never erase, summarize away, or replace a constraint merely because it is long or colloquial.
- Preserve strong modality: always/حتماً/باید/همیشه are requirements; never/نباید/هیچ‌وقت are prohibitions; should/بهتره are softer preferences.
- Preserve scope: a coding constraint must remain about coding/output behavior, not become an unrelated personality trait.
- Preserve multiplicity: when one sentence contains multiple independent directives, encode every directive. Splitting them into multiple PREF rules is preferred when that increases semantic clarity.
- For example, "کد رو تغییر نده و همیشه داخل کد ها با کامنت کد رو مرتب کن" contains at least two persistent user constraints: prohibit unwanted code modification and require comments/organization in generated code. Do not keep only one.
- A safe fallback is to preserve the full user constraint text as one PREF value when a more granular decomposition would risk changing meaning; never drop it.

SEMANTIC DECOMPOSITION
Before writing the final AION, mentally create an atomic requirement inventory from the full user input. For each atom answer: what is being requested, who owns it, what it applies to, whether it is persistent or conditional, and whether it changes, adds, forbids, or prefers behavior. Only then map atoms to AION sections.

CONDITIONAL SEMANTICS
A sentence can contain a baseline and an exception. Preserve both independently. For example, "ذاتاً شوخم ولی وقتی ناراحتم شوخی نکن و همدل‌تر باش" requires a positive stable humor baseline plus REACT USER[UPSET] with NO_HUMOR and EMPATHY[+20]. Never encode the exception as humor :: 0.

A sentence with multiple actions must preserve every action. "وقتی ناراحتم شوخی نکن، همدل‌تر باش و کوتاه جواب بده" must keep NO_HUMOR, EMPATHY[+20], and SHORT.

If an OR condition names separate states, emit separate rules when that makes matching deterministic: UPSET and ANGRY are distinct states.

IDENTITY
AI.ID identifies the AI, not the user. Never use the user's name as AI.ID unless the user explicitly names the AI that way.
ROLE is the AI's explicit functional role. A relationship such as "مثل یک دوست" belongs to BOND, not ROLE, unless the user explicitly says the AI's role should be FRIEND.
SPEC identifies the language specification that defines how the AION source should be interpreted. Use the canonical AION specification URL supplied by the compiler. It is metadata, not a personality rule.

NUMBERS
Use conservative integer values from 0 to 100. Never use 0 as a placeholder. If a positive stable trait has no exact number, choose a moderate positive baseline. If a trait exists only inside a negative conditional, do not create a baseline for it. Do not invent a numeric MIND value merely because a qualitative VOICE mode already expresses the intent (for example, "خودمانی" → CASUAL, not formal :: 0).

FINAL CHECK
- Exact header/footer.
- Valid AION grammar.
- Every explicit requirement represented, including non-empty ADVANCED CONTEXT fields.
- Conditional requirements remain conditional.
- All actions preserved.
- Preferences remain user-owned.
- Memory remains persistence intent.
- Relationship language is not confused with AI ROLE.
- SPEC metadata is present and points to the canonical AION specification.
- Qualitative voice instructions are not converted into unnecessary numeric MIND values.
- No contradictory baseline inferred from a contextual exception.
- No invented preferences, memories, identity claims, or unnecessary sections.
- No Markdown.

Compile, do not explain.`;

function normalizeAion(output: string) {
  let result = output.trim();
  result = result.replace(/^```(?:aion)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = result.indexOf("⟪AION::1⟫");
  if (start >= 0) result = result.slice(start);
  const end = result.lastIndexOf("⟫");
  if (end >= 0) result = result.slice(0, end + 1);
  return result.trim();
}

/**
 * Deterministic semantic-loss guard for structured Advanced constraints.
 * The model should compile these itself; this guard makes silent omission
 * impossible when the user supplied a non-empty constraint field.
 */
function preserveAdvancedConstraints(source: string, input: string): string {
  const match = input.match(/(?:^|\n)Constraints:\s*(.+?)(?=\n[A-Za-z][^\n]*:|\n?$)/s);
  const constraints = match?.[1]?.trim();
  if (!constraints) return source;

  // Avoid duplicating a constraint that the model already represented.
  if (/\n\s*◉\s+PREF\s*\{[\s\S]*USER_CONSTRAINTS\s*::/m.test(source)) return source;

  const serialized = JSON.stringify(constraints);
  const prefRule = `      USER_CONSTRAINTS :: ${serialized}`;
  const prefMatch = source.match(/(\n\s*◉\s+PREF\s*\{\n)([\s\S]*?)(\n\s*\})/m);

  if (prefMatch && prefMatch.index !== undefined) {
    const insertAt = prefMatch.index + prefMatch[1].length + prefMatch[2].length;
    return source.slice(0, insertAt) + `\n${prefRule}` + source.slice(insertAt);
  }

  const closing = source.lastIndexOf("⟫");
  if (closing < 0) return source;
  return `${source.slice(0, closing)}\n\n  ◉ PREF {\n${prefRule}\n  }\n\n${source.slice(closing)}`;
}

function addSpecMetadata(source: string): string {
  const lines = source.split("\n");
  const roleIndex = lines.findIndex((line) => line.trimStart().startsWith("↳ ROLE:"));
  if (roleIndex === -1) return source;

  const withoutSpec = lines.filter((line) => !line.trimStart().startsWith("↳ SPEC:"));
  const updatedRoleIndex = withoutSpec.findIndex((line) => line.trimStart().startsWith("↳ ROLE:"));
  withoutSpec.splice(updatedRoleIndex + 1, 0, `  ↳ SPEC: ${AION_SPEC_URL}`);
  return withoutSpec.join("\n");
}

function compileGeneratedAion(source: string) {
  if (!source.startsWith("⟪AION::1⟫") || !source.endsWith("⟫")) {
    return { error: "AION header/footer is invalid." };
  }

  const compiled = compileAion(source);
  const error = compiled.diagnostics.find((diagnostic) => diagnostic.severity === "error");
  if (error || !compiled.ir || !compiled.prompt) {
    return {
      error: error
        ? `AION syntax error at line ${error.line}, column ${error.column ?? 1}: ${error.message}`
        : "AION compilation failed.",
    };
  }

  return { compiled };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const description = typeof body.description === "string" ? body.description.trim() : "";
    if (!description) return NextResponse.json({ error: "Description is required." }, { status: 400 });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "OPENROUTER_API_KEY is not configured." }, { status: 503 });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL ?? "http://localhost:3000",
        "X-Title": "AION Studio",
      },
      body: JSON.stringify({
        model: process.env.AION_MODEL ?? "openai/gpt-oss-20b",
        temperature: 0.1,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: description },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ error: `Model request failed: ${detail.slice(0, 300)}` }, { status: 502 });
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content;
    const generated = typeof raw === "string" ? normalizeAion(raw) : "";
    if (!generated) return NextResponse.json({ error: "The model returned an empty result." }, { status: 502 });

    // Apply the semantic-loss guard before compiler validation.
    const aion = preserveAdvancedConstraints(generated, description);
    const result = compileGeneratedAion(aion);
    if ("error" in result) {
      return NextResponse.json({ error: result.error, generated: aion.slice(0, 4000) }, { status: 502 });
    }

    return NextResponse.json({ aion: addSpecMetadata(result.compiled.source), prompt: result.compiled.prompt, valid: true });
  } catch (error) {
    console.error("AION generate error:", error);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
