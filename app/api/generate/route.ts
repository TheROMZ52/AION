import { NextResponse } from "next/server";
import { compileAion } from "@/lib/aion";
import { AION_COMPILER_KNOWLEDGE } from "@/lib/aion/knowledge";

export const runtime = "nodejs";

const AION_SPEC_URL = "https://aion-six-kohl.vercel.app/docs";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_TIMEOUT_MS = 45_000;

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
- Never invent personality traits, numeric values, defaults, or baselines that the user did not specify.
- Constraints are semantic rules, not transport metadata. Never emit USER_CONSTRAINTS.
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

function readAdvancedField(input: string, label: string): string {
  const match = input.match(new RegExp(`(?:^|\\n)${label.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}:\\s*(.+?)(?=\\n[A-Za-z][^\\n]*:|\\n?$)`));
  return match?.[1]?.trim() ?? "";
}

/**
 * Turn Advanced constraints into real AION semantics.
 * This prevents the old USER_CONSTRAINTS transport line and keeps every
 * explicit coding constraint as a deterministic PREF rule.
 */
function compileAdvancedConstraints(input: string): string[] {
  const constraints = readAdvancedField(input, "Constraints");
  if (!constraints) return [];

  const rules: string[] = [];
  const parts = constraints
    .split(/\s+(?:and|و)\s+|[؛;]\s*/i)
    .map((part) => part.trim())
    .filter(Boolean);

  for (const part of parts) {
    if (/کد\s*رو\s*تغی(?:ر|ی)\s*نده|کد\s+را\s+تغی(?:ر|ی)\s*نده|don't\s+change\s+(?:the\s+)?code|do\s+not\s+change\s+(?:the\s+)?code/i.test(part)) {
      rules.push("USER → CODE_CHANGE = FORBIDDEN");
      continue;
    }

    if (/همیشه.*کد.*کامنت|کامنت.*کد.*همیشه|always.*comment.*code|always.*add.*comments/i.test(part)) {
      rules.push("USER → CODE_COMMENTS = REQUIRED");
      continue;
    }

    rules.push(`USER → CONSTRAINT = ${JSON.stringify(part)}`);
  }

  return rules;
}

/**
 * Remove the temporary USER_CONSTRAINTS transport rule and replace it with
 * canonical PREF semantics exactly once.
 */
function normalizeAdvancedConstraints(source: string, input: string): string {
  const rules = compileAdvancedConstraints(input);
  if (rules.length === 0) return source;

  const lines = source.split("\n").filter((line) => !/USER_CONSTRAINTS\s*::/.test(line));
  const filtered = lines.join("\n");
  const prefMatch = filtered.match(/(\n\s*◉\s+PREF\s*\{\n)([\s\S]*?)(\n\s*\})/m);

  if (prefMatch && prefMatch.index !== undefined) {
    const existingRules = prefMatch[2]
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const missingRules = rules.filter((rule) => !existingRules.includes(rule));
    if (missingRules.length === 0) return filtered;

    const insertAt = prefMatch.index + prefMatch[1].length + prefMatch[2].length;
    return filtered.slice(0, insertAt) + `\n${missingRules.map((rule) => `      ${rule}`).join("\n")}` + filtered.slice(insertAt);
  }

  const closing = filtered.lastIndexOf("⟫");
  if (closing < 0) return filtered;
  return `${filtered.slice(0, closing)}\n\n  ◉ PREF {\n${rules.map((rule) => `      ${rule}`).join("\n")}\n  }\n\n${filtered.slice(closing)}`;
}

/**
 * In Advanced mode, only explicit numeric personality fields are allowed.
 * The free-form compiler input may still contribute traits mentioned there,
 * but the compiler must not invent a baseline such as formal :: 50.
 */
function removeUnsupportedAdvancedMind(source: string, input: string): string {
  const advancedIndex = input.indexOf("[ADVANCED CONTEXT]");
  if (advancedIndex < 0) return source;

  const context = input.slice(advancedIndex);
  const explicitTraits = ["Warmth", "Humor", "Empathy", "Curiosity", "Energy", "Formal"]
    .filter((label) => new RegExp(`(?:^|\\n)${label}:\\s*\\d+`, "i").test(context));

  const mentioned = new Set<string>();
  const traitAliases: Record<string, string[]> = {
    warmth: ["warm", "warmth", "گرم", "گرمی"],
    humor: ["humor", "funny", "شوخ", "شوخ‌طبع"],
    empathy: ["empathy", "empathetic", "همدل", "همدلی"],
    curiosity: ["curiosity", "curious", "کنجکاو", "کنجکاوی"],
    energy: ["energy", "energetic", "پرانرژی", "انرژی"],
    formal: ["formal", "رسمی"],
  };

  for (const [trait, aliases] of Object.entries(traitAliases)) {
    if (aliases.some((alias) => context.toLowerCase().includes(alias.toLowerCase()))) mentioned.add(trait);
  }

  const allowed = new Set(explicitTraits.map((label) => label.toLowerCase()));
  for (const trait of mentioned) allowed.add(trait);

  const lines = source.split("\n");
  const mindStart = lines.findIndex((line) => line.trim() === "◉ MIND {");
  if (mindStart < 0) return source;
  const mindEnd = lines.findIndex((line, index) => index > mindStart && line.trim() === "}");
  if (mindEnd < 0) return source;

  const kept = lines.slice(mindStart + 1, mindEnd).filter((line) => {
    const match = line.trim().match(/^([A-Za-z_]+)\s*::\s*\d+$/);
    return match ? allowed.has(match[1].toLowerCase()) : true;
  });

  lines.splice(mindStart + 1, mindEnd - mindStart - 1, ...kept);
  return lines.join("\n");
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

    let response: Response;
    try {
      response = await fetch(OPENROUTER_URL, {
        method: "POST",
        signal: AbortSignal.timeout(OPENROUTER_TIMEOUT_MS),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.SITE_URL ?? AION_SPEC_URL,
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
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Unknown network error";
      console.error("AION OpenRouter fetch failed:", error);
      return NextResponse.json({ error: `Unable to reach the model service: ${detail}` }, { status: 503 });
    }

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json({ error: `Model request failed (${response.status}): ${detail.slice(0, 500)}` }, { status: 502 });
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content;
    const generated = typeof raw === "string" ? normalizeAion(raw) : "";
    if (!generated) return NextResponse.json({ error: "The model returned an empty result." }, { status: 502 });

    const normalized = normalizeAdvancedConstraints(generated, description);
    const aion = removeUnsupportedAdvancedMind(normalized, description);
    const result = compileGeneratedAion(aion);
    if ("error" in result) {
      return NextResponse.json({ error: result.error, generated: aion.slice(0, 4000) }, { status: 502 });
    }

    return NextResponse.json({ aion: addSpecMetadata(result.compiled.source), prompt: result.compiled.prompt, valid: true });
  } catch (error) {
    console.error("AION generate error:", error);
    const detail = error instanceof Error ? error.message : "Invalid request.";
    return NextResponse.json({ error: detail }, { status: 400 });
  }
}
