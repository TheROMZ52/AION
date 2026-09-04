# AION Studio Design Context

## Product
AION is a natural-language compiler for AI personality and behavior. The Studio's job is to make the translation from human intent to structured AION feel tangible, precise, and easy to trust.

## Visual direction
**Developer Tool × AI Studio × Semantic Editor**

The interface should feel closer to a thoughtful compiler/editor than a generic AI landing page: dark workspace surfaces, quiet chrome, precise labels, and one restrained violet signal for active intelligence.

## Palette
- Ink: `#07080b` — page background
- Surface: `#0b0d11` — panels and cards
- Line: `#20232b` — structural boundaries
- Muted: `#777b87` — secondary controls
- Text: `#f3f4f6` — primary content
- Signal: `#8a55f7` — AION activity and primary action

## Typography
- Primary UI: Vazirmatn, loaded through `next/font`, for reliable Persian and Latin rendering.
- Code/output: system monospace stack.
- Display typography stays restrained; hierarchy comes from scale, weight, and spacing rather than decorative type.

## Studio interaction principles
- The prompt is the main instrument: paste-friendly, multiline, resizable, persisted across refreshes, and usable with Ctrl/⌘ + Enter.
- Quick prompts are suggestions, not a replacement for free-form intent.
- Output is presented as a compiler artifact, not a chat response.
- Focus states must be visible and keyboard navigation must remain usable.
- Motion is subtle and disabled/reduced when the user requests reduced motion.
- RTL is treated as a whole-surface concern, not only a textarea concern.

## Signature
The memorable element is the **intent → AION** workspace: two quiet compiler panels joined by a single directional bridge. Avoid adding unrelated decoration or AI-dashboard clichés.

## Guardrails
- Preserve the minimal AION identity and violet signal.
- Do not introduce gradients, glow, cards, badges, or animation merely for decoration.
- Prefer explicit, human-facing labels over implementation jargon.
- Any new recurring UI behavior should be reflected here before becoming a durable pattern.
