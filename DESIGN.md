# AION Design Context

## Product
AION turns a plain-language personality description into a short system prompt that any LLM follows. The Studio's job is to make that translation fast and trustworthy: describe, tweak, copy.

## Visual direction
Dark workspace, quiet chrome, precise labels, one restrained violet signal for the primary action and active states.

## Palette
- Ink `#07080b` page background
- Surface `#0b0d11` panels
- Raised `#111319` inputs and chips
- Line `#20232b` structural boundaries
- Muted `#777b87` secondary text
- Text `#f3f4f6` primary text
- Signal `#8a55f7` focus and active intelligence

## Typography
Vazirmatn Variable, self-hosted through `@fontsource-variable/vazirmatn`, for reliable Persian and Latin rendering. No external font requests.

## Principles
- Persian first: the whole surface is RTL by default and flips with the language toggle.
- The Studio never explains itself. Labels are short, nothing instructs the user how it works.
- Two panels: the description and persona editor on one side, the live prompt on the other.
- Editing any field updates the prompt instantly without a network call; only building from a description uses the model.
- Focus states stay visible, motion stays minimal and respects reduced motion.
- No decorative gradients, glow, or badges.
