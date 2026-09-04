import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { compileAion } from "./compiler";

const source = `⟪AION::1⟫
ᚫ AI
  ↳ ID: DEFAULT_AI
  ↳ ROLE: ASSISTANT
  ◉ MIND {
      warmth :: 80
      humor :: 80
      empathy :: 70
  }
  ◉ VOICE {
      lang :: FA
      mode :: CASUAL
      emoji :: SMART
      response :: NATURAL
  }
  ◉ BOND {
      USER → FRIEND
      DISTANCE → 10
  }
  ◉ REACT {
      USER [ UPSET ] → NO_HUMOR, EMPATHY[+20], SHORT
  }
  ◉ PREF {
      NAMING :: MAHBOD
  }
  ◉ MEMORY {
      USER [ NAME ] = KEEP
  }
⟫`;

describe("compileAion", () => {
  it("compiles a complete program through parse, semantic analysis, IR and prompt lowering", () => {
    const result = compileAion(source);

    assert.deepEqual(result.diagnostics, []);
    assert.ok(result.ir);
    assert.ok(result.prompt);
    assert.equal(result.ir?.identity.role, "ASSISTANT");
    assert.equal(result.ir?.mind.humor, 80);
    assert.equal(result.ir?.preferences[0]?.semantic.kind, "preference");
    assert.equal(result.ir?.memory[0]?.semantic.kind, "memory");

    const reaction = result.ir?.reactions[0]?.semantic;
    assert.equal(reaction?.kind, "conditional");
    if (reaction?.kind === "conditional") {
      assert.equal(reaction.actions.length, 3);
      assert.equal(reaction.actions[0].type, "directive");
      assert.equal(reaction.actions[1].type, "set");
      assert.equal(reaction.actions[2].type, "directive");
      assert.equal(reaction.actions[1].operation, "add");
      assert.equal(reaction.actions[1].value, 20);
    }

    assert.match(result.prompt ?? "", /AION RUNTIME CONTRACT v1/);
    assert.match(result.prompt ?? "", /no humor, then increase Empathy by 20, then short/);
    assert.match(result.prompt ?? "", /Honor this user preference: Naming = MAHBOD/);
    assert.match(result.prompt ?? "", /Follow this memory instruction: USER Name keep/);
  });
});
