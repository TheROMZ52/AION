import { AionDiagnostic } from "./ast";

export function formatDiagnostic(diagnostic: AionDiagnostic): string {
  const location = diagnostic.column ? `${diagnostic.line}:${diagnostic.column}` : `${diagnostic.line}`;
  const code = diagnostic.severity === "error" ? "AION-E" : "AION-W";
  return `${code} at ${location}: ${diagnostic.message}`;
}

export function formatDiagnostics(diagnostics: AionDiagnostic[]): string {
  return diagnostics.map(formatDiagnostic).join("\n");
}
