import { generatePersona, renderPrompt } from "@/lib/aion";
import { API_VERSION, fail, limited, preflight, reply } from "@/lib/aion/http";

export const maxDuration = 60;

const MAX_INPUT = 4000;

async function build(request: Request, description: unknown): Promise<Response> {
  if (typeof description !== "string" || !description.trim()) {
    return fail(400, "missing_description", "Send a non-empty description.");
  }
  if (description.length > MAX_INPUT) {
    return fail(400, "too_long", `The description is limited to ${MAX_INPUT} characters.`);
  }
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return fail(503, "missing_key", "The server has no model key configured.");
  if (limited(request)) return fail(429, "rate_limited", "Too many requests. Try again in a minute.");

  const result = await generatePersona(description.trim(), {
    apiKey,
    model: process.env.AION_MODEL ?? "openai/gpt-oss-20b",
    referer: process.env.NEXT_PUBLIC_SITE_URL,
  });
  if (!result.ok) return fail(result.status, result.code, result.message);

  const prompt = renderPrompt(result.persona);
  return reply({ ok: true, api_version: API_VERSION, persona: result.persona, prompt, characters: prompt.length });
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "invalid_json", "The request body must be JSON.");
  }
  return build(request, (body as { description?: unknown } | null)?.description);
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const description = url.searchParams.get("prompt");
  if (description !== null) return build(request, description);
  return reply({
    name: "AION",
    api_version: API_VERSION,
    endpoints: {
      "POST /api/agent": "{ description } -> { persona, prompt }",
      "GET /api/agent?prompt=": "same as POST, description in the query",
      "POST /api/render": "{ persona } -> { prompt }, no model call",
    },
    manifest: `${url.origin}/aion-agent.json`,
  });
}

export function OPTIONS(): Response {
  return preflight();
}
