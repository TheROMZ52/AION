"use client";

import { useEffect, useMemo, useState } from "react";
import { AION_VERSION } from "@/lib/aion/version";

const STORAGE_KEYS = {
  description: "aion-studio-description",
  output: "aion-studio-output",
  language: "aion-studio-language",
  advanced: "aion-studio-advanced",
  advancedConfig: "aion-studio-advanced-config",
};

const example = `⟪AION::1⟫

ᚫ AI
  ↳ ID: FRIEND_AI
  ↳ ROLE: FRIEND

  ◉ MIND {
      warmth   :: 92
      humor    :: 78
      empathy  :: 90
      energy   :: 86
      formal   :: 18
  }

  ◉ VOICE {
      lang     :: FA
      mode     :: CASUAL
      emoji    :: SMART
      response :: NATURAL
  }

  ◉ REACT {
      USER[SAD] → HUMOR[-40] → EMPATHY[+30]
  }

⟫`;

const quickPrompts = {
  en: [
    ["Friendly", "A warm, funny and curious AI that talks like a close friend, but knows when to be serious."],
    ["Professional", "A clear, calm and professional AI that is concise, helpful and respectful."],
    ["Adaptive", "A natural AI that adapts its tone to my mood, stays empathetic, and becomes serious when needed."],
  ],
  fa: [
    ["دوستانه", "یک هوش مصنوعی گرم، شوخ‌طبع و کنجکاو که مثل یک دوست صمیمی حرف بزند، ولی بداند چه وقت جدی باشد."],
    ["حرفه‌ای", "یک هوش مصنوعی واضح، آرام و حرفه‌ای که پاسخ‌های دقیق، مفید و محترمانه بدهد."],
    ["سازگار", "یک هوش مصنوعی طبیعی که لحنش را با حال من سازگار کند، همدل باشد و وقتی لازم است جدی رفتار کند."],
  ],
} as const;

type AdvancedConfig = {
  goal: string;
  role: string;
  relationship: string;
  language: string;
  tone: string;
  responseLength: string;
  emoji: string;
  warmth: number;
  humor: number;
  empathy: number;
  curiosity: number;
  energy: number;
  constraints: string;
};

const defaultAdvanced: AdvancedConfig = {
  goal: "",
  role: "",
  relationship: "",
  language: "",
  tone: "",
  responseLength: "",
  emoji: "",
  warmth: 70,
  humor: 60,
  empathy: 70,
  curiosity: 60,
  energy: 60,
  constraints: "",
};

function AionMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 40 40" role="img">
        <defs>
          <linearGradient id="aion-mark-gradient" x1="8" y1="5" x2="33" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#d8b8ff" />
            <stop offset="0.48" stopColor="#a56cff" />
            <stop offset="1" stopColor="#6d35e9" />
          </linearGradient>
        </defs>
        <path d="M20 5.5c-7.2 0-12.7 4.5-12.7 11.1 0 5.4 3.3 8.8 8 9.9-1.6 1.8-2.7 4.2-2.7 7.3 0 1 .6 1.7 1.6 1.7 3.2 0 6.1-2.1 7.8-5.1 1.2-2 2-4.5 2-7.4v-1.5h3.3v5.1c0 2.2 1.2 3.4 3.1 3.4 2 0 3.3-1.3 3.3-3.5V17.1C33.7 10.2 28.2 5.5 20 5.5Zm6.3 12.9h-6.2c-2.8 0-4.8-1.1-4.8-3.3 0-2.6 2.2-4.3 5.1-4.3 3.8 0 5.9 2.3 5.9 6.1v1.5Z" fill="url(#aion-mark-gradient)" />
        <circle cx="29.8" cy="8.2" r="2.1" fill="#e5d4ff" />
      </svg>
    </span>
  );
}

export default function Home() {
  const [description, setDescription] = useState("");
  const [output, setOutput] = useState(example);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState<"en" | "fa">("en");
  const [hydrated, setHydrated] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advanced, setAdvanced] = useState<AdvancedConfig>(defaultAdvanced);

  useEffect(() => {
    try {
      const savedDescription = localStorage.getItem(STORAGE_KEYS.description);
      const savedOutput = localStorage.getItem(STORAGE_KEYS.output);
      const savedLanguage = localStorage.getItem(STORAGE_KEYS.language);
      const savedAdvanced = localStorage.getItem(STORAGE_KEYS.advanced);
      const savedConfig = localStorage.getItem(STORAGE_KEYS.advancedConfig);
      if (savedDescription !== null) setDescription(savedDescription);
      if (savedOutput !== null) setOutput(savedOutput);
      if (savedLanguage === "fa" || savedLanguage === "en") setLanguage(savedLanguage);
      if (savedAdvanced === "true") setAdvancedOpen(true);
      if (savedConfig) setAdvanced({ ...defaultAdvanced, ...JSON.parse(savedConfig) });
    } catch {
      // Ignore malformed local Studio state and keep safe defaults.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.description, description);
    localStorage.setItem(STORAGE_KEYS.output, output);
    localStorage.setItem(STORAGE_KEYS.language, language);
    localStorage.setItem(STORAGE_KEYS.advanced, String(advancedOpen));
    localStorage.setItem(STORAGE_KEYS.advancedConfig, JSON.stringify(advanced));
  }, [description, output, language, advancedOpen, advanced, hydrated]);

  const hasInput = useMemo(() => description.trim().length > 0, [description]);
  const hasAdvancedInput = useMemo(() => {
    return Object.entries(advanced).some(([key, value]) => key === "constraints" || typeof value === "string" ? String(value).trim().length > 0 : value !== defaultAdvanced[key as keyof AdvancedConfig]);
  }, [advanced]);
  const isPersian = /[\u0600-\u06FF]/.test(description);
  const isRtl = isPersian || language === "fa";
  const remaining = Math.max(0, 4000 - description.length);

  const t = language === "fa" ? {
    studio: "استودیو", how: "چطور کار می‌کند", docs: "مستندات", hero: "به هوشت", hero2: "شخصیت بده.",
    intro: "با زبان خودت توضیح بده می‌خواهی هوشت چطور فکر کند، حرف بزند و رفتار کند. AION حرف‌هایت را به یک تعریف ساختاریافته از شخصیت تبدیل می‌کند.",
    build: "ساخت شخصیت", see: "AION چطور کار می‌کند", describe: "AI خودت را توصیف کن", hint: "با زبان طبیعی توضیح بده چه شخصیتی می‌خواهی.",
    natural: "زبان طبیعی", example: "یک نمونه امتحان کن ✦", generate: "ساخت AION", compiling: "در حال کامپایل…", valid: "✓ معتبر",
    your: "AION شما", structured: "تعریف ساختاریافته شخصیت.", idea: "ایده اصلی", in: "نیت انسان در.", out: "شخصیت AI بیرون.",
    describeStep: "توصیف", describeText: "با زبان ساده بنویس چه می‌خواهی. نیازی به یادگیری سینتکس نیست.",
    compile: "کامپایل", compileText: "AION نیت تو را به رفتار دقیق و ساختاریافته تبدیل می‌کند.", use: "همه‌جا استفاده کن", useText: "تعریف شخصیت را به مدل، اپ یا ایجنت خودت ببر.",
    tagline: "زبانی برای دادن شخصیت به هوش مصنوعی.", made: "ساخته‌شده توسط TheROMZ52", clear: "پاک کردن", chars: "حرف باقی‌مانده",
    copy: "کپی", copied: "کپی شد ✓", download: "دانلود .aion", shortcut: "Ctrl/⌘ + Enter",
    advanced: "حالت پیشرفته", advancedHint: "جزئیات بیشتری بده تا AION نیتت را دقیق‌تر مدل کند.", close: "بستن", reset: "بازنشانی", optional: "اختیاری",
    goal: "هدف", role: "نقش AI", relationship: "رابطه", lang: "زبان", tone: "لحن", length: "طول پاسخ", emoji: "ایموجی",
    personality: "شدت شخصیت", warmth: "گرمی", humor: "شوخ‌طبعی", empathy: "همدلی", curiosity: "کنجکاوی", energy: "انرژی", constraints: "محدودیت‌ها",
    goalPh: "مثلاً کمک آموزشی، همراهی، برنامه‌نویسی…", rolePh: "مثلاً دوست، معلم، مهندس…", relationshipPh: "مثلاً دوست صمیمی و محترمانه", constraintsPh: "چه چیزهایی را انجام ندهد؟",
    auto: "خودکار", casual: "خودمانی", naturalTone: "طبیعی", formal: "رسمی", professional: "حرفه‌ای", short: "کوتاه", medium: "متوسط", long: "مفصل", smart: "هوشمند", none: "خاموش", contextual: "متناسب با موضوع",
    advancedActive: "تنظیمات پیشرفته فعال است",
  } : {
    studio: "Studio", how: "How it works", docs: "Docs", hero: "Give your AI", hero2: "a personality.",
    intro: "Describe how you want your AI to think, speak and behave. AION turns your words into a structured personality definition.",
    build: "Build a personality", see: "See how AION works", describe: "Describe your AI", hint: "Tell AION what you have in mind.",
    natural: "Natural language", example: "Try an example ✦", generate: "Generate AION", compiling: "Compiling…", valid: "✓ VALID",
    your: "Your AION", structured: "Structured personality definition.", idea: "THE IDEA", in: "Human intent in.", out: "AI personality out.",
    describeStep: "Describe", describeText: "Write what you want in plain language. No syntax to learn.",
    compile: "Compile", compileText: "AION maps your intent into precise, structured behavior.", use: "Use anywhere", useText: "Take the personality definition to your model, app or agent.",
    tagline: "A language for giving AI a personality.", made: "Made by TheROMZ52", clear: "Clear", chars: "characters left",
    copy: "Copy", copied: "Copied ✓", download: "Download .aion", shortcut: "Ctrl/⌘ + Enter",
    advanced: "Advanced mode", advancedHint: "Add more structure so AION can model your intent more precisely.", close: "Close", reset: "Reset", optional: "Optional",
    goal: "Goal", role: "AI role", relationship: "Relationship", lang: "Language", tone: "Tone", length: "Response length", emoji: "Emoji",
    personality: "Personality intensity", warmth: "Warmth", humor: "Humor", empathy: "Empathy", curiosity: "Curiosity", energy: "Energy", constraints: "Constraints",
    goalPh: "e.g. tutoring, companionship, coding…", rolePh: "e.g. friend, teacher, engineer…", relationshipPh: "e.g. close but respectful friend", constraintsPh: "What should it avoid?",
    auto: "Auto", casual: "Casual", naturalTone: "Natural", formal: "Formal", professional: "Professional", short: "Short", medium: "Medium", long: "Detailed", smart: "Smart", none: "Off", contextual: "Contextual",
    advancedActive: "Advanced settings active",
  };

  function setAdvancedField<K extends keyof AdvancedConfig>(key: K, value: AdvancedConfig[K]) {
    setAdvanced((current) => ({ ...current, [key]: value }));
  }

  function buildCompilerInput() {
    if (!advancedOpen || !hasAdvancedInput) return description.trim();
    const lines = [description.trim(), "", "[ADVANCED CONTEXT]"];
    const add = (label: string, value: string | number) => {
      if (typeof value === "string" && !value.trim()) return;
      lines.push(`${label}: ${value}`);
    };
    add("Goal", advanced.goal);
    add("AI role", advanced.role);
    add("Relationship", advanced.relationship);
    add("Language", advanced.language);
    add("Tone", advanced.tone);
    add("Response length", advanced.responseLength);
    add("Emoji", advanced.emoji);
    if (advanced.warmth !== defaultAdvanced.warmth) add("Warmth", advanced.warmth);
    if (advanced.humor !== defaultAdvanced.humor) add("Humor", advanced.humor);
    if (advanced.empathy !== defaultAdvanced.empathy) add("Empathy", advanced.empathy);
    if (advanced.curiosity !== defaultAdvanced.curiosity) add("Curiosity", advanced.curiosity);
    if (advanced.energy !== defaultAdvanced.energy) add("Energy", advanced.energy);
    add("Constraints", advanced.constraints);
    return lines.join("\n");
  }

  async function generate() {
    if ((!hasInput && !hasAdvancedInput) || loading) return;
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: buildCompilerInput() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed.");
      setOutput(data.aion);
      document.getElementById("output")?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally { setLoading(false); }
  }

  function clearStudio() {
    setDescription(""); setOutput(example); setError(""); setAdvanced(defaultAdvanced); setAdvancedOpen(false);
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  function downloadOutput() {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "personality.aion"; a.click(); URL.revokeObjectURL(url);
  }

  const selectOptions = {
    language: [["AUTO", t.auto], ["FA", "فارسی"], ["EN", "English"]],
    tone: [["CASUAL", t.casual], ["NATURAL", t.naturalTone], ["FORMAL", t.formal], ["PROFESSIONAL", t.professional]],
    responseLength: [["SHORT", t.short], ["MEDIUM", t.medium], ["LONG", t.long]],
    emoji: [["SMART", t.smart], ["NONE", t.none], ["CONTEXTUAL", t.contextual]],
  } as const;

  return (
    <main className="shell" dir={language === "fa" ? "rtl" : "ltr"}>
      <nav className="nav">
        <div className="brand"><AionMark /><span>AION</span></div>
        <div className="nav-links"><a href="#studio">{t.studio}</a><a href="#how">{t.how}</a><a href="#docs">{t.docs}</a></div>
        <div className="nav-actions"><button className="lang" onClick={() => setLanguage(language === "en" ? "fa" : "en")}>{language === "en" ? "FA" : "EN"}</button><a className="ghost" href="https://github.com/TheROMZ52/AION" target="_blank" rel="noreferrer">GitHub ↗</a></div>
      </nav>

      <section className="hero">
        <div className="eyebrow"><span /> AI PERSONALITY LANGUAGE</div>
        <h1>{t.hero}<br /><em>{t.hero2}</em></h1>
        <p>{t.intro}</p>
        <div className="hero-actions"><a className="primary" href="#studio">{t.build} <span>→</span></a><a className="secondary" href="#how">{t.see}</a></div>
      </section>

      <section className="studio" id="studio">
        <div className="section-label"><span>01</span> AION STUDIO</div>
        <div className="workspace">
          <div className="panel input-panel">
            <div className="panel-head"><div><strong>{t.describe}</strong><small>{t.hint}</small></div><span className="status-dot">●</span></div>
            <div className="prompt-toolbar">
              <div className="prompt-chips">
                {quickPrompts[language].map(([label, prompt]) => <button key={label} type="button" className="prompt-chip" onClick={() => setDescription(prompt)}>{label}</button>)}
              </div>
              <button type="button" className="clear-input" onClick={clearStudio} disabled={!description && output === example && !hasAdvancedInput}>{t.clear}</button>
            </div>
            <textarea dir={isRtl ? "rtl" : "ltr"} lang={isRtl ? "fa" : "en"} maxLength={4000} value={description} onChange={(e) => setDescription(e.target.value)} onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") generate(); }} placeholder={language === "fa" ? "«مثلاً می‌خوام یک هوش مصنوعی داشته باشم که مثل یک دوست صمیمی حرف بزنه؛ شوخ‌طبع و کنجکاو باشه، ولی وقتی موضوع جدی شد، بدونه چطور رفتار کنه…»" : '“I want an AI that feels like a close friend.\nIt should be funny, curious and casual,\nbut know when to be serious...”'} />
            <div className="input-foot"><span>{t.natural}</span><span className="input-meta"><span>{remaining} {t.chars}</span><button type="button" onClick={() => setDescription(quickPrompts[language][0][1])}>{t.example}</button><kbd>{t.shortcut}</kbd></span></div>

            <div className={`advanced-box ${advancedOpen ? "is-open" : ""}`}>
              <button type="button" className="advanced-toggle" aria-expanded={advancedOpen} aria-controls="advanced-fields" onClick={() => setAdvancedOpen((open) => !open)}>
                <span><b>✦</b>{t.advanced}<small>{advancedOpen ? t.close : t.advancedHint}</small></span><i aria-hidden="true">{advancedOpen ? "−" : "+"}</i>
              </button>
              {advancedOpen && <div id="advanced-fields" className="advanced-fields">
                <div className="advanced-grid">
                  <label><span>{t.goal} <small>{t.optional}</small></span><input value={advanced.goal} onChange={(e) => setAdvancedField("goal", e.target.value)} placeholder={t.goalPh} /></label>
                  <label><span>{t.role} <small>{t.optional}</small></span><input value={advanced.role} onChange={(e) => setAdvancedField("role", e.target.value)} placeholder={t.rolePh} /></label>
                  <label><span>{t.relationship} <small>{t.optional}</small></span><input value={advanced.relationship} onChange={(e) => setAdvancedField("relationship", e.target.value)} placeholder={t.relationshipPh} /></label>
                  <label><span>{t.lang}</span><select value={advanced.language} onChange={(e) => setAdvancedField("language", e.target.value)}><option value="">{t.auto}</option>{selectOptions.language.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                  <label><span>{t.tone}</span><select value={advanced.tone} onChange={(e) => setAdvancedField("tone", e.target.value)}><option value="">{t.auto}</option>{selectOptions.tone.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                  <label><span>{t.length}</span><select value={advanced.responseLength} onChange={(e) => setAdvancedField("responseLength", e.target.value)}><option value="">{t.auto}</option>{selectOptions.responseLength.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                  <label><span>{t.emoji}</span><select value={advanced.emoji} onChange={(e) => setAdvancedField("emoji", e.target.value)}><option value="">{t.auto}</option>{selectOptions.emoji.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                </div>
                <div className="advanced-personality"><div className="advanced-subhead"><strong>{t.personality}</strong><button type="button" onClick={() => setAdvanced((current) => ({ ...current, warmth: 70, humor: 60, empathy: 70, curiosity: 60, energy: 60 }))}>{t.reset}</button></div>
                  {([["warmth", t.warmth], ["humor", t.humor], ["empathy", t.empathy], ["curiosity", t.curiosity], ["energy", t.energy]] as const).map(([key, label]) => <label className="range-row" key={key}><span>{label}</span><input type="range" min="0" max="100" value={advanced[key]} onChange={(e) => setAdvancedField(key, Number(e.target.value))} /><output>{advanced[key]}</output></label>)}
                </div>
                <label className="advanced-constraints"><span>{t.constraints} <small>{t.optional}</small></span><textarea value={advanced.constraints} onChange={(e) => setAdvancedField("constraints", e.target.value)} placeholder={t.constraintsPh} /></label>
              </div>}
            </div>

            <button className="generate" disabled={(!hasInput && !hasAdvancedInput) || loading} onClick={generate}>{loading ? t.compiling : t.generate} <span>⌘ ↵</span></button>
            {advancedOpen && hasAdvancedInput && <p className="advanced-active">✦ {t.advancedActive}</p>}
            {error && <p className="error">{error}</p>}
          </div>
          <div className="arrow">→</div>
          <div className="panel output-panel" id="output">
            <div className="panel-head"><div><strong>{t.your}</strong><small>{t.structured}</small></div><span className="valid">{t.valid}</span></div>
            <pre><code>{output}</code></pre>
            <div className="output-foot"><button onClick={copyOutput}>{copied ? t.copied : t.copy}</button><button onClick={downloadOutput}>{t.download}</button></div>
          </div>
        </div>
      </section>

      <section className="how" id="how">
        <div className="section-label"><span>02</span> {t.idea}</div>
        <h2>{t.in}<br /><em>{t.out}</em></h2>
        <div className="steps">
          <article><b>01</b><h3>{t.describeStep}</h3><p>{t.describeText}</p></article>
          <article><b>02</b><h3>{t.compile}</h3><p>{t.compileText}</p></article>
          <article><b>03</b><h3>{t.use}</h3><p>{t.useText}</p></article>
        </div>
      </section>

      <section className="docs-anchor" id="docs" aria-label="Documentation"><span>AION {AION_VERSION}</span><strong>{t.tagline}</strong></section>
      <footer><span>{t.tagline}</span><span>{t.made}</span></footer>
    </main>
  );
}
