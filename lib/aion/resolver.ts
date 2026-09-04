import { AionIR, AionIRRule, AionAction } from "./ir";

/** Runtime context used to evaluate contextual REACT rules. */
export interface AionContext {
  user?: string[];
  topic?: string[];
}

export interface AionResolvedState {
  mind: Record<string, number>;
  voice: Record<string, string | number>;
  bond: { relationship?: string; distance?: number };
  preferences: Record<string, string | number>;
  directives: string[];
  matchedRules: AionIRRule[];
}

/**
 * Resolves AION deterministically without mutating the baseline IR.
 * Stable layers are copied first; REACT is an ephemeral overlay.
 */
export function resolveAion(ir: AionIR, context: AionContext = {}): AionResolvedState {
  const state: AionResolvedState = {
    mind: { ...ir.mind },
    voice: { ...ir.voice },
    bond: { ...ir.bond },
    preferences: {},
    directives: [],
    matchedRules: [],
  };

  // Persistent user preferences are materialized separately from the baseline personality.
  for (const rule of ir.preferences) {
    if (rule.semantic.kind === "preference") {
      state.preferences[rule.semantic.target] = rule.semantic.value;
    }
  }

  for (const rule of [...ir.persona, ...ir.prime]) {
    if (rule.semantic.kind === "directive") state.directives.push(rule.semantic.value);
  }

  // REACT never changes the baseline IR. It is recomputed from the current context.
  // Keep discriminated-union narrowing and context matching in the same predicate.
  const matched = ir.reactions.filter(
    (rule) =>
      rule.semantic.kind === "conditional" &&
      matchesContext(
        rule.semantic.condition.subject,
        rule.semantic.condition.selector,
        context,
      ),
  );

  // Broad rules apply first; specific selectors then override them.
  // Array sort is stable in modern JS, so source order is preserved for equal specificity.
  matched.sort((a, b) => specificity(a) - specificity(b));

  for (const rule of matched) {
    if (rule.semantic.kind !== "conditional") continue;
    applyActions(state, rule.semantic.actions);
    state.matchedRules.push(rule);
  }

  return state;
}

function matchesContext(subject: string, selector: string, context: AionContext): boolean {
  const values = subject.toUpperCase() === "USER" ? context.user ?? [] : context.topic ?? [];
  const wanted = selector.trim().toUpperCase();
  if (wanted === "ANY") return true;
  return values.some((value) => value.toUpperCase() === wanted);
}

function specificity(rule: AionIRRule): number {
  if (rule.semantic.kind !== "conditional") return 0;
  return rule.semantic.condition.selector.toUpperCase() === "ANY" ? 0 : 1;
}

function applyActions(state: AionResolvedState, actions: AionAction[]): void {
  for (const action of actions) {
    if (action.type === "directive") {
      state.directives.push(action.value);
      continue;
    }

    if (action.target in state.mind && typeof action.value === "number") {
      const current = state.mind[action.target] ?? 0;
      state.mind[action.target] = action.operation === "add"
        ? current + action.value
        : action.operation === "subtract"
          ? current - action.value
          : action.value;
      continue;
    }

    if (action.target in state.voice && action.operation === "set") {
      state.voice[action.target] = action.value;
    }
  }
}
