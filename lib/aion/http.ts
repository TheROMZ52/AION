export const API_VERSION = "2";

const HEADERS = {
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "X-AION-API": API_VERSION,
};

export function reply(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: HEADERS });
}

export function fail(status: number, code: string, message: string): Response {
  return reply({ ok: false, error: { code, message } }, status);
}

export function preflight(): Response {
  return new Response(null, { status: 204, headers: HEADERS });
}

const hits = new Map<string, number[]>();

export function limited(request: Request, max = 12, windowMs = 60000): boolean {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const key = forwarded.split(",")[0].trim() || "anonymous";
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 2000) {
    for (const [id, times] of hits) if (times.every((time) => now - time >= windowMs)) hits.delete(id);
  }
  return false;
}
