import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderPrompt } from "./render";
import { emptyPersona, type Persona } from "./schema";

const english: Persona = {
  ...emptyPersona("en"),
  name: "Sara",
  role: "a study buddy",
  traits: { warmth: 90, humor: 70, formality: 50, directness: 10 },
  length: "short",
  emoji: "rare",
  userName: "Mahbod",
  always: ["explain with examples"],
  never: ["give the final answer without a hint"],
  when: [{ if: "the user is frustrated", then: "slow down and encourage them" }],
};

const persian: Persona = {
  ...emptyPersona("fa"),
  name: "مارکوس",
  role: "رفیق گروه",
  traits: { warmth: 95, humor: 80 },
  emoji: "none",
  never: ["کد رو تغییر بده"],
};

describe("renderPrompt", () => {
  it("renders an English prompt with every section", () => {
    const prompt = renderPrompt(english);
    assert.match(prompt, /^You are Sara, a study buddy\./);
    assert.match(prompt, /deeply warm and affectionate/);
    assert.match(prompt, /playful and quick to joke/);
    assert.match(prompt, /Reply in English\./);
    assert.match(prompt, /Address the user as Mahbod\./);
    assert.match(prompt, /Always:\n- Explain with examples|Always:\n- explain with examples\./);
    assert.match(prompt, /When the user is frustrated: slow down and encourage them\./);
    assert.match(prompt, /Stay in character\./);
  });

  it("omits neutral traits", () => {
    const prompt = renderPrompt(english);
    assert.doesNotMatch(prompt, /formal|polite/);
  });

  it("renders Persian prompts in Persian", () => {
    const prompt = renderPrompt(persian);
    assert.match(prompt, /^تو مارکوس هستی، رفیق گروه\./);
    assert.match(prompt, /بی‌اندازه گرم و مهربون/);
    assert.match(prompt, /به فارسی جواب بده\./);
    assert.match(prompt, /هیچ‌وقت:\n- کد رو تغییر بده\./);
    assert.doesNotMatch(prompt, /Stay in character/);
  });

  it("names other languages in English", () => {
    const prompt = renderPrompt({ ...emptyPersona("tr"), traits: { warmth: 90 } });
    assert.match(prompt, /Reply in Turkish\./);
  });

  it("is deterministic and compact", () => {
    assert.equal(renderPrompt(english), renderPrompt(structuredClone(english)));
    assert.ok(renderPrompt(english).length < 900);
  });

  it("handles a blank persona", () => {
    assert.equal(renderPrompt(emptyPersona("en")), "You are an AI assistant.\n\nReply in English.");
  });
});
