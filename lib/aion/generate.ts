import { EXTRACTION_PROMPT, parseModelJson } from "./extract";
import { validatePersona, type Persona } from "./schema";

export interface GenerateDeps {
  apiKey: string;
  model: string;
  referer?: string;
  fetchImpl?: typeof fetch;
}

export type GenerateResult =
  | { ok: true; persona: Persona }
  | { ok: false; code: "upstream" | "rate_limited" | "invalid_output"; message: string; status: number };

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function generatePersona(description: string, deps: GenerateDeps): Promise<GenerateResult> {
  const call = deps.fetchImpl ?? fetch;
  const messages: Message[] = [
    { role: "system", content: EXTRACTION_PROMPT },
    { role: "user", content: description },
  ];
  let lastProblem = "";

  for (let attempt = 0; attempt < 2; attempt++) {
    let response: Response;
    try {
      response = await call(ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${deps.apiKey}`,
          "Content-Type": "application/json",
          ...(deps.referer ? { "HTTP-Referer": deps.referer } : {}),
          "X-Title": "AION",
        },
        body: JSON.stringify({
          model: deps.model,
          temperature: 0.2,
          max_tokens: 900,
          response_format: { type: "json_object" },
          messages,
        }),
        signal: AbortSignal.timeout(40000),
      });
    } catch (error) {
      const detail = error instanceof Error ? error.message : "request failed";
      return { ok: false, code: "upstream", message: detail, status: 502 };
    }

    if (response.status === 429) {
      return { ok: false, code: "rate_limited", message: "The model service is rate limited.", status: 429 };
    }
    if (!response.ok) {
      return { ok: false, code: "upstream", message: `The model service returned ${response.status}.`, status: 502 };
    }

    let content = "";
    try {
      const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
      content = payload.choices?.[0]?.message?.content ?? "";
    } catch {
      content = "";
    }

    let problem = "";
    try {
      const result = validatePersona(parseModelJson(content));
      if (result.ok) return { ok: true, persona: result.persona };
      problem = result.errors.join("; ");
    } catch (error) {
      problem = error instanceof Error ? error.message : "output was not valid JSON";
    }

    lastProblem = problem;
    messages.push({ role: "assistant", content: content || "{}" });
    messages.push({ role: "user", content: `That output was rejected: ${problem}. Return the corrected JSON object only.` });
  }

  return { ok: false, code: "invalid_output", message: lastProblem, status: 502 };
}
