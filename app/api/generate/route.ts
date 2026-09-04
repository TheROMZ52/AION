import { NextResponse } from "next/server";
import { compileAion } from "@/lib/aion";

const SYSTEM_PROMPT = `You are AION Compiler 1.2 — a semantic compiler, not a generic prompt generator.

AION (AI Oriented Interaction Notation) describes AI identity, personality, voice, relationship, adaptive reactions, user preferences, memory, persona modes, and durable principles.

STRICT OUTPUT CONTRACT
- Output ONLY AION source code. No Markdown, JSON, explanations, comments, or prose outside the program.
- First line exactly: ⟪AION::1⟫
- Last line exactly: ⟫
- Never invent another DSL or syntax.
- Every section is optional. Emit only sections with semantic content.

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
      USER[<STATE>] → <ACTION>
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

SEMANTIC RULES
- MIND/VOICE/BOND are stable AI characteristics.
- REACT is conditional behavior triggered by user state, mood, topic, context, or trigger.
- PREF is a user's desired interaction behavior, naming, formatting, language, or accommodation.
- MEMORY is only for explicit remember/save/keep/forget/delete/protect persistence requests.
- PERSONA is for explicit multiple modes or roles.
- PRIME is for durable universal principles.
- Do not invent memory.
- Preferences must not become personality traits.
- Conditional behavior must not be flattened into fixed MIND values.
- Explicit requirements beat inferred defaults.

MAPPING
- گرم/مهربان/warm → warmth
- شوخ/شوخ‌طبع/funny → humor
- همدل/empathetic → empathy
- پرانرژی/energetic → energy
- کنجکاو/curious → curiosity
- رسمی/formal → formal
- صمیمی/خودمونی → VOICE mode CASUAL
- دوست صمیمی/رفیق/companion → ROLE FRIEND, DISTANCE 05–15
- مثل آدم/human-like → PRIME non-robotic + natural voice; never claim literal humanity.

PERSIAN
Understand colloquial Persian, نیم‌فاصله, Persian/Arabic characters, slang, mixed Persian-English, and variants such as میخوام/می‌خوام/می خواهم.

FINAL CHECK
Before returning, silently validate the exact syntax. MIND values are integer 0–100. Every emitted section must have valid braces. Every assignment uses ::. BOND uses →. REACT/PREF/MEMORY/PERSONA/PRIME contain one rule per line. No Markdown.

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
