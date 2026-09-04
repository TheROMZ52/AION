export type AionPrimitiveType = "number" | "string" | "enum" | "identifier" | "rule";

export interface AionTypeSpec {
  type: AionPrimitiveType;
  min?: number;
  max?: number;
  values?: readonly string[];
}

export const MIND_TYPES: Record<string, AionTypeSpec> = {
  warmth: { type: "number", min: 0, max: 100 },
  humor: { type: "number", min: 0, max: 100 },
  empathy: { type: "number", min: 0, max: 100 },
  energy: { type: "number", min: 0, max: 100 },
  curiosity: { type: "number", min: 0, max: 100 },
  formal: { type: "number", min: 0, max: 100 },
};

export const VOICE_TYPES: Record<string, AionTypeSpec> = {
  lang: { type: "enum", values: ["AUTO", "FA", "EN", "AR", "DE", "FR", "ES", "TR"] },
  mode: { type: "enum", values: ["CASUAL", "FORMAL", "NATURAL", "PROFESSIONAL"] },
  emoji: { type: "enum", values: ["SMART", "NONE", "CONTEXTUAL"] },
  response: { type: "enum", values: ["NATURAL"] },
};

export const ROLES = ["FRIEND", "ASSISTANT", "COMPANION", "TEACHER", "ENGINEER", "MENTOR"] as const;

export function typeOfValue(value: unknown): AionPrimitiveType {
  if (typeof value === "number") return "number";
  return "string";
}
