# Design system

Status: not started. Planned to be built via a Claude Design session (claude.ai/design), synced into this repo as a component library rather than designed ad hoc inside Svelte components.

## Why a dedicated session

The README's [Interface](../README.md#interface) section is already a strict design brief — concentric dials, a radial field composed of the day's own three colors, precision over atmosphere, no chrome that says nothing. That's enough specificity to design against directly, and doing it as its own pass (rather than styling components one at a time while building features) is what keeps the seven-color system, the dial, and the type scale coherent with each other instead of drifting component by component.

## What it needs to produce

- **Color tokens.** The seven-mandate spectrum (Red/Orange/Yellow/Green/Teal/Indikon/Violet) plus White, as an actual token set — not just hex values but the rules for how a color behaves at each scope (Hand rim / week ring / day center in the radial field) and in UI chrome (text, borders, states) without flattening into "theme color."
- **Type scale.** README calls for "a real type scale" as part of precision-over-atmosphere; needs to hold up at both the dial's small numerals and Dawn/Dusk's longer text entries.
- **Dial component.** The three concentric rings (Hand outer, week middle, day inner), hairline ticks, current-position highlighting — this is the single most load-bearing visual piece and the one hardest to get right by iterating in-component.
- **Form patterns for Dawn/Dusk entry** — has to hit the "under three minutes, never wonder where something is" bar from the interface principles, so layout and input patterns matter as much as color here.
- **Light groundwork for the radial background field** — the day/week/Hand composited color field described in the README, even if the literal implementation ends up as bespoke SVG/canvas code rather than a static design asset.

## Constraints to bring into the session

Read [accessibility.md](accessibility.md) first. Two of its requirements shape the design directly rather than reviewing it afterward:

- **Text contrast against a daily-changing saturated field.** Body text must hit 4.5:1 on every possible triad, including palettes the designer never saw. That forces either a constrained luminance envelope behind text or a scrim layer — a foundational decision, not a fix.
- **Color is never the sole encoding.** Position, always-on labels, a luminance ramp across the seven positions, and optional texture fills all need to exist in the token set and the dial component from the start.

The color tokens also need an audio counterpart — see [audio.md](audio.md), which maps hue to pitch, lightness to register, and saturation to timbre. Worth designing the two token sets together so the parallel is real rather than asserted.

## Workflow

Design in a Claude Design project, then pull the resulting component specs into `src/lib/components` via the `DesignSync` tool / `/design-sync` flow — incrementally, one component at a time, not a wholesale replace. This keeps the design project and the live Svelte components from diverging silently.

## When

Not scheduled yet — sequenced after the spec docs (this doc included) so the design session has the data model and the date engine's actual output shape to design against, rather than designing blind. Fine to pull forward if it's more useful to have the visual language settled before writing UI code.
