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
  version: 2;
  identity: { id: string; role: string };
  mind: Record<string, number>;
  voice: Record<string, string | number>;
  bond: { relationship?: string; distance?: number };
  reactions: AionIRRule[];
  preferences: AionIRRule[];
  memory: AionIRRule[];
  persona: AionIRRule[];
  prime: AionIRRule[];
}

/** A typed rule. The original expression is retained for lossless canonical printing. */
export interface AionIRRule {
  expression: string;
  semantic: AionSemanticRule;
}

export type AionSemanticRule =
  | AionConditionalRule
  | AionAssignmentRule
  | AionDirectiveRule;

export interface AionConditionalRule {
  kind: "conditional";
  condition: AionCondition;
  actions: AionAction[];
}

export interface AionAssignmentRule {
  kind: "assignment";
  target: string;
  value: string;
}

export interface AionDirectiveRule {
  kind: "directive";
  value: string;
}

export interface AionCondition {
  subject: string;
  selector: string;
}

export interface AionAction {
  type: "set" | "directive";
  target?: string;
  value: string | number;
}

function assignmentMap(assignments: AionAssignment[]): Record<string, string | number> {
  const result: Record<string, string | number> = {};
  for (const assignment of assignments) result[assignment.key] = assignment.value;
  return result;
}

function rules<T extends { expression: string }>(items: T[]): AionIRRule[] {
  return items.map((item) => {
    const expression = normalizeExpression(item.expression);
    return { expression, semantic: parseSemanticRule(expression) };
  });
}

/** Collapse source whitespace without changing rule meaning. */
export function normalizeExpression(expression: string): string {
  return expression.trim().replace(/\s+/g, " ");
}

/**
 * Converts common AION rule forms into typed semantic nodes.
 * Unknown forms remain directives instead of being guessed or discarded.
 */
export function parseSemanticRule(expression: string): AionSemanticRule {
  const assignment = expression.match(/^([A-Za-z_][A-Za-z0-9_.]*)\s*::\s*(.+)$/);
  if (assignment) {
    return { kind: "assignment", target: assignment[1], value: assignment[2].trim() };
  }

  const chain = expression.split(/\s*→\s*/).map((part) => part.trim()).filter(Boolean);
  const condition = chain.shift();
  if (condition) {
    const match = condition.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[\s*([^\]]+)\s*\]$/);
    if (match && chain.length > 0) {
      return {
        kind: "conditional",
        condition: { subject: match[1], selector: normalizeExpression(match[2]) },
        actions: chain.map(parseAction),
      };
    }
  }

  return { kind: "directive", value: expression };
}

function parseAction(expression: string): AionAction {
  const bracket = expression.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*\[\s*([^\]]+)\s*\]$/);
  if (bracket) {
    const rawValue = bracket[2].trim();
    const numeric = Number(rawValue);
    return {
      type: "set",
      target: bracket[1],
      value: Number.isFinite(numeric) && rawValue !== "" ? numeric : rawValue,
    };
  }

  const assignment = expression.match(/^([A-Za-z_][A-Za-z0-9_.]*)\s*::\s*(.+)$/);
  if (assignment) return { type: "set", target: assignment[1], value: assignment[2].trim() };

  return { type: "directive", value: expression };
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
    version: 2,
    identity: { id: ast.identity.id, role: ast.identity.role },
    mind: numericMind,
    voice,
    bond: lowerBond(ast.bond),
    reactions: rules(ast.react),
    preferences: rules(ast.pref),
    memory: rules(ast.memory),
    persona: rules(ast.persona),
    prime: rules(ast.prime),
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
