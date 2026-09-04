import { AionDiagnostic, AionProgram } from "./ast";
import {
  AionAction,
  AionConditionalRule,
  AionIRMemoryRule,
  AionPreferenceRule,
  parseSemanticRule,
} from "./ir";
import { MIND_TYPES, ROLES, VOICE_TYPES } from "./types";

function diagnostic(message: string, line: number, column = 1, severity: "error" | "warning" = "error"): AionDiagnostic {
  return { severity, message, line, column };
}

export function analyzeAion(ast: AionProgram): AionDiagnostic[] {
  const diagnostics: AionDiagnostic[] = [];

  if (!/^[A-Z][A-Z0-9_]*$/.test(ast.identity.id)) {
    diagnostics.push(diagnostic("AI ID must be UPPER_SNAKE_CASE.", ast.identity.line));
  }

  if (!ROLES.includes(ast.identity.role as (typeof ROLES)[number])) {
    diagnostics.push(diagnostic(`Unknown AI role '${ast.identity.role}'.`, ast.identity.line));
  }

  const seenMind = new Set<string>();
  for (const assignment of ast.mind.values) {
    const spec = MIND_TYPES[assignment.key];
    if (!spec) {
      diagnostics.push(diagnostic(`Unknown MIND property '${assignment.key}'.`, assignment.line));
      continue;
    }
    if (seenMind.has(assignment.key)) {
      diagnostics.push(diagnostic(`Duplicate MIND property '${assignment.key}'.`, assignment.line, 1, "warning"));
    }
    seenMind.add(assignment.key);
    if (typeof assignment.value !== "number" || !Number.isInteger(assignment.value)) {
      diagnostics.push(diagnostic(`MIND.${assignment.key} must be an integer.`, assignment.line));
      continue;
    }
    if (assignment.value < spec.min! || assignment.value > spec.max!) {
      diagnostics.push(diagnostic(`MIND.${assignment.key} must be between ${spec.min} and ${spec.max}; received ${assignment.value}.`, assignment.line));
    }
  }

  const seenVoice = new Set<string>();
  for (const assignment of ast.voice.values) {
    const spec = VOICE_TYPES[assignment.key];
    if (!spec) {
      diagnostics.push(diagnostic(`Unknown VOICE property '${assignment.key}'.`, assignment.line));
      continue;
    }
    if (seenVoice.has(assignment.key)) {
      diagnostics.push(diagnostic(`Duplicate VOICE property '${assignment.key}'.`, assignment.line, 1, "warning"));
    }
    seenVoice.add(assignment.key);
    if (typeof assignment.value !== "string") {
      diagnostics.push(diagnostic(`VOICE.${assignment.key} must be symbolic text.`, assignment.line));
      continue;
    }
    if (spec.values && !spec.values.includes(assignment.value)) {
      diagnostics.push(diagnostic(`Invalid VOICE.${assignment.key} '${assignment.value}'. Expected: ${spec.values.join(", ")}.`, assignment.line));
    }
  }

  if (ast.bond.distance !== undefined && (!Number.isInteger(ast.bond.distance) || ast.bond.distance < 0 || ast.bond.distance > 100)) {
    diagnostics.push(diagnostic(`BOND.DISTANCE must be an integer from 0 to 100; received ${ast.bond.distance}.`, ast.bond.line));
  }

  validateRules(ast, diagnostics);
  return diagnostics;
}

function validateRules(ast: AionProgram, diagnostics: AionDiagnostic[]): void {
  for (const rule of ast.react) {
    const semantic = parseSemanticRule(rule.expression, "REACT");
    if (semantic.kind !== "conditional") {
      diagnostics.push(diagnostic("REACT rule must be a conditional rule: SUBJECT [ SELECTOR ] → ACTION.", rule.line));
      continue;
    }
    validateConditionalRule(semantic, rule.line, diagnostics);
  }

  for (const rule of ast.pref) {
    const semantic = parseSemanticRule(rule.expression, "PREF");
    if (semantic.kind !== "preference") {
      diagnostics.push(diagnostic("PREF rule must be a preference rule.", rule.line));
      continue;
    }
    validatePreferenceRule(semantic, rule.line, diagnostics);
  }

  for (const rule of ast.memory) {
    const semantic = parseSemanticRule(rule.expression, "MEMORY");
    if (semantic.kind !== "memory" || !isMemorySyntax(rule.expression)) {
      diagnostics.push(diagnostic("MEMORY rule must use USER [ TARGET ] = KEEP|SET|FORGET.", rule.line));
      continue;
    }
    validateMemoryRule(semantic, rule.line, diagnostics);
  }
}

function validateConditionalRule(rule: AionConditionalRule, line: number, diagnostics: AionDiagnostic[]): void {
  if (!rule.condition.subject || !rule.condition.selector) {
    diagnostics.push(diagnostic("CONDITION requires both a subject and selector.", line));
  }
  if (rule.actions.length === 0) {
    diagnostics.push(diagnostic("ACTION list cannot be empty.", line));
  }
  for (const action of rule.actions) validateAction(action, line, diagnostics);
}

function validateAction(action: AionAction, line: number, diagnostics: AionDiagnostic[]): void {
  if (action.type === "directive") {
    if (!action.value.trim()) diagnostics.push(diagnostic("ACTION directive cannot be empty.", line));
    return;
  }

  if (!action.target.trim()) {
    diagnostics.push(diagnostic("ACTION target cannot be empty.", line));
  }
  if (typeof action.value === "number" && !Number.isFinite(action.value)) {
    diagnostics.push(diagnostic("ACTION numeric value must be finite.", line));
  }
}

function validatePreferenceRule(rule: AionPreferenceRule, line: number, diagnostics: AionDiagnostic[]): void {
  if (!rule.target.trim()) diagnostics.push(diagnostic("PREFERENCE target cannot be empty.", line));
  if (typeof rule.value === "string" && !rule.value.trim()) {
    diagnostics.push(diagnostic("PREFERENCE value cannot be empty.", line));
  }
}

function validateMemoryRule(rule: AionIRMemoryRule, line: number, diagnostics: AionDiagnostic[]): void {
  if (!rule.subject.trim()) diagnostics.push(diagnostic("MEMORY subject cannot be empty.", line));
  if (!rule.target.trim()) diagnostics.push(diagnostic("MEMORY target cannot be empty.", line));
  if (!["keep", "set", "forget"].includes(rule.operation)) {
    diagnostics.push(diagnostic(`Invalid MEMORY operation '${rule.operation}'.`, line));
  }
  if (!["persistent", "session"].includes(rule.persistence)) {
    diagnostics.push(diagnostic(`Invalid MEMORY persistence '${rule.persistence}'.`, line));
  }
  if (rule.operation === "set" && rule.value === undefined) {
    diagnostics.push(diagnostic("MEMORY SET requires a value.", line));
  }
}

function isMemorySyntax(expression: string): boolean {
  return /^([A-Za-z_][A-Za-z0-9_]*)\s*\[\s*([^\]]+)\s*\]\s*=\s*(KEEP|SET|FORGET)(?:\s*\[\s*([^\]]+)\s*\])?$/i.test(expression.trim());
}
