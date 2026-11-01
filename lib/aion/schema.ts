export const TRAIT_KEYS = [
  "warmth",
  "humor",
  "empathy",
  "formality",
  "directness",
  "energy",
  "curiosity",
  "patience",
] as const;

export type TraitKey = (typeof TRAIT_KEYS)[number];
export type Length = "short" | "balanced" | "detailed";
export type EmojiUse = "none" | "rare" | "often";

export const LENGTHS: Length[] = ["short", "balanced", "detailed"];
export const EMOJI_USES: EmojiUse[] = ["none", "rare", "often"];

export interface Situation {
  if: string;
  then: string;
}

export interface Persona {
  name?: string;
  role?: string;
  about?: string;
  language: string;
  traits: Partial<Record<TraitKey, number>>;
  length?: Length;
  emoji?: EmojiUse;
  relationship?: string;
  userName?: string;
  always: string[];
  never: string[];
  when: Situation[];
}

export const LIMITS = { text: 240, about: 500, list: 8, when: 6 } as const;

export function emptyPersona(language = "en"): Persona {
  return { language, traits: {}, always: [], never: [], when: [] };
}

export type Validation = { ok: true; persona: Persona } | { ok: false; errors: string[] };

function text(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const clean = value.replace(/\s+/g, " ").trim().slice(0, max);
  return clean || undefined;
}

function list(value: unknown, field: string, errors: string[]): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) {
    errors.push(`${field} must be an array of strings`);
    return [];
  }
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") {
      errors.push(`${field} must contain only strings`);
      return [];
    }
    const clean = text(item, LIMITS.text);
    if (clean) out.push(clean);
  }
  return out.slice(0, LIMITS.list);
}

export function validatePersona(input: unknown): Validation {
  const errors: string[] = [];
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, errors: ["persona must be an object"] };
  }
  const raw = input as Record<string, unknown>;

  const language = typeof raw.language === "string" ? raw.language.trim().toLowerCase() : "";
  if (!/^[a-z]{2,3}$/.test(language)) errors.push("language must be a 2-3 letter ISO code such as fa or en");

  const traits: Persona["traits"] = {};
  if (raw.traits !== undefined && raw.traits !== null) {
    if (typeof raw.traits !== "object" || Array.isArray(raw.traits)) {
      errors.push("traits must be an object");
    } else {
      for (const key of TRAIT_KEYS) {
        const value = (raw.traits as Record<string, unknown>)[key];
        if (value === undefined || value === null || value === "") continue;
        const number = typeof value === "string" ? Number(value) : value;
        if (typeof number !== "number" || !Number.isFinite(number)) {
          errors.push(`traits.${key} must be a number from 0 to 100`);
          continue;
        }
        traits[key] = Math.round(Math.min(100, Math.max(0, number)));
      }
    }
  }

  let length: Length | undefined;
  if (raw.length !== undefined && raw.length !== null && raw.length !== "") {
    if (LENGTHS.includes(raw.length as Length)) length = raw.length as Length;
    else errors.push(`length must be one of ${LENGTHS.join(", ")}`);
  }

  let emoji: EmojiUse | undefined;
  if (raw.emoji !== undefined && raw.emoji !== null && raw.emoji !== "") {
    if (EMOJI_USES.includes(raw.emoji as EmojiUse)) emoji = raw.emoji as EmojiUse;
    else errors.push(`emoji must be one of ${EMOJI_USES.join(", ")}`);
  }

  const when: Situation[] = [];
  if (raw.when !== undefined && raw.when !== null) {
    if (!Array.isArray(raw.when)) {
      errors.push("when must be an array of { if, then } objects");
    } else {
      for (const item of raw.when) {
        const entry = item as Record<string, unknown> | null;
        const cond = text(entry?.if, LIMITS.text);
        const action = text(entry?.then, LIMITS.text);
        if (!cond || !action) {
          errors.push("each when entry needs non-empty if and then strings");
          break;
        }
        when.push({ if: cond, then: action });
      }
    }
  }

  const always = list(raw.always, "always", errors);
  const never = list(raw.never, "never", errors);

  if (errors.length > 0) return { ok: false, errors };

  const persona: Persona = {
    language,
    traits,
    always,
    never,
    when: when.slice(0, LIMITS.when),
  };
  const name = text(raw.name, 60);
  const role = text(raw.role, LIMITS.text);
  const about = text(raw.about, LIMITS.about);
  const relationship = text(raw.relationship, LIMITS.text);
  const userName = text(raw.userName, 60);
  if (name) persona.name = name;
  if (role) persona.role = role;
  if (about) persona.about = about;
  if (relationship) persona.relationship = relationship;
  if (userName) persona.userName = userName;
  if (length) persona.length = length;
  if (emoji) persona.emoji = emoji;
  return { ok: true, persona };
}

export function isBlank(persona: Persona): boolean {
  return (
    !persona.name &&
    !persona.role &&
    !persona.about &&
    !persona.relationship &&
    !persona.length &&
    !persona.emoji &&
    Object.keys(persona.traits).length === 0 &&
    persona.always.length === 0 &&
    persona.never.length === 0 &&
    persona.when.length === 0
  );
}
