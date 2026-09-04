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

/**
 * Canonical, compiler-facing representation of an AION program.
 *
 * IR deliberately contains no source formatting concerns. Values are
 * normalized into maps and rules keep their ordered token expression so the
 * prompt compiler can consume a deterministic structure.
 */
export interface AionIR {
  kind: "AION_IR";
  version: 1;
  identity: {
    id: string;
    role: string;
  };
  mind: Record<string, number>;
  voice: Record<string, string | number>;
  bond: {
    relationship?: string;
    distance?: number;
  };
  reactions: AionIRRule[];
  preferences: AionIRRule[];
  memory: AionIRRule[];
  persona: AionIRRule[];
  prime: AionIRRule[];
}

export interface AionIRRule {
  expression: string;
}

function assignmentMap(assignments: AionAssignment[]): Record<string, string | number> {
  const result: Record<string, string | number> = {};
  for (const assignment of assignments) result[assignment.key] = assignment.value;
  return result;
}

function rules<T extends { expression: string }>(items: T[]): AionIRRule[] {
  return items.map((item) => ({ expression: normalizeExpression(item.expression) }));
}

/** Collapse source whitespace without changing rule meaning. */
export function normalizeExpression(expression: string): string {
  return expression.trim().replace(/\s+/g, " ");
}

export function lowerToIR(ast: AionProgram): AionIR {
  const mind = assignmentMap(ast.mind.values);
  const voice = assignmentMap(ast.voice.values);

  // Semantic validation guarantees these fields are numeric before lowering.
  const numericMind: Record<string, number> = {};
  for (const [key, value] of Object.entries(mind)) {
    if (typeof value === "number") numericMind[key] = value;
  }

  return {
    kind: "AION_IR",
    version: 1,
    identity: {
      id: ast.identity.id,
      role: ast.identity.role,
    },
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

// Keep these aliases exported as documentation-friendly IR boundaries.
export type AionIRReaction = AionReaction;
export type AionIRPreference = AionPreference;
export type AionIRMemoryRule = AionMemoryRule;
export type AionIRPersonaRule = AionPersonaRule;
export type AionIRPrimeRule = AionPrimeRule;
