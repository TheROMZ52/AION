import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { emptyPersona, isBlank, validatePersona } from "./schema";

describe("validatePersona", () => {
  it("accepts a minimal persona", () => {
    const result = validatePersona({ language: "FA" });
    assert.equal(result.ok, true);
    if (result.ok) assert.deepEqual(result.persona, { language: "fa", traits: {}, always: [], never: [], when: [] });
  });

  it("clamps and rounds traits and ignores unknown keys", () => {
    const result = validatePersona({ language: "en", traits: { warmth: 140.6, humor: "-5", bogus: 10 } });
    assert.equal(result.ok, true);
    if (result.ok) assert.deepEqual(result.persona.traits, { warmth: 100, humor: 0 });
  });

  it("rejects bad language, enums and non numeric traits", () => {
    const result = validatePersona({ language: "farsi", length: "huge", emoji: "lots", traits: { warmth: "high" } });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.errors.length, 4);
  });

  it("trims, drops empty strings and caps list size", () => {
    const many = Array.from({ length: 20 }, (_, index) => `rule ${index}`);
    const result = validatePersona({ language: "en", always: ["  a   b ", "", ...many], never: [] });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.persona.always[0], "a b");
      assert.equal(result.persona.always.length, 8);
    }
  });

  it("validates when entries", () => {
    assert.equal(validatePersona({ language: "en", when: [{ if: "sad" }] }).ok, false);
    assert.equal(validatePersona({ language: "en", when: "sad" }).ok, false);
    const ok = validatePersona({ language: "en", when: [{ if: "user is sad", then: "be gentle" }] });
    assert.equal(ok.ok, true);
  });

  it("rejects non objects", () => {
    assert.equal(validatePersona(null).ok, false);
    assert.equal(validatePersona([]).ok, false);
    assert.equal(validatePersona("x").ok, false);
  });

  it("detects blank personas", () => {
    assert.equal(isBlank(emptyPersona("fa")), true);
    assert.equal(isBlank({ ...emptyPersona("fa"), traits: { warmth: 90 } }), false);
  });
});
