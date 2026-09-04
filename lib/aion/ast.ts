export type AionValue = string | number;

export interface AionAssignment {
  key: string;
  value: AionValue;
  line: number;
}

export interface AionMind {
  values: AionAssignment[];
}

export interface AionVoice {
  values: AionAssignment[];
}

export interface AionBond {
  relationship?: string;
  distance?: number;
  line: number;
}

export interface AionReaction {
  expression: string;
  line: number;
}

export interface AionPreference {
  expression: string;
  line: number;
}

export interface AionMemoryRule {
  expression: string;
  line: number;
}

export interface AionPersonaRule {
  expression: string;
  line: number;
}

export interface AionPrimeRule {
  expression: string;
  line: number;
}

export interface AionProgram {
  version: string;
  identity: {
    id: string;
    role: string;
    line: number;
  };
  mind: AionMind;
  voice: AionVoice;
  bond: AionBond;
  react: AionReaction[];
  pref: AionPreference[];
  memory: AionMemoryRule[];
  persona: AionPersonaRule[];
  prime: AionPrimeRule[];
}

export interface AionDiagnostic {
  severity: "error" | "warning";
  message: string;
  line: number;
  column?: number;
}

export interface AionParseResult {
  ast?: AionProgram;
  diagnostics: AionDiagnostic[];
}
