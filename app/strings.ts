import type { TraitKey } from "@/lib/aion/schema";

export type Locale = "fa" | "en";

export interface Strings {
  tagline: string;
  placeholder: string;
  build: string;
  building: string;
  clear: string;
  promptTab: string;
  cardTab: string;
  copy: string;
  copied: string;
  characters: string;
  empty: string;
  intent: string;
  result: string;
  fields: Record<"name" | "role" | "about" | "language" | "length" | "emoji" | "relationship" | "userName" | "always" | "never" | "when" | "traits", string>;
  lengths: Record<"short" | "balanced" | "detailed", string>;
  emojis: Record<"none" | "rare" | "often", string>;
  unset: string;
  traits: Record<TraitKey, string>;
  whenHint: string;
  lineHint: string;
  errors: Record<string, string>;
  presets: Record<"friend" | "teacher" | "coach", string>;
}

export const STRINGS: Record<Locale, Strings> = {
  fa: {
    tagline: "شخصیت بده به هوش مصنوعی",
    placeholder: "مثلاً: یه رفیق صمیمی که شوخ‌طبعه، خودمونی حرف می‌زنه، وقتی ناراحتم شوخی نمی‌کنه و هیچ‌وقت کدم رو بدون اجازه تغییر نمی‌ده.",
    build: "ساخت شخصیت",
    building: "در حال ساخت…",
    clear: "پاک کردن",
    promptTab: "پرامپت",
    cardTab: "کارت",
    copy: "کپی",
    copied: "کپی شد",
    characters: "نویسه",
    empty: "هنوز چیزی ساخته نشده",
    intent: "توصیف",
    result: "خروجی",
    fields: {
      name: "نام",
      role: "نقش",
      about: "درباره",
      language: "زبان پاسخ",
      length: "طول پاسخ",
      emoji: "ایموجی",
      relationship: "رابطه با کاربر",
      userName: "اسم کاربر",
      always: "همیشه",
      never: "هیچ‌وقت",
      when: "موقعیت‌ها",
      traits: "ویژگی‌ها",
    },
    lengths: { short: "کوتاه", balanced: "متعادل", detailed: "مفصل" },
    emojis: { none: "بدون ایموجی", rare: "کم", often: "زیاد" },
    unset: "تعیین نشده",
    traits: {
      warmth: "گرمی",
      humor: "شوخ‌طبعی",
      empathy: "همدلی",
      formality: "رسمی بودن",
      directness: "رکی",
      energy: "انرژی",
      curiosity: "کنجکاوی",
      patience: "صبوری",
    },
    whenHint: "هر خط: شرط => رفتار",
    lineHint: "هر خط یک مورد",
    errors: {
      missing_description: "اول توصیفی بنویس.",
      too_long: "توصیف خیلی طولانیه.",
      missing_key: "کلید مدل روی سرور تنظیم نشده.",
      rate_limited: "درخواست‌ها زیاده، یه دقیقه دیگه امتحان کن.",
      upstream: "سرویس مدل جواب نداد، دوباره امتحان کن.",
      invalid_output: "مدل خروجی درستی نداد، توصیف رو کمی دقیق‌تر کن.",
      network: "اتصال برقرار نشد.",
    },
    presets: { friend: "رفیق صمیمی", teacher: "معلم صبور", coach: "مربی رک" },
  },
  en: {
    tagline: "Give any AI a personality",
    placeholder: "e.g. A close friend who is funny, talks casually, never jokes when I'm upset and never touches my code without asking.",
    build: "Build persona",
    building: "Building…",
    clear: "Clear",
    promptTab: "Prompt",
    cardTab: "Card",
    copy: "Copy",
    copied: "Copied",
    characters: "chars",
    empty: "Nothing built yet",
    intent: "Description",
    result: "Output",
    fields: {
      name: "Name",
      role: "Role",
      about: "About",
      language: "Reply language",
      length: "Reply length",
      emoji: "Emoji",
      relationship: "Relationship",
      userName: "User's name",
      always: "Always",
      never: "Never",
      when: "Situations",
      traits: "Traits",
    },
    lengths: { short: "Short", balanced: "Balanced", detailed: "Detailed" },
    emojis: { none: "None", rare: "Rare", often: "Often" },
    unset: "Not set",
    traits: {
      warmth: "Warmth",
      humor: "Humor",
      empathy: "Empathy",
      formality: "Formality",
      directness: "Directness",
      energy: "Energy",
      curiosity: "Curiosity",
      patience: "Patience",
    },
    whenHint: "One per line: condition => behavior",
    lineHint: "One per line",
    errors: {
      missing_description: "Write a description first.",
      too_long: "The description is too long.",
      missing_key: "The server has no model key configured.",
      rate_limited: "Too many requests, try again in a minute.",
      upstream: "The model service did not respond, try again.",
      invalid_output: "The model returned something unusable, try a more specific description.",
      network: "Could not connect.",
    },
    presets: { friend: "Close friend", teacher: "Patient teacher", coach: "Blunt coach" },
  },
};
