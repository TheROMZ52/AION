import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the AION Compiler.
Transform the user's natural-language description into valid AION 1.0 syntax.
Output ONLY AION syntax. No markdown fences. No explanation.
Preserve intent, infer reasonable personality traits, and never contradict the user.`;

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
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
        "X-Title": "AION Studio",
      },
      body: JSON.stringify({
        model: process.env.AION_MODEL ?? "openai/gpt-oss-20b:free",
        temperature: 0.2,
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
