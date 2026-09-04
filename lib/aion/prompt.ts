import { AionIR, AionIRRule } from "./ir";

/**
 * Deterministic AION -> system-prompt compiler.
 *
 * The LLM is only responsible for turning natural language into AION.
 * From this point onward, prompt generation is ordinary compiler logic:
 * the same IR always produces the same prompt.
 */
export function compileAionPrompt(ir: AionIR): string {
  const sections: string[] = [];

  sections.push(`You are ${ir.identity.id}, an AI whose role is ${ir.identity.role}.`);

  const personality = formatAssignments(ir.mind);
  if (personality) sections.push(`PERSONALITY\n${personality}`);

  const voice = formatAssignments(ir.voice);
  if (voice) sections.push(`VOICE\n${voice}`);

  const bond = formatBond(ir);
  if (bond) sections.push(`RELATIONSHIP\n${bond}`);

  const preferences = formatRules(ir.preferences, "preference");
  if (preferences) sections.push(`USER PREFERENCES\n${preferences}`);

  const reactions = formatRules(ir.reactions, "adaptive behavior");
  if (reactions) sections.push(`ADAPTIVE BEHAVIOR\n${reactions}`);

  const memory = formatRules(ir.memory, "memory policy");
  if (memory) sections.push(`MEMORY POLICY\n${memory}`);

  const persona = formatRules(ir.persona, "persona mode");
  if (persona) sections.push(`PERSONA MODES\n${persona}`);

  const prime = formatRules(ir.prime, "principle");
  if (prime) sections.push(`CORE PRINCIPLES\n${prime}`);

  sections.push("Apply these rules consistently. Context-specific rules override stable defaults only when their stated trigger is active. Do not invent preferences, memories, identity claims, or rules that are not defined above.");

  return sections.join("\n\n").trim();
}

function formatAssignments(values: Record<string, string | number>): string {
  return Object.entries(values)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `- ${humanize(key)}: ${formatValue(value)}`)
    .join("\n");
}

function formatBond(ir: AionIR): string {
  const lines: string[] = [];
  if (ir.bond.relationship !== undefined) lines.push(`- Relationship: ${ir.bond.relationship}`);
  if (ir.bond.distance !== undefined) lines.push(`- Interaction distance: ${ir.bond.distance}/100 (lower means closer)`);
  return lines.join("\n");
}

function formatRules(rules: AionIRRule[], kind: string): string {
  return rules.map((rule) => `- ${translateRule(rule.expression, kind)}`).join("\n");
}

/** Translate canonical AION rule syntax into explicit model instructions. */
function translateRule(expression: string, kind: string): string {
  const normalized = expression.trim().replace(/\s+/g, " ");

  const arrowParts = normalized.split(/\s*→\s*/).filter(Boolean);
  if (arrowParts.length > 1) {
    const trigger = describeTrigger(arrowParts[0]);
    const actions = arrowParts.slice(1).map(describeAction).join(" Then ");
    return `When ${trigger}, ${actions.charAt(0).toLowerCase()}${actions.slice(1)}.`;
  }

  if (kind === "preference") return `Honor this user preference: ${describeAtomicRule(normalized)}.`;
  if (kind === "memory policy") return `Follow this memory instruction: ${describeAtomicRule(normalized)}.`;
  if (kind === "persona mode") return `Use this persona behavior: ${describeAtomicRule(normalized)}.`;
  if (kind === "principle") return `Follow this principle: ${describeAtomicRule(normalized)}.`;
  return `Follow this ${kind} rule: ${describeAtomicRule(normalized)}.`;
}

function describeTrigger(value: string): string {
  const match = value.match(/^([A-Z_]+)\[([^\]]+)\]$/);
  if (!match) return value;
  const source = match[1].toLowerCase().replace(/_/g, " ");
  const state = match[2].toLowerCase().replace(/_/g, " ");
  return `the ${source} state is ${state}`;
}

function describeAction(value: string): string {
  const match = value.match(/^([A-Z_]+)\[([^\]]+)\]$/);
  if (!match) return value;
  const action = match[1].toLowerCase().replace(/_/g, " ");
  const valueText = match[2].replace(/^([+-]\d+)$/, "$1 points").replace(/_/g, " ");
  if (action === "match") return `match ${valueText}`;
  if (/^[+-]\d+ points$/.test(valueText)) return `adjust ${action} by ${valueText}`;
  return `set ${action} to ${valueText}`;
}

function describeAtomicRule(value: string): string {
  return value
    .replace(/::/g, " = ")
    .replace(/→/g, " then ")
    .replace(/\[([^\]]+)\]/g, " ($1)")
    .replace(/_/g, " ")
    .trim();
}

function humanize(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValue(value: string | number): string {
  return typeof value === "number" ? String(value) : value.replace(/_/g, " ");
}
