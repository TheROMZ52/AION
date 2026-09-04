import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { compileAionPrompt } from "./prompt";
import type { AionIR } from "./ir";

const base: AionIR = {
  kind: "AION_IR",
  version: 3,
  identity: { id: "DEFAULT_AI", role: "ASSISTANT" },
  mind: { empathy: 70, humor: 80, warmth: 80 },
  voice: { lang: "FA", mode: "CASUAL", emoji: "SMART", response: "NATURAL" },
  bond: { relationship: "FRIEND", distance: 10 },
  precedence: ["MIND", "VOICE", "BOND", "PREF", "MEMORY", "PERSONA", "PRIME", "REACT"],
  reactions: [],
  preferences: [],
  memory: [],
  persona: [],
  prime: [],
};

function clone(): AionIR {
  return structuredClone(base);
}

describe("compileAionPrompt", () => {
  it("renders every conditional action from semantic IR", () => {
    const ir = clone();
    ir.reactions = [{
      expression: "USER [ UPSET ] → NO_HUMOR, EMPATHY[+20], SHORT",
      semantic: {
        kind: "conditional",
        condition: { kind: "condition", subject: "USER", selector: "UPSET" },
        actions: [
          { kind: "action", type: "directive", value: "NO_HUMOR" },
          { kind: "action", type: "set", target: "empathy", value: 20, operation: "add" },
          { kind: "action", type: "directive", value: "SHORT" },
        ],
      },
    }];

    const prompt = compileAionPrompt(ir);
    assert.match(prompt, /When the User state is UPSET/);
    assert.match(prompt, /no humor, then increase Empathy by 20, then short/);
    assert.doesNotMatch(prompt, /EMPAT\[\+20\]/);
  });

  it("keeps user preferences separate from personality", () => {
    const ir = clone();
    ir.preferences = [{
      expression: "NAMING :: MAHBOD",
      semantic: { kind: "preference", target: "NAMING", value: "MAHBOD", scope: "user" },
    }];

    const prompt = compileAionPrompt(ir);
    const personality = prompt.split("PERSONALITY\n")[1]?.split("\n\n")[0] ?? "";
    assert.match(prompt, /Honor this user preference: Naming = MAHBOD/);
    assert.match(personality, /Humor: 80/);
    assert.doesNotMatch(personality, /MAHBOD/);
  });

  it("renders typed memory semantics without turning them into behavior", () => {
    const ir = clone();
    ir.memory = [{
      expression: "USER [ NAME ] = KEEP",
      semantic: {
        kind: "memory",
        subject: "USER",
        target: "NAME",
        operation: "keep",
        persistence: "persistent",
      },
    }];

    const prompt = compileAionPrompt(ir);
    assert.match(prompt, /Follow this memory instruction: USER Name keep \(persistent\)/);
    assert.ok(prompt.includes("MEMORY POLICY"));
    assert.ok(!prompt.includes("PERSONALITY\n- Name"));
  });

  it("is deterministic for identical IR", () => {
    const ir = clone();
    ir.reactions = [{
      expression: "USER [ UPSET ] → NO_HUMOR",
      semantic: {
        kind: "conditional",
        condition: { kind: "condition", subject: "USER", selector: "UPSET" },
        actions: [{ kind: "action", type: "directive", value: "NO_HUMOR" }],
      },
    }];

    assert.equal(compileAionPrompt(ir), compileAionPrompt(structuredClone(ir)));
  });
});
