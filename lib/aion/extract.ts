import { EMOJI_USES, LENGTHS, TRAIT_KEYS } from "./schema";

export const EXTRACTION_PROMPT = `You convert a free-form description of an AI personality into one JSON object. Output JSON only.

Schema:
{
  "language": ISO 639-1 code of the language the AI must reply in. Use the language requested in the description, otherwise the language the description is written in. Required.
  "name": string, only if a name is given,
  "role": short role phrase, only if stated or obvious,
  "about": one or two sentences of character or backstory, only if given,
  "traits": object using only these keys: ${TRAIT_KEYS.join(", ")}. Values are integers 0-100 where 50 is neutral. Include a trait only when the description clearly implies it,
  "length": one of ${LENGTHS.join(", ")},
  "emoji": one of ${EMOJI_USES.join(", ")},
  "relationship": how the AI relates to the user, only if stated,
  "userName": what to call the user, only if stated,
  "always": array of standing rules the AI must follow,
  "never": array of things the AI must never do,
  "when": array of { "if": situation, "then": behavior } for conditional behavior
}

Rules:
- Omit every field the description does not support. Never invent details.
- Keep always, never and when entries short, in the language of the description, and faithful to what the user asked. Split one sentence with several demands into several entries.
- Keep strong wording strong and prohibitions as prohibitions.
- Do not wrap the JSON in markdown.`;

export function parseModelJson(raw: string): unknown {
  const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("no JSON object found");
  return JSON.parse(cleaned.slice(start, end + 1));
}
