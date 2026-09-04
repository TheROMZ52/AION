import {
  AionAssignment,
  AionBond,
  AionMemoryRule,
  AionPersonaRule,
  AionPreference,
  AionPrimeRule,
  AionProgram,
  AionReaction,
} from "./ast";

/** Canonical semantic representation used by later compiler stages. */
export interface AionIR {
  kind: "AION_IR";
  version: 3;
  identity: { id: string; role: string };
  mind: Record<string, number>;
  voice: Record<string, string | number>;
  bond: { relationship?: string; distance?: number };
  /** Evaluation order: stable baseline first, contextual overrides last. */
  precedence: readonly AionIRLayer[];
  reactions: AionIRRule[];
  preferences: AionIRRule[];
  memory: AionIRRule[];
  persona: AionIRRule[];
  prime: AionIRRule[];
}

export type AionIRLayer = "MIND" | "VOICE" | "BOND" | "PREF" | "MEMORY" | "PERSONA" | "PRIME" | "REACT";

/** A typed rule. The original expression is retained for lossless canonical printing. */
export interface AionIRRule {
  expression: string;
  semantic: AionSemanticRule;
}

export type AionSemanticRule =
  | AionConditionalRule
  | AionAssignmentRule
  | AionPreferenceRule
  | AionMemoryRule
  | AionDirectiveRule;

export interface AionConditionalRule {
  kind: "conditional";
  condition: AionCondition;
  actions: AionAction[];
}

export interface AionCondition {
  kind: "condition";
  subject: string;
  selector: string;
}

export type AionAction =
  | AionSetAction
  | AionDirectiveAction;

export interface AionSetAction {
  kind: "action";
  type: "set";
  target: string;
  value: string | number;
  operation: "set" | "add" | "subtract";
}

export interface AionDirectiveAction {
  kind: "action";
  type: "directive";
  value: string;
}

export interface AionAssignmentRule {
  kind: "assignment";
  target: string;
  value: string;
}

export interface AionPreferenceRule {
  kind: "preference";
  target: string;
  value: string | number;
  scope: "user";
}

export interface AionMemoryRule {
  kind: "memory";
  subject: string;
  target: string;
  operation: "keep" | "set" | "forget";
  persistence: "persistent" | "session";
  value?: string | number;
}

export interface AionDirectiveRule {
  kind: "directive";
  value: string;
}

function assignmentMap(assignments: AionAssignment[]): Record<string, string | number> {
  const result: Record<string, string | number> = {};
  for (const assignment of assignments) result[assignment.key] = assignment.value;
  return result;
}

function rules<T extends { expression: string }>(items: T[], section: AionRuleSection): AionIRRule[] {
  return items.map((item) => {
    const expression = normalizeExpression(item.expression);
    return { expression, semantic: parseSemanticRule(expression, section) };
  });
}

type AionRuleSection = "REACT" | "PREF" | "MEMORY" | "PERSONA" | "PRIME";

/** Collapse source whitespace without changing rule meaning. */
export function normalizeExpression(expression: string): string {
  return expression.trim().replace(/\s+/g, " ");
}

/**
 * Converts AION rules into typed semantic nodes. Section context is part of
 * the grammar: PREF and MEMORY are not generic directives, and REACT owns
 * conditional behavior.
 */
export function parseSemanticRule(expression: string, section: AionRuleSection = "REACT"): AionSemanticRule {
  const normalized = normalizeExpression(expression);

  if (section === "MEMORY") return parseMemoryRule(normalized);
  if (section === "PREF") return parsePreferenceRule(normalized);

  const conditional = parseConditionalRule(normalized);
  if (conditional) return conditional;

  const assignment = normalized.match(/^([A-Za-z_][A-Za-z0-9_.]*)\s*::\s*(.+)$/);
  if (assignment) return { kind: "assignment", target: assignment[1], value: assignment[2].trim() };

  return { kind: "directive", value: normalized };
}

function parseConditionalRule(expression: string): AionConditionalRule | undefined {
  const chain = expression.split(/\s*→\s*/).map((part) => part.trim()).filter(Boolean);
  if (chain.length < 2) return undefined;

  const match = chain[0].match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[\s*([^\]]+)\s*\]$/);
  if (!match) return undefined;

  return {
    kind: "conditional",
    condition: {
      kind: "condition",
      subject: match[1],
      selector: normalizeExpression(match[2]),
    },
    actions: splitActions(chain.slice(1).join(" → ")).map(parseAction),
  };
}

function splitActions(expression: string): string[] {
  const actions: string[] = [];
  let current = "";
  let depth = 0;

  for (const char of expression) {
    if (char === "[") depth += 1;
    if (char === "]") depth = Math.max(0, depth - 1);
    if (char === "," && depth === 0) {
      if (current.trim()) actions.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  if (current.trim()) actions.push(current.trim());
  return actions;
}

function parseAction(expression: string): AionAction {
  const directive = expression.trim();
  const bracket = directive.match(/^([A-Za-z_][A-Za-z0-9_.]*)\s*\[\s*([^\]]+)\s*\]$/);
  if (bracket) {
    const rawValue = bracket[2].trim();
    const signed = rawValue.match(/^([+-])(\d+(?:\.\d+)?)$/);
    if (signed) {
      return {
        kind: "action",
        type: "set",
        target: bracket[1],
        value: Number(signed[2]),
        operation: signed[1] === "+" ? "add" : "subtract",
      };
    }

    const numeric = Number(rawValue);
    return {
      kind: "action",
      type: "set",
      target: bracket[1],
      value: Number.isFinite(numeric) && rawValue !== "" ? numeric : rawValue,
      operation: "set",
    };
  }

  const assignment = directive.match(/^([A-Za-z_][A-Za-z0-9_.]*)\s*::\s*(.+)$/);
  if (assignment) {
    return {
      kind: "action",
      type: "set",
      target: assignment[1],
      value: assignment[2].trim(),
      operation: "set",
    };
  }

  return { kind: "action", type: "directive", value: directive };
}

function parsePreferenceRule(expression: string): AionPreferenceRule {
  const assignment = expression.match(/^([A-Za-z_][A-Za-z0-9_.]*)\s*::\s*(.+)$/);
  if (assignment) {
    return { kind: "preference", target: assignment[1], value: parseScalar(assignment[2].trim()), scope: "user" };
  }

  const shorthand = expression.match(/^(.+?)\s+([^\s]+)$/);
  if (shorthand) {
    return { kind: "preference", target: normalizePreferenceTarget(shorthand[1]), value: parseScalar(shorthand[2]), scope: "user" };
  }

  return { kind: "preference", target: expression, value: true as unknown as string, scope: "user" };
}

function normalizePreferenceTarget(target: string): string {
  return target.trim().replace(/\s+/g, ".").toLowerCase();
}

function parseMemoryRule(expression: string): AionMemoryRule {
  const match = expression.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[\s*([^\]]+)\s*\]\s*=\s*(KEEP|SET|FORGET)(?:\s*\[\s*([^\]]+)\s*\])?$/i);
  if (!match) {
    return {
      kind: "memory",
      subject: "USER",
      target: expression,
      operation: "keep",
      persistence: "persistent",
    };
  }

  return {
    kind: "memory",
    subject: match[1].toUpperCase(),
    target: normalizeExpression(match[2]),
    operation: match[3].toLowerCase() as AionMemoryRule["operation"],
    persistence: "persistent",
    ...(match[4] !== undefined ? { value: parseScalar(match[4].trim()) } : {}),
  };
}

function parseScalar(value: string): string | number {
  const numeric = Number(value);
  return Number.isFinite(numeric) && value !== "" ? numeric : value;
}

export function lowerToIR(ast: AionProgram): AionIR {
  const mind = assignmentMap(ast.mind.values);
  const voice = assignmentMap(ast.voice.values);
  const numericMind: Record<string, number> = {};

  for (const [key, value] of Object.entries(mind)) {
    if (typeof value === "number") numericMind[key] = value;
  }

  return {
    kind: "AION_IR",
    version: 3,
    identity: { id: ast.identity.id, role: ast.identity.role },
    mind: numericMind,
    voice,
    bond: lowerBond(ast.bond),
    precedence: ["MIND", "VOICE", "BOND", "PREF", "MEMORY", "PERSONA", "PRIME", "REACT"],
    reactions: rules(ast.react, "REACT"),
    preferences: rules(ast.pref, "PREF"),
    memory: rules(ast.memory, "MEMORY"),
    persona: rules(ast.persona, "PERSONA"),
    prime: rules(ast.prime, "PRIME"),
  };
}

function lowerBond(bond: AionBond): AionIR["bond"] {
  return {
    ...(bond.relationship !== undefined ? { relationship: normalizeExpression(bond.relationship) } : {}),
    ...(bond.distance !== undefined ? { distance: bond.distance } : {}),
  };
}

export type AionIRReaction = AionReaction;
export type AionIRPreference = AionPreference;
export type AionIRMemoryRule = AionMemoryRule;
export type AionIRPersonaRule = AionPersonaRule;
export type AionIRPrimeRule = AionPrimeRule;
