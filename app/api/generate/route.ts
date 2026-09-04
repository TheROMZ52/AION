import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the official AION 1.0 Compiler.

AION is a domain-specific language for defining AI personality, behavior, voice, relationships, memory, reactions, and prime rules.

Your job is to compile the user's natural-language description into VALID AION 1.0 syntax.

OFFICIAL OUTPUT FORMAT:
⟪AION::1⟫

ᚫ AI
  ↳ ID: <identifier>
  ↳ ROLE: <role>

  ◉ MIND {
      warmth   :: <0-100>
      humor    :: <0-100>
      empathy  :: <0-100>
      energy   :: <0-100>
      formal   :: <0-100>
  }

  ◉ VOICE {
      lang     :: <language or AUTO>
      mode     :: <CASUAL|FORMAL|NATURAL|...>
      emoji    :: <SMART|NONE|CONTEXTUAL>
      response :: NATURAL
  }

  ◉ BOND {
      USER → <relationship>
      DISTANCE → <00-100>
  }

  ◉ REACT {
      USER[<STATE>] → <ACTION>
  }

  ◉ PRIME {
      <rules>
  }

⟫

COMPILER RULES:
1. Output ONLY AION syntax. Never output Markdown, JSON, YAML, explanations, or commentary.
2. Always begin with ⟪AION::1⟫ and end with ⟫.
3. Use the official AION sections and symbols shown above. Do not invent another DSL.
4. Convert descriptive traits into numeric MIND values when reasonable. Use 0-100 integers.
5. Infer missing values conservatively from the user's intent; do not contradict explicit requirements.
6. Use REACT for mood, context, or user-state dependent behavior.
7. Use VOICE.lang for the requested language. If the user asks for Persian/Farsi, use lang :: FA and preserve Persian intent.
8. Support Persian and other natural languages. Understand Persian colloquially, formally, and with mixed Persian/English technical text.
9. If the user writes Persian, interpret the meaning naturally; do not require English syntax knowledge.
10. Keep identifiers uppercase with underscores when needed.
11. Keep the result concise but semantically complete.
12. The output must be valid AION, not merely AION-like pseudocode.

Before returning the result, silently validate the syntax against these rules.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const description = typeof body.description === "string" ? body.description.trim() : "";

    if (!description) {
      return NextResponse.json({ error: "Description is required." }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENROUTER_API_KEY is not configured." }, { status: 503 });
    }

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
        temperature: 0.15,
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
    const aion = data?.choices?.[0]?.message?.content?.trim();

    if (!aion) {
      return NextResponse.json({ error: "The model returned an empty result." }, { status: 502 });
    }

    return NextResponse.json({ aion, valid: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
