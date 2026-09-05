import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AION_COMPILER_KNOWLEDGE } from "./knowledge";

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
});
