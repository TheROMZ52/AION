import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AION_COMPILER_GUIDE, AION_COMPILER_KNOWLEDGE } from "./knowledge";

describe("AION semantic training contract", () => {
  it("teaches the compiler that persistent user constraints belong in PREF", () => {
    assert.match(AION_COMPILER_KNOWLEDGE, /Persistent user-owned constraints normally map to PREF/);
    assert.match(AION_COMPILER_KNOWLEDGE, /کد رو تغییر نده/);
    assert.match(AION_COMPILER_KNOWLEDGE, /همیشه داخل کدها با کامنت/);
  });

  it("teaches modality, negation, and multi-directive preservation", () => {
    assert.match(AION_COMPILER_KNOWLEDGE, /Preserve strong modality/);
    assert.match(AION_COMPILER_KNOWLEDGE, /NEGATION LAW/);
    assert.match(AION_COMPILER_KNOWLEDGE, /Splitting them into multiple PREF rules/);
  });

  it("ships the normative compiler guide into runtime LLM knowledge", () => {
    assert.match(AION_COMPILER_GUIDE, /AION SEMANTIC COMPILER GUIDE v0\.1/);
    assert.match(AION_COMPILER_GUIDE, /ADVANCED CONTEXT/);
    assert.match(AION_COMPILER_GUIDE, /A non-empty Constraints field MUST survive compilation/);
    assert.match(AION_COMPILER_GUIDE, /prohibit unwanted code modification/);
    assert.match(AION_COMPILER_GUIDE, /require comments and organized code/);
    assert.match(AION_COMPILER_KNOWLEDGE, /AION SEMANTIC COMPILER GUIDE v0\.1/);
  });
});
