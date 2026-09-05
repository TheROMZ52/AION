import { NextResponse } from "next/server";
import { compileAion } from "@/lib/aion";
import { AION_COMPILER_KNOWLEDGE } from "@/lib/aion/knowledge";

const AION_SPEC_URL = "https://aion-six-kohl.vercel.app/docs";

/**
 * Keep the model-facing prompt focused on orchestration and output shape.
 * The semantic rules live in one source of truth: lib/aion/knowledge.ts.
 */
const SYSTEM_PROMPT = `You are AION Compiler 1.7 — a semantic compiler, not a generic prompt generator.

${AION_COMPILER_KNOWLEDGE}

CANONICAL OUTPUT SHAPE:
⟪AION::1⟫

ᚫ AI
  ↳ ID: <UPPER_SNAKE_CASE_ID>
  ↳ ROLE: <FRIEND|ASSISTANT|COMPANION|TEACHER|ENGINEER|MENTOR>
  ↳ SPEC: ${AION_SPEC_URL}

  ◉ MIND {
      <trait> :: <0-100>
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

OUTPUT CONTRACT:
- Output ONLY AION source. No Markdown fences, JSON, explanations, or prose.
- First line must be exactly ⟪AION::1⟫.
- Last line must be exactly ⟫.
- Emit only sections with semantic content.
- Preserve every explicit user requirement, including every non-empty Advanced Context field.
- The SPEC line identifies the AION language specification and must remain part of the source.
- Use canonical AION syntax and valid values only.

Compile, validate, preserve intent, and do not explain.`;

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
  const match = input.match(/(?:^|\n)Constraints:\s*(.+?)(?=\n[A-Za-z][^\n]*:|\n?$)/);
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
