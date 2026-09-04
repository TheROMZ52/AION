"use client";

import { useMemo, useState } from "react";

const example = `@aion 1.0

entity AI {
    identity:
        type = "companion"
        role = "friend"

    personality:
        warmth = 0.92
        humor = 0.78
        empathy = 0.90
        energy = 0.86

    speech:
        style = casual
        emoji = contextual
        verbosity = adaptive

    rules:
        never.sound("robotic")
        always.read(context)
        prefer(natural_conversation)
}`;

export default function Home() {
  const [description, setDescription] = useState("");
  const [output, setOutput] = useState(example);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasInput = useMemo(() => description.trim().length > 0, [description]);

  async function generate() {
    if (!hasInput || loading) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed.");
      setOutput(data.aion);
      document.getElementById("output")?.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setLoading(false);
    }
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
    <main className="shell">
      <nav className="nav">
        <div className="brand"><span className="brand-mark">A</span><span>AION</span></div>
        <div className="nav-links"><a href="#studio">Studio</a><a href="#how">How it works</a><a href="#docs">Docs</a></div>
        <a className="ghost" href="https://github.com/TheROMZ52/AION" target="_blank" rel="noreferrer">GitHub ↗</a>
      </nav>

      <section className="hero">
        <div className="eyebrow"><span /> AI PERSONALITY LANGUAGE</div>
        <h1>Give your AI<br /><em>a personality.</em></h1>
        <p>Describe how you want your AI to think, speak and behave. AION turns your words into a structured personality definition.</p>
        <div className="hero-actions"><a className="primary" href="#studio">Build a personality <span>→</span></a><a className="secondary" href="#how">See how AION works</a></div>
      </section>

      <section className="studio" id="studio">
        <div className="section-label"><span>01</span> AION STUDIO</div>
        <div className="workspace">
          <div className="panel input-panel">
            <div className="panel-head"><div><strong>Describe your AI</strong><small>Tell AION what you have in mind.</small></div><span className="status-dot">●</span></div>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} onKeyDown={(e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") generate(); }} placeholder={'“I want an AI that feels like a close friend.\nIt should be funny, curious and casual,\nbut know when to be serious...”'} />
            <div className="input-foot"><span>Natural language</span><button onClick={() => setDescription("A warm, funny and curious AI that talks like a close friend, adapts to my mood, and becomes serious when the topic matters.")}>Try an example ✦</button></div>
            <button className="generate" disabled={!hasInput || loading} onClick={generate}>{loading ? "Compiling…" : "Generate AION"} <span>⌘ ↵</span></button>
            {error && <p className="error">{error}</p>}
          </div>

          <div className="arrow">→</div>

          <div className="panel output-panel" id="output">
            <div className="panel-head"><div><strong>Your AION</strong><small>Structured personality definition.</small></div><span className="valid">✓ VALID</span></div>
            <pre><code>{output}</code></pre>
            <div className="output-foot"><button onClick={copyOutput}>{copied ? "Copied ✓" : "Copy"}</button><button onClick={downloadOutput}>Download .aion</button></div>
          </div>
        </div>
      </section>

      <section className="how" id="how">
        <div className="section-label"><span>02</span> THE IDEA</div>
        <h2>Human intent in.<br /><em>AI personality out.</em></h2>
        <div className="steps">
          <article><b>01</b><h3>Describe</h3><p>Write what you want in plain language. No syntax to learn.</p></article>
          <article><b>02</b><h3>Compile</h3><p>AION maps your intent into precise, structured behavior.</p></article>
          <article><b>03</b><h3>Use anywhere</h3><p>Take the personality definition to your model, app or agent.</p></article>
        </div>
      </section>

      <footer><div className="brand"><span className="brand-mark">A</span><span>AION</span></div><span>A language for giving AI a personality.</span><span>© 2026</span></footer>
    </main>
  );
}
