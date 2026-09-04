export type TokenType =
  | "HEADER"
  | "IDENT"
  | "NUMBER"
  | "STRING"
  | "ARROW"
  | "DOUBLE_COLON"
  | "LBRACE"
  | "RBRACE"
  | "LBRACKET"
  | "RBRACKET"
  | "LPAREN"
  | "RPAREN"
  | "COLON"
  | "DOT"
  | "PLUS"
  | "MINUS"
  | "NOT"
  | "SECTION"
  | "NEWLINE"
  | "EOF"
  | "TEXT";

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

const sectionNames = new Set(["MIND", "VOICE", "BOND", "REACT", "PREF", "MEMORY", "PERSONA", "PRIME"]);

export function lex(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let line = 1;
  let column = 1;

  const push = (type: TokenType, value: string, startLine: number, startColumn: number) => {
    tokens.push({ type, value, line: startLine, column: startColumn });
  };

  while (i < source.length) {
    const ch = source[i];

    if (ch === "\n") {
      push("NEWLINE", "\n", line, column);
      i++;
      line++;
      column = 1;
      continue;
    }

    if (ch === "\r" || ch === " " || ch === "\t") {
      i++;
      column++;
      continue;
    }

    const startLine = line;
    const startColumn = column;

    if (source.startsWith("⟪AION::", i)) {
      const end = source.indexOf("⟫", i);
      if (end !== -1) {
        const value = source.slice(i, end + 1);
        push("HEADER", value, startLine, startColumn);
        column += value.length;
        i = end + 1;
        continue;
      }
    }

    if (source.startsWith("↳", i)) {
      push("ARROW", "↳", startLine, startColumn);
      i++;
      column++;
      continue;
    }

    if (source.startsWith("→", i)) {
      push("ARROW", "→", startLine, startColumn);
      i++;
      column++;
      continue;
    }

    if (source.startsWith("::", i)) {
      push("DOUBLE_COLON", "::", startLine, startColumn);
      i += 2;
      column += 2;
      continue;
    }

    const punctuation: Record<string, TokenType> = {
      "{": "LBRACE", "}": "RBRACE", "[": "LBRACKET", "]": "RBRACKET",
      "(": "LPAREN", ")": "RPAREN", ":": "COLON", ".": "DOT",
      "+": "PLUS", "-": "MINUS", "¬": "NOT",
    };

    if (punctuation[ch]) {
      push(punctuation[ch], ch, startLine, startColumn);
      i++;
      column++;
      continue;
    }

    if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      while (j < source.length && source[j] !== quote) j++;
      if (j < source.length) j++;
      const value = source.slice(i + 1, j - 1);
      push("STRING", value, startLine, startColumn);
      column += j - i;
      i = j;
      continue;
    }

    if (/\d/.test(ch)) {
      let j = i + 1;
      while (j < source.length && /\d/.test(source[j])) j++;
      const value = source.slice(i, j);
      push("NUMBER", value, startLine, startColumn);
      column += j - i;
      i = j;
      continue;
    }

    let j = i + 1;
    while (j < source.length && !/[\s{}\[\]():+\-→¬⟪⟫]/u.test(source[j])) j++;
    const value = source.slice(i, j);
    push(sectionNames.has(value) ? "SECTION" : "IDENT", value, startLine, startColumn);
    column += j - i;
    i = j;
  }

  tokens.push({ type: "EOF", value: "", line, column });
  return tokens;
}
