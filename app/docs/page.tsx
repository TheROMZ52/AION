import { useMemo } from "react";
import Link from "next/link";
import styles from "./docs.module.css";

const SPEC_URL = "https://github.com/TheROMZ52/AION/blob/main/docs/AION-LANGUAGE-SPEC-v0.1.md";

const layers = [
  ["MIND", "AI", "baseline", "Stable personality dimensions."],
  ["VOICE", "AI", "baseline", "Stable communication settings."],
  ["BOND", "AI / User", "baseline", "The relationship model between AI and user."],
  ["PREF", "User", "persistent", "User-owned preferences."],
  ["MEMORY", "User state", "persistent / session", "Persistence and state operations."],
  ["PERSONA", "AI", "durable", "Explicit durable behavior and persona directives."],
  ["PRIME", "AI", "durable", "Highest-priority durable principles."],
  ["REACT", "Context", "temporary", "Context-dependent behavioral overrides."],
] as const;

const code = `⟪AION::1⟫

ᚫ AI
  ↳ SPEC: https://aion-six-kohl.vercel.app/docs
  ↳ ROLE: COMPANION

MIND
  ↳ humor :: 70

REACT
  ↳ USER [ UPSET ] → NO_HUMOR, EMPATHY [ +20 ]`;

export default function DocsPage() {
  const navigation = useMemo(() => layers.map(([name]) => name), []);

  return (
    <main className={styles.page}>
      <header className={styles.nav}>
        <Link href="/" className={styles.brand} aria-label="AION home">
          <span className={styles.logo}>a</span>
          <span>AION</span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/" className={styles.back}>← Studio</Link>
          <a href={SPEC_URL} target="_blank" rel="noreferrer">Source spec ↗</a>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <span className={styles.sideLabel}>SPECIFICATION</span>
          <nav aria-label="Documentation sections">
            {navigation.map((name) => (
              <a key={name} href={`#${name.toLowerCase()}`}>{name}</a>
            ))}
          </nav>
        </aside>

        <article className={styles.content}>
          <section className={styles.hero}>
            <div className={styles.eyebrow}><span /> AION LANGUAGE · v0.1</div>
            <h1>Teach machines<br /><em>how to understand AI.</em></h1>
            <p className={styles.lead}>
              AION is a semantic notation for describing an AI's identity, behavior,
              user state, preferences, and context-aware reactions in a deterministic form.
            </p>
            <div className={styles.status}><span className={styles.dot} /> Draft / normative foundation</div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardKicker}>01 · CORE MODEL</div>
            <h2>AION is a semantic contract.</h2>
            <p>
              Natural language can be vague. AION turns explicit intent into structured
              semantics that a compiler can validate and a runtime or LLM consumer can interpret.
              The compiler must preserve intent rather than invent stronger behavior.
            </p>
            <div className={styles.callout}>
              <strong>Core rule</strong>
              <span>Contextual exceptions stay contextual. They must not silently become baseline personality.</span>
            </div>
          </section>

          <section className={styles.section} id="layers">
            <div className={styles.cardKicker}>02 · LANGUAGE LAYERS</div>
            <h2>The eight semantic layers.</h2>
            <div className={styles.layerGrid}>
              {layers.map(([name, owner, lifetime, meaning]) => (
                <div className={styles.layer} id={name.toLowerCase()} key={name}>
                  <div className={styles.layerTop}><code>{name}</code><span>{lifetime}</span></div>
                  <strong>{owner}</strong>
                  <p>{meaning}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardKicker}>03 · SOURCE FORMAT</div>
            <h2>Self-describing AION.</h2>
            <p>
              Generated source can expose the canonical specification through <code>SPEC</code> metadata.
              This lets a downstream consumer identify what the source is and where its semantics are defined.
            </p>
            <pre className={styles.code}><code>{code}</code></pre>
          </section>

          <section className={styles.card}>
            <div className={styles.cardKicker}>04 · BASELINE SEMANTICS</div>
            <h2>Defaults are not exceptions.</h2>
            <div className={styles.compare}>
              <pre><code>{`humor :: 70
USER [ UPSET ] → NO_HUMOR`}</code></pre>
              <div className={styles.arrow}>→</div>
              <p>The baseline remains <code>70</code>. <code>NO_HUMOR</code> only applies while the user is upset.</p>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardKicker}>05 · USER STATE</div>
            <h2>PREF and MEMORY belong to the user.</h2>
            <div className={styles.twoCol}>
              <div><code>PREF</code><p>Persistent preferences such as naming and response length. They shape interaction without redefining the AI's intrinsic personality.</p></div>
              <div><code>MEMORY</code><p>State operations such as <code>KEEP</code>, <code>SET</code>, and <code>FORGET</code>. Memory is storage, not a personality override.</p></div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardKicker}>06 · REACT</div>
            <h2>Context overlays the baseline.</h2>
            <pre className={styles.code}><code>{`SUBJECT [ SELECTOR ] → ACTION[, ACTION...]

USER [ UPSET ] → NO_HUMOR, EMPATHY [ +20 ]
TOPIC [ IMPORTANT ] → SERIOUS`}</code></pre>
            <p className={styles.note}>Every action in a matching rule is preserved and evaluated, in source order.</p>
          </section>

          <section className={styles.card}>
            <div className={styles.cardKicker}>07 · PRECEDENCE</div>
            <h2>Predictable by design.</h2>
            <div className={styles.precedence}>
              <span>BASELINE<small>MIND · VOICE · BOND</small></span>
              <b>↓</b>
              <span>USER STATE<small>PREF · MEMORY</small></span>
              <b>↓</b>
              <span>DURABLE<small>PERSONA · PRIME</small></span>
              <b>↓</b>
              <span>CONTEXT<small>REACT</small></span>
            </div>
            <p className={styles.note}>Within REACT, specific selectors beat <code>ANY</code>; multiple actions remain ordered.</p>
          </section>

          <section className={styles.card}>
            <div className={styles.cardKicker}>08 · COMPILER CONTRACT</div>
            <h2>What a conforming compiler must protect.</h2>
            <ul className={styles.checklist}>
              <li>Every explicit requirement is represented somewhere in AION.</li>
              <li>Conditional behavior remains conditional.</li>
              <li>User preferences remain user-owned.</li>
              <li>Memory intent remains persistent state intent.</li>
              <li>Contextual exceptions never become invented baseline traits.</li>
              <li>Multiple actions are preserved.</li>
              <li>Ambiguity is handled conservatively.</li>
              <li>Equivalent input produces deterministic canonical output.</li>
            </ul>
          </section>

          <section className={styles.footerCard}>
            <div>
              <span className={styles.sideLabel}>CANONICAL REFERENCE</span>
              <h2>AION Language Specification v0.1</h2>
              <p>The semantic source of truth for AION 1.</p>
            </div>
            <a href={SPEC_URL} target="_blank" rel="noreferrer" className={styles.sourceButton}>Read source spec ↗</a>
          </section>
        </article>
      </div>
    </main>
  );
}
