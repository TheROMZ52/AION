import { renderPrompt, validatePersona } from "@/lib/aion";
import { API_VERSION, fail, preflight, reply } from "@/lib/aion/http";

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "invalid_json", "The request body must be JSON.");
  }
  const result = validatePersona((body as { persona?: unknown } | null)?.persona);
  if (!result.ok) return fail(422, "invalid_persona", result.errors.join("; "));
  const prompt = renderPrompt(result.persona);
  return reply({ ok: true, api_version: API_VERSION, persona: result.persona, prompt, characters: prompt.length });
}

export function OPTIONS(): Response {
  return preflight();
}
