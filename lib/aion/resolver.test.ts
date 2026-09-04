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

function react(selector: string, actions: AionIR["reactions"][number]["semantic"]): AionIR["reactions"][number] {
  return { expression: `USER [ ${selector} ] → test`, semantic: actions };
}

describe("resolveAion", () => {
  test("keeps the baseline immutable when no reaction matches", () => {
    const ir = { ...base, reactions: [react("UPSET", {
      kind: "conditional",
      condition: { kind: "condition", subject: "USER", selector: "UPSET" },
      actions: [{ kind: "action", type: "set", target: "humor", value: 0, operation: "set" }],
    })] };

    const result = resolveAion(ir, { user: ["HAPPY"] });
    expect(result.mind.humor).toBe(80);
    expect(ir.mind.humor).toBe(80);
  });

  test("specific selector overrides broad ANY behavior", () => {
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
    expect(result.mind.humor).toBe(0);
    expect(result.mind.empathy).toBe(90);
    expect(result.matchedRules).toHaveLength(2);
  });

  test("multiple actions are applied in source order within a matched rule", () => {
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
    expect(result.mind.humor).toBe(0);
    expect(result.mind.empathy).toBe(90);
    expect(result.directives).toContain("NO_HUMOR");
  });
});
