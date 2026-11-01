import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseModelJson } from "./extract";
import { generatePersona } from "./generate";

function completion(content: string, status = 200): Response {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status });
}

function sequence(...responses: Response[]) {
  const calls: { body: { messages: { role: string; content: string }[] } }[] = [];
  const fetchImpl = (async (_url: string, init?: RequestInit) => {
    calls.push({ body: JSON.parse(String(init?.body)) });
    const next = responses.shift();
    if (!next) throw new Error("unexpected call");
    return next;
  }) as unknown as typeof fetch;
  return { fetchImpl, calls };
}

const deps = { apiKey: "k", model: "m" };

describe("parseModelJson", () => {
  it("handles fences and surrounding prose", () => {
    assert.deepEqual(parseModelJson('Sure!\n```json\n{"a":1}\n```'), { a: 1 });
  });

  it("throws when there is no object", () => {
    assert.throws(() => parseModelJson("nope"));
  });
});

describe("generatePersona", () => {
  it("returns a validated persona", async () => {
    const { fetchImpl, calls } = sequence(completion('{"language":"fa","traits":{"warmth":90}}'));
    const result = await generatePersona("یه رفیق گرم", { ...deps, fetchImpl });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.persona.traits.warmth, 90);
    assert.equal(calls[0].body.messages[1].content, "یه رفیق گرم");
  });

  it("retries once with the validation error", async () => {
    const { fetchImpl, calls } = sequence(completion('{"traits":{}}'), completion('{"language":"en"}'));
    const result = await generatePersona("x", { ...deps, fetchImpl });
    assert.equal(result.ok, true);
    assert.equal(calls.length, 2);
    assert.match(calls[1].body.messages.at(-1)?.content ?? "", /language/);
  });

  it("gives up after two invalid answers", async () => {
    const { fetchImpl } = sequence(completion("nope"), completion("still nope"));
    const result = await generatePersona("x", { ...deps, fetchImpl });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "invalid_output");
  });

  it("maps upstream failures", async () => {
    const limited = await generatePersona("x", { ...deps, fetchImpl: sequence(new Response("", { status: 429 })).fetchImpl });
    assert.equal(!limited.ok && limited.code, "rate_limited");
    const broken = await generatePersona("x", { ...deps, fetchImpl: sequence(new Response("", { status: 500 })).fetchImpl });
    assert.equal(!broken.ok && broken.code, "upstream");
    const offline = await generatePersona("x", { ...deps, fetchImpl: sequence().fetchImpl });
    assert.equal(!offline.ok && offline.code, "upstream");
  });
});
