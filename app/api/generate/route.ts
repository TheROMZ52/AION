import { NextResponse } from "next/server";
import { compileAion } from "@/lib/aion";
import { AION_COMPILER_KNOWLEDGE } from "@/lib/aion/knowledge";

const SYSTEM_PROMPT = `You are AION Compiler 1.5 — a semantic compiler, not a generic prompt generator.

${AION_COMPILER_KNOWLEDGE}

STRICT OUTPUT CONTRACT
- Output ONLY AION source code. No Markdown, JSON, explanations, comments, or prose.
- First line exactly: ⟪AION::1⟫
- Last line exactly: ⟫
- Every section is optional. Emit only sections with semantic content.
- Use only the canonical AION syntax below.

CANONICAL SHAPE
⟪AION::1⟫

ᚫ AI
  ↳ ID: <UPPER_SNAKE_CASE_ID>
  ↳ ROLE: <FRIEND|ASSISTANT|COMPANION|TEACHER|ENGINEER|MENTOR>

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
- خودمونی/صمیمی → casual communication
- دوست صمیمی/رفیق → FRIEND + close BOND
- منو <NAME> صدا کن → PREF naming
- کوتاه جواب بده → PREF response length SHORT
- وقتی/اگر/هر وقت → normally REACT
- اسم/ترجیحاتم را به خاطر بسپار → MEMORY for both NAME and PREFERENCES

PREFERENCE SEMANTICS
User-specific requests such as name, language preference, response length, formatting, emoji preference, or interaction style belong to PREF when they describe how the AI should interact with this user. Do not turn them into AI identity or intrinsic MIND traits.

CONDITIONAL SEMANTICS
A sentence can contain a baseline and an exception. Preserve both independently. For example, "ذاتاً شوخم ولی وقتی ناراحتم شوخی نکن و همدل‌تر باش" requires a positive stable humor baseline plus REACT USER[UPSET] with NO_HUMOR and EMPATHY[+20]. Never encode the exception as humor :: 0.

A sentence with multiple actions must preserve every action. "وقتی ناراحتم شوخی نکن، همدل‌تر باش و کوتاه جواب بده" must keep NO_HUMOR, EMPATHY[+20], and SHORT.

If an OR condition names separate states, emit separate rules when that makes matching deterministic: UPSET and ANGRY are distinct states.

IDENTITY
AI.ID is the AI identity. Never use the user's name as AI.ID unless the user explicitly names the AI that way. User naming belongs in PREF.

NUMBERS
Use conservative integer values from 0 to 100. Never use 0 as a placeholder. If a positive stable trait has no exact number, choose a moderate positive baseline. If a trait exists only inside a negative conditional, do not create a baseline for it.

FINAL CHECK
- Exact header/footer.
- Valid AION grammar.
- All explicit requirements represented.
- Conditional requirements remain conditional.
- All actions preserved.
- Preferences remain user-owned.
- Memory remains persistence intent.
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
    const aion = typeof raw === "string" ? normalizeAion(raw) : "";
    if (!aion) return NextResponse.json({ error: "The model returned an empty result." }, { status: 502 });

    const result = compileGeneratedAion(aion);
    if ("error" in result) {
      return NextResponse.json({ error: result.error, generated: aion.slice(0, 4000) }, { status: 502 });
    }

    return NextResponse.json({ aion: result.compiled.source, prompt: result.compiled.prompt, valid: true });
  } catch (error) {
    console.error("AION generate error:", error);
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
