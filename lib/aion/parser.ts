import {
  AionAssignment,
  AionDiagnostic,
  AionParseResult,
  AionProgram,
  AionReaction,
  AionPreference,
  AionMemoryRule,
  AionPersonaRule,
  AionPrimeRule,
} from "./ast";
import { Token, lex } from "./lexer";

class Parser {
  private index = 0;
  private diagnostics: AionDiagnostic[] = [];
  private closed = false;

  constructor(private readonly tokens: Token[]) {}

  parse(): AionParseResult {
    this.skipNewlines();
    const header = this.consume("HEADER", "Expected ⟪AION::1⟫ header.");
    if (!header || header.value !== "⟪AION::1⟫") return { diagnostics: this.diagnostics };

    this.skipNewlines();
    this.expectValue("ᚫ", "Expected AI declaration.");
    if (this.current().value === "AI") this.index++;
    this.skipNewlines();

    const identity = this.parseIdentity();
    const sections = {
      mind: [] as AionAssignment[],
      voice: [] as AionAssignment[],
      bond: { relationship: undefined as string | undefined, distance: undefined as number | undefined, line: identity.line },
      react: [] as AionReaction[],
      pref: [] as AionPreference[],
      memory: [] as AionMemoryRule[],
      persona: [] as AionPersonaRule[],
      prime: [] as AionPrimeRule[],
    };

    while (!this.at("EOF")) {
      this.skipNewlines();
      if (this.at("EOF")) break;
      if (this.current().value === "⟫") {
        this.index++;
        this.closed = true;
        break;
      }

      if (this.at("SECTION")) {
        const name = this.current().value;
        this.index++;
        this.skipNewlines();
        switch (name) {
          case "MIND": sections.mind = this.parseAssignments(); break;
          case "VOICE": sections.voice = this.parseAssignments(); break;
          case "BOND": sections.bond = this.parseBond(); break;
          case "REACT": sections.react = this.parseRules<AionReaction>((expression, line) => ({ expression, line })); break;
          case "PREF": sections.pref = this.parseRules<AionPreference>((expression, line) => ({ expression, line })); break;
          case "MEMORY": sections.memory = this.parseRules<AionMemoryRule>((expression, line) => ({ expression, line })); break;
          case "PERSONA": sections.persona = this.parseRules<AionPersonaRule>((expression, line) => ({ expression, line })); break;
          case "PRIME": sections.prime = this.parseRules<AionPrimeRule>((expression, line) => ({ expression, line })); break;
          default: this.error(`Unknown section ${name}.`); this.recoverSection();
        }
      } else {
        this.error(`Unexpected token '${this.current().value}'.`);
        this.recoverLine();
      }
    }

    this.requireSection("MIND", sections.mind.length > 0);
    this.requireSection("VOICE", sections.voice.length > 0);
    this.requireSection("BOND", sections.bond.relationship !== undefined || sections.bond.distance !== undefined);
    this.requireSection("REACT", sections.react.length > 0);
    this.requireSection("PRIME", sections.prime.length > 0);

    if (!this.closed) this.error("Missing closing marker ⟫.");
    if (this.diagnostics.some((d) => d.severity === "error")) return { diagnostics: this.diagnostics };

    const ast: AionProgram = {
      version: "1",
      identity,
      mind: { values: sections.mind },
      voice: { values: sections.voice },
      bond: sections.bond,
      react: sections.react,
      pref: sections.pref,
      memory: sections.memory,
      persona: sections.persona,
      prime: sections.prime,
    };

    return { ast, diagnostics: this.diagnostics };
  }

  private parseIdentity() {
    let id = "";
    let role = "";
    const line = this.current().line;

    while (!this.at("EOF") && !this.at("SECTION")) {
      if (this.current().value === "↳") {
        this.index++;
        const key = this.readValue();
        this.expect("COLON", "Expected ':' after identity field.");
        const value = this.readValue();
        if (key === "ID") id = value;
        if (key === "ROLE") role = value;
      } else if (this.current().type === "NEWLINE") {
        this.index++;
      } else {
        this.error(`Unexpected identity token '${this.current().value}'.`);
        this.recoverLine();
      }
    }

    if (!id) this.error("Missing AI ID.");
    if (!role) this.error("Missing AI ROLE.");
    return { id, role, line };
  }

  private parseAssignments(): AionAssignment[] {
    const values: AionAssignment[] = [];
    this.expect("LBRACE", "Expected '{' after section name.");
    while (!this.at("EOF") && !this.at("RBRACE")) {
      this.skipNewlines();
      if (this.at("RBRACE")) break;
      const line = this.current().line;
      const key = this.readCompoundKey();
      this.expect("DOUBLE_COLON", "Expected '::'.");
      const valueToken = this.current();
      if (!["NUMBER", "IDENT", "STRING"].includes(valueToken.type)) {
        this.error("Expected a value after '::'.");
        this.recoverLine();
        continue;
      }
      this.index++;
      values.push({ key, value: valueToken.type === "NUMBER" ? Number(valueToken.value) : valueToken.value, line });
      this.skipNewlines();
    }
    this.expect("RBRACE", "Expected '}' to close section.");
    return values;
  }

  private parseBond() {
    const bond = { relationship: undefined as string | undefined, distance: undefined as number | undefined, line: this.current().line };
    this.expect("LBRACE", "Expected '{' after BOND.");
    while (!this.at("EOF") && !this.at("RBRACE")) {
      this.skipNewlines();
      if (this.at("RBRACE")) break;
      const line = this.current().line;
      if (this.at("IDENT") && this.current().value === "USER") {
        this.index++;
        this.expect("ARROW", "Expected '→' in BOND.");
        bond.relationship = this.readValue();
      } else if (this.at("IDENT") && this.current().value === "DISTANCE") {
        this.index++;
        this.expect("ARROW", "Expected '→' after DISTANCE.");
        const token = this.current();
        if (token.type !== "NUMBER") this.error("DISTANCE must be numeric.");
        else bond.distance = Number(token.value);
        this.index++;
      } else {
        this.error(`Invalid BOND rule at line ${line}.`);
        this.recoverLine();
      }
      this.skipNewlines();
    }
    this.expect("RBRACE", "Expected '}' to close BOND.");
    return bond;
  }

  private parseRules<T>(factory: (expression: string, line: number) => T): T[] {
    const rules: T[] = [];
    this.expect("LBRACE", "Expected '{' after section.");
    while (!this.at("EOF") && !this.at("RBRACE")) {
      this.skipNewlines();
      if (this.at("RBRACE")) break;
      const line = this.current().line;
      const parts: string[] = [];
      while (!this.at("EOF") && !this.at("NEWLINE") && !this.at("RBRACE")) {
        parts.push(this.current().value);
        this.index++;
      }
      if (parts.length) rules.push(factory(parts.join(" "), line));
      this.skipNewlines();
    }
    this.expect("RBRACE", "Expected '}' to close section.");
    return rules;
  }

  private readCompoundKey() {
    const parts: string[] = [];
    if (this.current().type !== "IDENT") {
      this.error("Expected an identifier.");
      return "";
    }
    parts.push(this.current().value);
    this.index++;
    while (this.at("DOT")) {
      this.index++;
      const part = this.current();
      if (part.type !== "IDENT") {
        this.error("Expected an identifier after '.'.");
        break;
      }
      parts.push(part.value);
      this.index++;
    }
    return parts.join(".");
  }

  private readValue() {
    const token = this.current();
    if (!["IDENT", "STRING", "NUMBER"].includes(token.type)) {
      this.error("Expected a value.");
      return "";
    }
    this.index++;
    return token.value;
  }

  private requireSection(name: string, present: boolean) {
    if (!present) this.error(`Missing required section ${name}.`);
  }

  private expect(type: Token["type"], message: string) {
    if (this.at(type)) {
      this.index++;
      return true;
    }
    this.error(message);
    return false;
  }

  private expectValue(value: string, message: string) {
    if (this.current().value === value) {
      this.index++;
      return true;
    }
    this.error(message);
    return false;
  }

  private consume(type: Token["type"], message: string) {
    if (this.at(type)) return this.tokens[this.index++];
    this.error(message);
    return undefined;
  }

  private at(type: Token["type"]) { return this.current().type === type; }
  private current() { return this.tokens[this.index]; }
  private skipNewlines() { while (this.at("NEWLINE")) this.index++; }

  private error(message: string) {
    const token = this.current();
    this.diagnostics.push({ severity: "error", message, line: token.line, column: token.column });
  }

  private recoverLine() {
    while (!this.at("EOF") && !this.at("NEWLINE")) this.index++;
    this.skipNewlines();
  }

  private recoverSection() {
    while (!this.at("EOF") && !this.at("SECTION")) this.index++;
  }
}

export function parseAion(source: string): AionParseResult {
  return new Parser(lex(source)).parse();
}
