import { AionIR, normalizeExpression } from "./ir";

/**
 * Prints AION IR into one deterministic source representation.
 * The output is intentionally stable: same IR => byte-for-byte equivalent
 * formatting, making it suitable for snapshots, caching and compiler tests.
 */
export function printAion(ir: AionIR): string {
  const lines: string[] = ["⟪AION::1⟫", "", "ᚫ AI"];

  lines.push(`  ↳ ID: ${ir.identity.id}`);
  lines.push(`  ↳ ROLE: ${ir.identity.role}`);
  lines.push("");

  printAssignments(lines, "MIND", ir.mind, 2);
  printAssignments(lines, "VOICE", ir.voice, 2);
  printBond(lines, ir);
  printRules(lines, "REACT", ir.reactions.map((r) => r.expression));
  printRules(lines, "PREF", ir.preferences.map((r) => r.expression));
  printRules(lines, "MEMORY", ir.memory.map((r) => r.expression));
  printRules(lines, "PERSONA", ir.persona.map((r) => r.expression));
  printRules(lines, "PRIME", ir.prime.map((r) => r.expression));

  lines.push("⟫");
  return lines.join("\n");
}

function printAssignments(
  lines: string[],
  section: "MIND" | "VOICE",
  values: Record<string, string | number>,
  indent: number,
): void {
  if (Object.keys(values).length === 0) return;
  lines.push(`  ◉ ${section} {`);
  const entries = Object.entries(values).sort(([a], [b]) => a.localeCompare(b));
  for (const [key, value] of entries) {
    lines.push(`${" ".repeat(indent * 2 + 2)}${key.padEnd(section === "MIND" ? 9 : 8, " ")} :: ${formatValue(value)}`);
  }
  lines.push("  }");
  lines.push("");
}

function printBond(lines: string[], ir: AionIR): void {
  if (ir.bond.relationship === undefined && ir.bond.distance === undefined) return;
  lines.push("  ◉ BOND {");
  if (ir.bond.relationship !== undefined) lines.push(`      USER → ${normalizeExpression(ir.bond.relationship)}`);
  if (ir.bond.distance !== undefined) lines.push(`      DISTANCE → ${String(ir.bond.distance).padStart(2, "0")}`);
  lines.push("  }");
  lines.push("");
}

function printRules(lines: string[], section: string, expressions: string[]): void {
  if (expressions.length === 0) return;
  lines.push(`  ◉ ${section} {`);
  for (const expression of expressions) lines.push(`      ${normalizeExpression(expression)}`);
  lines.push("  }");
  lines.push("");
}

function formatValue(value: string | number): string {
  if (typeof value === "number") return String(value);
  return value;
}
