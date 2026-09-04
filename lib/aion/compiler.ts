import { analyzeAion } from "./semantic";
import { lowerToIR, AionIR } from "./ir";
import { parseAion } from "./parser";
import { printAion } from "./printer";

export interface AionCompileResult {
  source: string;
  ir?: AionIR;
  diagnostics: ReturnType<typeof analyzeAion>;
}

/**
 * Full deterministic AION compiler pipeline:
 * source -> parser -> AST -> semantic analysis -> canonical IR -> printer.
 */
export function compileAion(source: string): AionCompileResult {
  const parsed = parseAion(source);
  if (!parsed.ast) {
    return { source, diagnostics: parsed.diagnostics };
  }

  const diagnostics = [...parsed.diagnostics, ...analyzeAion(parsed.ast)];
  if (diagnostics.some((diagnostic) => diagnostic.severity === "error")) {
    return { source, diagnostics };
  }

  const ir = lowerToIR(parsed.ast);
  return {
    source: printAion(ir),
    ir,
    diagnostics,
  };
}
