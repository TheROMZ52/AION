import { NextResponse } from "next/server";
import { POST as generateAion } from "../generate/route";

const API_VERSION = "1";
const COMPILER_VERSION = "1.5";
const MAX_INPUT_LENGTH = 4000;

function jsonHeaders() {
  return {
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "X-AION-API": API_VERSION,
  };
}

function metadata(request: Request) {
  const origin = new URL(request.url).origin;
  return {
    name: "AION Agent API",
    api_version: API_VERSION,
    compiler_version: COMPILER_VERSION,
    description: "Natural language → validated AION → deterministic runtime prompt.",
    endpoint: `${origin}/api/agent`,
    methods: {
      GET: "Use ?prompt=... for a simple request or omit the query for metadata.",
      POST: "Send JSON: { description: string }.",
      OPTIONS: "CORS preflight.",
    },
    input: {
      content_type: "application/json",
      field: "description",
      max_characters: MAX_INPUT_LENGTH,
    },
    output: {
      content_type: "application/json",
      fields: ["aion", "prompt", "valid"],
      valid: "true when the generated AION passes the deterministic compiler.",
    },
    links: {
      manifest: `${origin}/aion-agent.json`,
    },
  };
}

async function forwardToCompiler(request: Request, description: string) {
  const response = await generateAion(
    new Request(new URL("/api/generate", request.url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    }),
  );

  const body = await response.text();
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json(
      { error: "Compiler returned a non-JSON response." },
      { status: 502, headers: jsonHeaders() },
    );
  }

  if (!response.ok) {
    return NextResponse.json(payload, {
      status: response.status,
      headers: jsonHeaders(),
    });
  }

  return NextResponse.json(
    {
      ok: true,
      api_version: API_VERSION,
      compiler_version: COMPILER_VERSION,
      ...(typeof payload === "object" && payload !== null ? payload : {}),
    },
    { headers: jsonHeaders() },
  );
}

/**
 * Agent-facing AION API.
 *
 * GET without a prompt is a machine-readable capability document.
 * GET with ?prompt=... is a convenient one-request compilation path.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const description =
    url.searchParams.get("prompt") ??
    url.searchParams.get("q") ??
    url.searchParams.get("description") ??
    "";

  if (!description.trim()) {
    return NextResponse.json(metadata(request), { headers: jsonHeaders() });
  }

  const normalized = description.trim();
  if (normalized.length > MAX_INPUT_LENGTH) {
    return NextResponse.json(
      { ok: false, error: `Description is too long. Maximum length is ${MAX_INPUT_LENGTH} characters.` },
      { status: 400, headers: jsonHeaders() },
    );
  }

  return forwardToCompiler(request, normalized);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const description =
      typeof body?.description === "string"
        ? body.description.trim()
        : typeof body?.prompt === "string"
          ? body.prompt.trim()
          : "";

    if (!description) {
      return NextResponse.json(
        { ok: false, error: "Description is required." },
        { status: 400, headers: jsonHeaders() },
      );
    }

    if (description.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        { ok: false, error: `Description is too long. Maximum length is ${MAX_INPUT_LENGTH} characters.` },
        { status: 400, headers: jsonHeaders() },
      );
    }

    return forwardToCompiler(request, description);
  } catch {
    return NextResponse.json(
      { ok: false, error: "Request body must be valid JSON." },
      { status: 400, headers: jsonHeaders() },
    );
  }
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: jsonHeaders() });
}
