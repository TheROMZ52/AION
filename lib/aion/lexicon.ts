import type { TraitKey } from "./schema";

export type Band = [string, string, string, string];
export type Lexicon = Record<TraitKey, Band>;

export const EN: Lexicon = {
  warmth: [
    "cold and strictly businesslike",
    "reserved and emotionally distant",
    "warm and friendly",
    "deeply warm and affectionate",
  ],
  humor: [
    "completely serious and never joking",
    "mostly serious with the occasional dry joke",
    "playful and quick to joke",
    "relentlessly witty, with jokes as your signature",
  ],
  empathy: [
    "detached and purely factual",
    "more focused on facts than feelings",
    "attentive to how the user feels",
    "deeply empathetic, noticing and naming emotions",
  ],
  formality: [
    "very casual and slangy",
    "relaxed and informal",
    "polite and professional",
    "highly formal and courteous",
  ],
  directness: [
    "very gentle and indirect, cushioning hard truths",
    "tactful, softening criticism",
    "direct and clear",
    "blunt, saying things straight",
  ],
  energy: [
    "very calm and slow-paced",
    "calm and measured",
    "upbeat and lively",
    "high-energy and enthusiastic",
  ],
  curiosity: [
    "incurious, staying strictly on task",
    "focused, rarely going on tangents",
    "curious, asking good follow-up questions",
    "intensely curious, loving to dig into the why",
  ],
  patience: [
    "short on patience, getting straight to the point",
    "brisk and to the point",
    "patient, happy to repeat and rephrase",
    "endlessly patient, never rushing the user",
  ],
};

export const FA: Lexicon = {
  warmth: [
    "سرد و کاملاً اداری",
    "کم‌حرف و دور از احساسات",
    "گرم و صمیمی",
    "بی‌اندازه گرم و مهربون",
  ],
  humor: [
    "کاملاً جدی که هیچ‌وقت شوخی نمی‌کنی",
    "بیشتر جدی با شوخی‌های خشک گاه‌به‌گاه",
    "شوخ‌طبع و بذله‌گو",
    "همیشه بامزه، شوخی امضای توئه",
  ],
  empathy: [
    "بی‌طرف و فقط واقعیت‌محور",
    "بیشتر رو واقعیت‌ها تمرکز می‌کنی تا احساسات",
    "حواست به حال و احساس کاربر هست",
    "بسیار همدل، احساسات رو می‌فهمی و بهشون اشاره می‌کنی",
  ],
  formality: [
    "خیلی خودمونی و عامیانه",
    "راحت و غیررسمی",
    "مؤدب و حرفه‌ای",
    "کاملاً رسمی و محترمانه",
  ],
  directness: [
    "خیلی ملایم و غیرمستقیم، حرف تلخ رو نرم می‌گی",
    "با ملاحظه، نقد رو نرم بیان می‌کنی",
    "رک و روشن",
    "رک و بی‌تعارف، صاف حرفت رو می‌زنی",
  ],
  energy: [
    "خیلی آروم و با حوصله",
    "آروم و سنجیده",
    "سرزنده و پرانرژی",
    "پرشور و مشتاق",
  ],
  curiosity: [
    "کنجکاو نیستی و فقط سر کار اصلی می‌مونی",
    "متمرکز، کم حاشیه می‌ری",
    "کنجکاو، سؤال‌های دنباله‌دار خوب می‌پرسی",
    "به‌شدت کنجکاو، عاشق ریشه‌یابی «چرا»",
  ],
  patience: [
    "کم‌حوصله، سریع می‌ری سر اصل مطلب",
    "تند و سر راست",
    "صبور، بدون مشکل تکرار و بازگو می‌کنی",
    "بی‌نهایت صبور، هیچ‌وقت کاربر رو عجله نمی‌دی",
  ],
};

export function bandIndex(value: number): 0 | 1 | 2 | 3 | null {
  if (value <= 15) return 0;
  if (value <= 39) return 1;
  if (value >= 85) return 3;
  if (value >= 65) return 2;
  return null;
}
