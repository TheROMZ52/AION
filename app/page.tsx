"use client";

import { useEffect, useMemo, useState } from "react";
import { AION_VERSION } from "@/lib/aion/version";

const STORAGE_KEYS = {
  description: "aion-studio-description",
  output: "aion-studio-output",
  language: "aion-studio-language",
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

  // Restore Studio state only on the client, avoiding a hydration mismatch.
  useEffect(() => {
    try {
      const savedDescription = localStorage.getItem(STORAGE_KEYS.description);
      const savedOutput = localStorage.getItem(STORAGE_KEYS.output);
      const savedLanguage = localStorage.getItem(STORAGE_KEYS.language);
      if (savedDescription !== null) setDescription(savedDescription);
      if (savedOutput !== null) setOutput(savedOutput);
      if (savedLanguage === "fa" || savedLanguage === "en") setLanguage(savedLanguage);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist the user's work so refreshes do not wipe the Studio.
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.description, description);
    localStorage.setItem(STORAGE_KEYS.output, output);
    localStorage.setItem(STORAGE_KEYS.language, language);
  }, [description, output, language, hydrated]);

  const hasInput = useMemo(() => description.trim().length > 0, [description]);
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
    copy: "کپی", copied: "کپی شد ✓", download: "دانلود .aion", shortcut: "Ctrl/⌘ + Enter"
  } : {
    studio: "Studio", how: "How it works", docs: "Docs", hero: "Give your AI", hero2: "a personality.",
    intro: "Describe how you want your AI to think, speak and behave. AION turns your words into a structured personality definition.",
    build: "Build a personality", see: "See how AION works", describe: "Describe your AI", hint: "Tell AION what you have in mind.",
    natural: "Natural language", example: "Try an example ✦", generate: "Generate AION", compiling: "Compiling…", valid: "✓ VALID",
    your: "Your AION", structured: "Structured personality definition.", idea: "THE IDEA", in: "Human intent in.", out: "AI personality out.",
    describeStep: "Describe", describeText: "Write what you want in plain language. No syntax to learn.",
    compile: "Compile", compileText: "AION maps your intent into precise, structured behavior.", use: "Use anywhere", useText: "Take the personality definition to your model, app or agent.",
    tagline: "A language for giving AI a personality.", made: "Made by TheROMZ52", clear: "Clear", chars: "characters left",
    copy: "Copy", copied: "Copied ✓", download: "Download .aion", shortcut: "Ctrl/⌘ + Enter"
  };

  async function generate() {
    if (!hasInput || loading) return;
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description: description.trim() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed.");
      setOutput(data.aion);
      document.getElementById("output")?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) { setError(err instanceof Error ? err.message : "Generation failed."); }
    finally { setLoading(false); }
  }

  function clearStudio() {
    setDescription("");
    setOutput(example);
    setError("");
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadOutput() {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "personality.aion";
    a.click();
    URL.revokeObjectURL(url);
  }

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
                {quickPrompts[language].map(([label, prompt]) => (
                  <button key={label} type="button" className="prompt-chip" onClick={() => setDescription(prompt)}>{label}</button>
                ))}
              </div>
              <button type="button" className="clear-input" onClick={clearStudio} disabled={!description && output === example}>{t.clear}</button>
            </div>
            <textarea dir={isRtl ? "rtl" : "ltr"} lang={isRtl ? "fa" : "en"} maxLength={4000} value={description} onChange={(e) => setDescription(e.target.value)} onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") generate(); }} placeholder={language === "fa" ? "«مثلاً می‌خوام یک هوش مصنوعی داشته باشم که مثل یک دوست صمیمی حرف بزنه؛ شوخ‌طبع و کنجکاو باشه، ولی وقتی موضوع جدی شد، بدونه چطور رفتار کنه…»" : '“I want an AI that feels like a close friend.\nIt should be funny, curious and casual,\nbut know when to be serious...”'} />
            <div className="input-foot"><span>{t.natural}</span><span className="input-meta"><span>{remaining} {t.chars}</span><button type="button" onClick={() => setDescription(quickPrompts[language][0][1])}>{t.example}</button><kbd>{t.shortcut}</kbd></span></div>
            <button className="generate" disabled={!hasInput || loading} onClick={generate}>{loading ? t.compiling : t.generate} <span>⌘ ↵</span></button>
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
        <div className="steps"><article><b>01</b><h3>{t.describeStep}</h3><p>{t.describeText}</p></article><article><b>02</b><h3>{t.compile}</h3><p>{t.compileText}</p></article><article><b>03</b><h3>{t.use}</h3><p>{t.useText}</p></article></div>
      </section>

      <footer><div className="brand"><AionMark /><span>AION</span></div><span>{t.tagline}</span><span>v{AION_VERSION} · © 2026 · {t.made}</span></footer>
    </main>
  );
}
