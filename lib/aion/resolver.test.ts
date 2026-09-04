import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveAion } from "./resolver";
import type { AionIR } from "./ir";

const base: AionIR = {
  kind: "AION_IR",
  version: 3,
  identity: { id: "FRIEND_COMPANION", role: "FRIEND" },
  mind: { humor: 80, empathy: 70, warmth: 90 },
  voice: { lang: "FA", mode: "CASUAL", emoji: "CONTEXTUAL", response: "NATURAL" },
  bond: { relationship: "FRIEND", distance: 10 },
  precedence: ["MIND", "VOICE", "BOND", "PREF", "MEMORY", "PERSONA", "PRIME", "REACT"],
  reactions: [],
  preferences: [],
  memory: [],
  persona: [],
  prime: [],
};

function react(selector: string, semantic: AionIR["reactions"][number]["semantic"]): AionIR["reactions"][number] {
  return { expression: `USER [ ${selector} ] → test`, semantic };
}

describe("resolveAion", () => {
  it("keeps the baseline immutable when no reaction matches", () => {
    const ir = { ...base, reactions: [react("UPSET", {
      kind: "conditional",
      condition: { kind: "condition", subject: "USER", selector: "UPSET" },
      actions: [{ kind: "action", type: "set", target: "humor", value: 0, operation: "set" }],
    })] };

    const result = resolveAion(ir, { user: ["HAPPY"] });
    assert.equal(result.mind.humor, 80);
    assert.equal(ir.mind.humor, 80);
  });

  it("lets a specific selector override broad ANY behavior", () => {
    const ir = { ...base, reactions: [
      react("ANY", {
        kind: "conditional",
        condition: { kind: "condition", subject: "USER", selector: "ANY" },
        actions: [{ kind: "action", type: "set", target: "humor", value: 50, operation: "set" }],
      }),
      react("UPSET", {
        kind: "conditional",
        condition: { kind: "condition", subject: "USER", selector: "UPSET" },
        actions: [
          { kind: "action", type: "set", target: "humor", value: 0, operation: "set" },
          { kind: "action", type: "set", target: "empathy", value: 20, operation: "add" },
        ],
      }),
    ] };

    const result = resolveAion(ir, { user: ["UPSET"] });
    assert.equal(result.mind.humor, 0);
    assert.equal(result.mind.empathy, 90);
    assert.equal(result.matchedRules.length, 2);
  });

  it("applies multiple actions in source order within a matched rule", () => {
    const ir = { ...base, reactions: [react("ANGRY", {
      kind: "conditional",
      condition: { kind: "condition", subject: "USER", selector: "ANGRY" },
      actions: [
        { kind: "action", type: "set", target: "humor", value: 0, operation: "set" },
        { kind: "action", type: "set", target: "empathy", value: 20, operation: "add" },
        { kind: "action", type: "directive", value: "NO_HUMOR" },
      ],
    })] };

    const result = resolveAion(ir, { user: ["ANGRY"] });
    assert.equal(result.mind.humor, 0);
    assert.equal(result.mind.empathy, 90);
    assert.ok(result.directives.includes("NO_HUMOR"));
  });
});
