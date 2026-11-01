"use client";

import { useEffect, useMemo, useState } from "react";
import { EMOJI_USES, LENGTHS, TRAIT_KEYS, emptyPersona, isBlank, validatePersona, type Persona, type TraitKey } from "@/lib/aion/schema";
import { renderPrompt } from "@/lib/aion/render";
import { PRESET_IDS, preset } from "./presets";
import { STRINGS, type Locale } from "./strings";

const LANGUAGES = ["fa", "en", "ar", "tr", "de", "fr", "es", "ru"];
const STORE = "aion:v2";

function toLines(items: string[]): string {
  return items.join("\n");
}

function fromLines(value: string): string[] {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

function whenToLines(persona: Persona): string {
  return persona.when.map((entry) => `${entry.if} => ${entry.then}`).join("\n");
}

function whenFromLines(value: string) {
  return fromLines(value).flatMap((line) => {
    const index = line.indexOf("=>");
    if (index === -1) return [];
    const cond = line.slice(0, index).trim();
    const action = line.slice(index + 2).trim();
    return cond && action ? [{ if: cond, then: action }] : [];
  });
}

function Mark() {
  return (
    <svg viewBox="0 0 40 40" role="img" aria-label="AION">
      <defs>
        <linearGradient id="aion-mark" x1="8" y1="5" x2="33" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#d8b8ff" />
          <stop offset="0.48" stopColor="#a56cff" />
          <stop offset="1" stopColor="#6d35e9" />
        </linearGradient>
      </defs>
      <path
        d="M20 5.5c-7.2 0-12.7 4.5-12.7 11.1 0 5.4 3.3 8.8 8 9.9-1.6 1.8-2.7 4.2-2.7 7.3 0 1 .6 1.7 1.6 1.7 3.2 0 6.1-2.1 7.8-5.1 1.2-2 2-4.5 2-7.4v-1.5h3.3v5.1c0 2.2 1.2 3.4 3.1 3.4 2 0 3.3-1.3 3.3-3.5V17.1C33.7 10.2 28.2 5.5 20 5.5Zm6.3 12.9h-6.2c-2.8 0-4.8-1.1-4.8-3.3 0-2.6 2.2-4.3 5.1-4.3 3.8 0 5.9 2.3 5.9 6.1v1.5Z"
        fill="url(#aion-mark)"
      />
    </svg>
  );
}

export default function Studio() {
  const [locale, setLocale] = useState<Locale>("fa");
  const [description, setDescription] = useState("");
  const [persona, setPersona] = useState<Persona>(() => emptyPersona("fa"));
  const [tab, setTab] = useState<"prompt" | "card">("prompt");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);

  const t = STRINGS[locale];

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) ?? "null");
      if (saved) {
        if (saved.locale === "fa" || saved.locale === "en") setLocale(saved.locale);
        if (typeof saved.description === "string") setDescription(saved.description);
        const checked = validatePersona(saved.persona);
        if (checked.ok) setPersona(checked.persona);
      }
    } catch {
      localStorage.removeItem(STORE);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
  }, [locale]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORE, JSON.stringify({ locale, description, persona }));
    } catch {}
  }, [ready, locale, description, persona]);

  const prompt = useMemo(() => (isBlank(persona) ? "" : renderPrompt(persona)), [persona]);
  const card = useMemo(() => JSON.stringify(persona, null, 2), [persona]);
  const output = tab === "prompt" ? prompt : card;

  const patch = (changes: Partial<Persona>) => setPersona((current) => ({ ...current, ...changes }));

  const setTrait = (key: TraitKey, value: number | undefined) =>
    setPersona((current) => {
      const traits = { ...current.traits };
      if (value === undefined) delete traits[key];
      else traits[key] = value;
      return { ...current, traits };
    });

  const optional = (key: "name" | "role" | "about" | "relationship" | "userName", value: string) =>
    setPersona((current) => {
      const next = { ...current };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });

  async function build() {
    if (busy) return;
    setError("");
    if (!description.trim()) {
      setError(t.errors.missing_description);
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(t.errors[String(data?.error?.code)] ?? t.errors.upstream);
        return;
      }
      const checked = validatePersona(data.persona);
      if (checked.ok) {
        setPersona(checked.persona);
        setTab("prompt");
      }
    } catch {
      setError(t.errors.network);
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  }

  return (
    <main className="shell">
      <header className="nav">
        <div className="brand">
          <span className="brand-mark"><Mark /></span>
          <span>AION</span>
        </div>
        <button className="lang" onClick={() => setLocale(locale === "fa" ? "en" : "fa")} aria-label="Language">
          {locale === "fa" ? "EN" : "فا"}
        </button>
      </header>

      <section className="hero">
        <h1>{t.tagline}</h1>
      </section>

      <section className="workspace">
        <div className="panel">
          <div className="panel-head">
            <strong>{t.intent}</strong>
          </div>
          <div className="chips">
            {PRESET_IDS.map((id) => (
              <button key={id} className="chip" onClick={() => setPersona(preset(id, locale))}>
                {t.presets[id]}
              </button>
            ))}
          </div>
          <textarea
            dir="auto"
            value={description}
            placeholder={t.placeholder}
            onChange={(event) => setDescription(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) build();
            }}
          />
          <div className="panel-foot">
            <span className="error" role="alert">{error}</span>
            <div className="actions">
              <button className="ghost" disabled={!description} onClick={() => { setDescription(""); setError(""); }}>
                {t.clear}
              </button>
              <button className="primary" disabled={busy} onClick={build}>
                {busy ? t.building : t.build}
              </button>
            </div>
          </div>

          <div className="editor">
            <div className="grid2">
              <label>
                <span>{t.fields.name}</span>
                <input dir="auto" value={persona.name ?? ""} onChange={(event) => optional("name", event.target.value)} />
              </label>
              <label>
                <span>{t.fields.role}</span>
                <input dir="auto" value={persona.role ?? ""} onChange={(event) => optional("role", event.target.value)} />
              </label>
              <label>
                <span>{t.fields.language}</span>
                <select value={persona.language} onChange={(event) => patch({ language: event.target.value })}>
                  {LANGUAGES.map((code) => (
                    <option key={code} value={code}>{code.toUpperCase()}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>{t.fields.userName}</span>
                <input dir="auto" value={persona.userName ?? ""} onChange={(event) => optional("userName", event.target.value)} />
              </label>
              <label>
                <span>{t.fields.length}</span>
                <select value={persona.length ?? ""} onChange={(event) => patch({ length: (event.target.value || undefined) as Persona["length"] })}>
                  <option value="">{t.unset}</option>
                  {LENGTHS.map((value) => (
                    <option key={value} value={value}>{t.lengths[value]}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>{t.fields.emoji}</span>
                <select value={persona.emoji ?? ""} onChange={(event) => patch({ emoji: (event.target.value || undefined) as Persona["emoji"] })}>
                  <option value="">{t.unset}</option>
                  {EMOJI_USES.map((value) => (
                    <option key={value} value={value}>{t.emojis[value]}</option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              <span>{t.fields.about}</span>
              <textarea className="small" dir="auto" rows={2} value={persona.about ?? ""} onChange={(event) => optional("about", event.target.value)} />
            </label>
            <label>
              <span>{t.fields.relationship}</span>
              <input dir="auto" value={persona.relationship ?? ""} onChange={(event) => optional("relationship", event.target.value)} />
            </label>

            <fieldset>
              <legend>{t.fields.traits}</legend>
              {TRAIT_KEYS.map((key) => {
                const value = persona.traits[key];
                return (
                  <div key={key} className={`trait${value === undefined ? " off" : ""}`}>
                    <span>{t.traits[key]}</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={value ?? 50}
                      aria-label={t.traits[key]}
                      onChange={(event) => setTrait(key, Number(event.target.value))}
                    />
                    <button className="reset" onClick={() => setTrait(key, undefined)} disabled={value === undefined} aria-label={`${t.traits[key]} ✕`}>
                      {value === undefined ? "–" : value}
                    </button>
                  </div>
                );
              })}
            </fieldset>

            <label>
              <span>{t.fields.always} <em>{t.lineHint}</em></span>
              <textarea className="small" dir="auto" rows={3} value={toLines(persona.always)} onChange={(event) => patch({ always: fromLines(event.target.value) })} />
            </label>
            <label>
              <span>{t.fields.never} <em>{t.lineHint}</em></span>
              <textarea className="small" dir="auto" rows={3} value={toLines(persona.never)} onChange={(event) => patch({ never: fromLines(event.target.value) })} />
            </label>
            <label>
              <span>{t.fields.when} <em>{t.whenHint}</em></span>
              <textarea className="small" dir="auto" rows={3} value={whenToLines(persona)} onChange={(event) => patch({ when: whenFromLines(event.target.value) })} />
            </label>
          </div>
        </div>

        <div className="bridge" aria-hidden="true">{locale === "fa" ? "←" : "→"}</div>

        <div className="panel sticky">
          <div className="panel-head">
            <div className="tabs" role="tablist">
              <button role="tab" aria-selected={tab === "prompt"} onClick={() => setTab("prompt")}>{t.promptTab}</button>
              <button role="tab" aria-selected={tab === "card"} onClick={() => setTab("card")}>{t.cardTab}</button>
            </div>
            <button className="ghost" disabled={!output} onClick={copy}>{copied ? t.copied : t.copy}</button>
          </div>
          {output ? (
            <pre dir="auto" className="output">{output}</pre>
          ) : (
            <div className="placeholder">{t.empty}</div>
          )}
          <div className="panel-foot">
            <span className="count">{output ? `${output.length} ${t.characters}` : ""}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
