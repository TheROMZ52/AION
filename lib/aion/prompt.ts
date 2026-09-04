import { AionIR, AionIRRule, AionSemanticRule } from "./ir";
import { AION_RUNTIME_KNOWLEDGE } from "./knowledge";

/**
 * Deterministic AION -> system-prompt compiler.
 *
 * The LLM is only responsible for turning natural language into AION.
 * From this point onward, prompt generation is ordinary compiler logic:
 * the same IR always produces the same prompt.
 */
export function compileAionPrompt(ir: AionIR): string {
  const sections: string[] = [];

  sections.push(`AION RUNTIME LANGUAGE KNOWLEDGE\n${AION_RUNTIME_KNOWLEDGE}`);
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
  return rules.map((rule) => `- ${translateSemanticRule(rule.semantic, kind)}`).join("\n");
}

/** Translate the typed semantic IR into explicit runtime instructions. */
function translateSemanticRule(rule: AionSemanticRule, kind: string): string {
  if (rule.kind === "conditional") {
    const trigger = `the ${humanize(rule.condition.subject)} state is ${formatValue(rule.condition.selector)}`;
    const actions = rule.actions.map(describeSemanticAction);
    return `When ${trigger}, ${joinActions(actions)}.`;
  }

  if (rule.kind === "preference") {
    return `Honor this user preference: ${humanize(rule.target)} = ${formatValue(rule.value)}.`;
  }

  if (rule.kind === "memory") {
    const value = rule.value === undefined ? "" : ` = ${formatValue(rule.value)}`;
    return `Follow this memory instruction: ${rule.subject} ${humanize(rule.target)} ${rule.operation}${value} (${rule.persistence}).`;
  }

  if (rule.kind === "assignment") {
    return `Follow this ${kind} assignment: ${humanize(rule.target)} = ${rule.value}.`;
  }

  return `Follow this ${kind} rule: ${rule.value}.`;
}

function describeSemanticAction(action: Extract<AionSemanticRule, { kind: "conditional" }>["actions"][number]): string {
  if (action.type === "directive") return formatDirective(action.value);

  const target = humanize(action.target);
  if (action.operation === "add") return `increase ${target} by ${action.value}`;
  if (action.operation === "subtract") return `decrease ${target} by ${action.value}`;
  return `set ${target} to ${formatValue(action.value)}`;
}

function formatDirective(value: string): string {
  return value.replace(/_/g, " ").toLowerCase();
}

function joinActions(actions: string[]): string {
  if (actions.length === 0) return "do nothing";
  if (actions.length === 1) return lowerFirst(actions[0]);
  return actions.map(lowerFirst).join(", then ");
}

function lowerFirst(value: string): string {
  return value.length === 0 ? value : value.charAt(0).toLowerCase() + value.slice(1);
}

function humanize(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValue(value: string | number): string {
  return typeof value === "number" ? String(value) : value.replace(/_/g, " ");
}
