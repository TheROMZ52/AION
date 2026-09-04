import { AionDiagnostic, AionProgram } from "./ast";

const MIND_KEYS = new Set(["warmth", "humor", "empathy", "energy", "curiosity", "formal"]);
const VOICE_KEYS = new Set(["lang", "mode", "emoji", "response"]);

export function analyzeAion(ast: AionProgram): AionDiagnostic[] {
  const diagnostics: AionDiagnostic[] = [];

  if (!/^[A-Z][A-Z0-9_]*$/.test(ast.identity.id)) {
    diagnostics.push({ severity: "error", message: "AI ID must be UPPER_SNAKE_CASE.", line: ast.identity.line });
  }

  if (!/^[A-Z][A-Z0-9_]*$/.test(ast.identity.role)) {
    diagnostics.push({ severity: "error", message: "AI ROLE must be an uppercase identifier.", line: ast.identity.line });
  }

  for (const assignment of ast.mind.values) {
    if (!MIND_KEYS.has(assignment.key)) {
      diagnostics.push({ severity: "error", message: `Unknown MIND trait '${assignment.key}'.`, line: assignment.line });
      continue;
    }
    if (typeof assignment.value !== "number" || !Number.isInteger(assignment.value) || assignment.value < 0 || assignment.value > 100) {
      diagnostics.push({ severity: "error", message: `MIND.${assignment.key} must be an integer from 0 to 100.`, line: assignment.line });
    }
  }

  for (const assignment of ast.voice.values) {
    if (!VOICE_KEYS.has(assignment.key)) {
      diagnostics.push({ severity: "error", message: `Unknown VOICE field '${assignment.key}'.`, line: assignment.line });
    }
  }

  if (ast.bond.distance !== undefined && (!Number.isInteger(ast.bond.distance) || ast.bond.distance < 0 || ast.bond.distance > 100)) {
    diagnostics.push({ severity: "error", message: "BOND.DISTANCE must be an integer from 0 to 100.", line: ast.bond.line });
  }

  const seenMind = new Set<string>();
  for (const item of ast.mind.values) {
    if (seenMind.has(item.key)) diagnostics.push({ severity: "error", message: `Duplicate MIND trait '${item.key}'.`, line: item.line });
    seenMind.add(item.key);
  }

  return diagnostics;
}
