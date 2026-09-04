import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveAion } from "./resolver";
import type { AionIR, AionIRRule } from "./ir";

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

function conditional(
  selector: string,
  actions: Extract<AionIRRule["semantic"], { kind: "conditional" }>["actions"],
): AionIRRule {
  return {
    expression: `USER [ ${selector} ] → test`,
    semantic: {
      kind: "conditional",
      condition: { kind: "condition", subject: "USER", selector },
      actions,
    },
  };
}

describe("resolveAion", () => {
  it("keeps the baseline personality when no reaction matches", () => {
    const ir = {
      ...base,
      reactions: [conditional("UPSET", [
        { kind: "action", type: "set", target: "humor", value: 0, operation: "set" },
      ])],
    };

    const result = resolveAion(ir, { user: ["HAPPY"] });
    assert.equal(result.mind.humor, 80);
    assert.deepEqual(ir.mind, base.mind);
  });

  it("treats contextual no-humor as an overlay, not a new baseline", () => {
    const ir = {
      ...base,
      reactions: [conditional("UPSET", [
        { kind: "action", type: "directive", value: "NO_HUMOR" },
      ])],
    };

    const upset = resolveAion(ir, { user: ["UPSET"] });
    const normal = resolveAion(ir, { user: ["CALM"] });

    assert.equal(upset.mind.humor, 80);
    assert.ok(upset.directives.includes("NO_HUMOR"));
    assert.equal(normal.mind.humor, 80);
    assert.ok(!normal.directives.includes("NO_HUMOR"));
  });

  it("lets a specific selector override broad ANY behavior", () => {
    const ir = {
      ...base,
      reactions: [
        conditional("ANY", [
          { kind: "action", type: "set", target: "humor", value: 50, operation: "set" },
        ]),
        conditional("UPSET", [
          { kind: "action", type: "set", target: "humor", value: 0, operation: "set" },
          { kind: "action", type: "set", target: "empathy", value: 20, operation: "add" },
        ]),
      ],
    };

    const result = resolveAion(ir, { user: ["UPSET"] });
    assert.equal(result.mind.humor, 0);
    assert.equal(result.mind.empathy, 90);
    assert.equal(result.matchedRules.length, 2);
  });

  it("applies multiple actions in source order within a matched rule", () => {
    const ir = {
      ...base,
      reactions: [conditional("ANGRY", [
        { kind: "action", type: "set", target: "humor", value: 0, operation: "set" },
        { kind: "action", type: "set", target: "empathy", value: 20, operation: "add" },
        { kind: "action", type: "directive", value: "NO_HUMOR" },
      ])],
    };

    const result = resolveAion(ir, { user: ["ANGRY"] });
    assert.equal(result.mind.humor, 0);
    assert.equal(result.mind.empathy, 90);
    assert.ok(result.directives.includes("NO_HUMOR"));
  });

  it("supports numeric add and subtract operations", () => {
    const ir = {
      ...base,
      reactions: [conditional("EXCITED", [
        { kind: "action", type: "set", target: "warmth", value: 5, operation: "add" },
        { kind: "action", type: "set", target: "empathy", value: 10, operation: "subtract" },
      ])],
    };

    const result = resolveAion(ir, { user: ["EXCITED"] });
    assert.equal(result.mind.warmth, 95);
    assert.equal(result.mind.empathy, 60);
  });

  it("matches topic conditions separately from user-state conditions", () => {
    const ir = {
      ...base,
      reactions: [{
        expression: "TOPIC [ SERIOUS ] → SERIOUS_MODE",
        semantic: {
          kind: "conditional" as const,
          condition: { kind: "condition" as const, subject: "TOPIC", selector: "SERIOUS" },
          actions: [{ kind: "action" as const, type: "directive" as const, value: "SERIOUS_MODE" }],
        },
      }],
    };

    const result = resolveAion(ir, { topic: ["SERIOUS"] });
    assert.ok(result.directives.includes("SERIOUS_MODE"));
    assert.equal(result.matchedRules.length, 1);
  });

  it("materializes PREF independently from MIND", () => {
    const ir: AionIR = {
      ...base,
      preferences: [{
        expression: "NAMING :: MAHBOD",
        semantic: { kind: "preference", target: "NAMING", value: "MAHBOD", scope: "user" },
      }],
    };

    const result = resolveAion(ir);
    assert.equal(result.preferences.NAMING, "MAHBOD");
    assert.equal(result.mind.humor, 80);
    assert.equal(result.mind.warmth, 90);
  });

  it("does not turn MEMORY storage rules into personality or directives", () => {
    const ir: AionIR = {
      ...base,
      memory: [{
        expression: "USER [ NAME ] = KEEP",
        semantic: {
          kind: "memory",
          subject: "USER",
          target: "NAME",
          operation: "keep",
          persistence: "persistent",
        },
      }],
    };

    const result = resolveAion(ir);
    assert.equal(result.mind.humor, 80);
    assert.equal(result.mind.empathy, 70);
    assert.deepEqual(result.directives, []);
  });

  it("does not mutate the IR while applying reactions", () => {
    const ir = {
      ...base,
      reactions: [conditional("UPSET", [
        { kind: "action", type: "set", target: "warmth", value: 10, operation: "set" },
      ])],
    };

    resolveAion(ir, { user: ["UPSET"] });
    resolveAion(ir, { user: ["CALM"] });

    assert.equal(ir.mind.warmth, 90);
    assert.equal(ir.reactions.length, 1);
  });
});
