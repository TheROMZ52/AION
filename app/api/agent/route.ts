import { POST as generateAion } from "../generate/route";

const MAX_INPUT_LENGTH = 4000;

function jsonHeaders() {
  return {
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "X-AION-API": "1",
  };
}

/**
 * Agent-facing AION API.
 *
 * GET is intentionally supported so an external AI/tool can call the public
 * endpoint without needing to construct a POST request. POST is forwarded to
 * the canonical /api/generate compiler endpoint.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const description =
    url.searchParams.get("prompt") ??
    url.searchParams.get("q") ??
    url.searchParams.get("description") ??
    "";

  if (!description.trim()) {
    return Response.json(
      {
        name: "AION Agent API",
        version: "1",
        description: "Natural language → validated AION → runtime prompt.",
        usage: {
          GET: "/api/agent?prompt=<url-encoded-natural-language>",
          POST: "/api/agent with JSON {\"description\": \"...\"}",
        },
        limits: { max_input_characters: MAX_INPUT_LENGTH },
        returns: ["aion", "prompt", "valid"],
      },
      { headers: jsonHeaders() },
    );
  }

  if (description.length > MAX_INPUT_LENGTH) {
    return Response.json(
      { error: `Description is too long. Maximum length is ${MAX_INPUT_LENGTH} characters.` },
      { status: 400, headers: jsonHeaders() },
    );
  }

  const response = await generateAion(
    new Request(new URL("/api/generate", request.url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: description.trim() }),
    }),
  );

  const body = await response.text();
  return new Response(body, {
    status: response.status,
    headers: { ...jsonHeaders(), "Content-Type": "application/json" },
  });
}

export async function POST(request: Request) {
  const response = await generateAion(request);
  const body = await response.text();
  return new Response(body, {
    status: response.status,
    headers: { ...jsonHeaders(), "Content-Type": "application/json" },
  });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: jsonHeaders() });
}
