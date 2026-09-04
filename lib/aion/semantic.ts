import { AionDiagnostic, AionProgram } from "./ast";
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

  return diagnostics;
}
