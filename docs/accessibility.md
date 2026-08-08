# Accessibility

Status: proposed. Constrains the design system session — should be read before [design-system.md](design-system.md) work starts, not after.

## The core problem, stated honestly

This application encodes its primary information in hue. Roughly 8% of men and 0.5% of women have some form of color vision deficiency, and the seven-color spectrum is close to a worst case for it: red/green, orange/yellow, green/teal, and indigo/violet are all confusable pairs under the common deficiencies. A calendar whose units are colors is a calendar whose units are, for those users, partially or wholly indistinguishable.

The README claims color is *"universal in mechanism, personal in meaning."* The mechanism is not in fact universal, and the design has to answer for that rather than route around it.

## The openness is the answer

The strongest accessibility feature in this system is one it already has for other reasons.

Because color semantics are user-definable down to exact hex values (see [data-model.md](data-model.md) `calendar_overrides`), a user with deuteranomaly can author a palette that is maximally distinguishable *to them* — seven colors they can actually tell apart, carrying the mandates they chose. Nobody has to guess at a one-size palette. The README's claim that the framework survives someone disagreeing with all of it turns out to include disagreeing with its perceptual assumptions.

Two things follow, and both are requirements rather than nice-to-haves:

1. **Palette editing must ship early, not in the "Later" tier.** The README currently files editable color semantics under Later. For a colorblind user it is not a customization feature, it is the difference between a usable app and an unusable one.
2. **Ship curated CVD-safe presets.** Asking a user to hand-pick seven mutually distinguishable colors is real work. Presets for deuteranopia, protanopia, and tritanopia — plus a high-luminance-contrast monochrome variant — mean the fix is one tap. The default palette should also be checked for CVD separation rather than chosen purely aesthetically.

## Redundant encoding

Color must never be the sole carrier of information. Every color position is also encoded by:

| Channel | How |
|---|---|
| **Position** | The spectrum order never varies. Position 4 in any ring is always the middle color, at every scale. This is the single most reliable non-color channel the system has, and it's free — it comes from the structure, not from an accommodation. |
| **Label** | Color names available as always-on text, not hover-only. An option, defaulting on for users who enable a CVD preset. |
| **Luminance** | Palettes should hold a monotonic or clearly stepped lightness ramp so positions differ in value, not only hue. This constrains palette authoring, including user-authored ones — the editor should warn when two positions are too close in luminance. |
| **Texture** | Distinct fills per position for the dial rings, as an option. Useful in print/screenshot export too. |
| **Audio** | Distinct pitch per position — see [audio.md](audio.md). |

**Audio is not the colorblind accommodation.** It requires sound to be on, which fails in public, in bed at 11pm, and for deaf and hard-of-hearing users. It is a genuine third channel and it helps, but position, label, and luminance carry the load.

## The dial

The three concentric dials are the interface's centerpiece and a bespoke SVG instrument, which makes them the hardest accessibility problem here.

- The dial needs a **text equivalent that is always present**, not an `aria-label` hidden behind a screen reader. A visible readout naming the three active scopes and the day's Arcana serves screen reader users, colorblind users, and the README's own goal that the nesting be "legible in under a second." The accessible solution and the design goal are the same solution.
- Day navigation must be fully keyboard operable, with visible focus states that survive against every possible background triad.
- The SVG itself: `role="img"` with a description for the composite, or a properly labelled group structure if the rings are individually interactive. Not decorative, so never `aria-hidden`.

## Contrast against a field that changes daily

The background is a radial composition of three saturated colors that recomposes daily. Text sits on top of it. This is a direct collision with WCAG contrast requirements, and it will bite during the design system session.

- Body text and interactive controls must hit **4.5:1** (and 3:1 for large text and UI boundaries) **on every one of the possible triads**, including user-authored palettes that the designer never saw.
- This effectively requires either a constrained luminance envelope for the field behind text regions, or a scrim/plate layer that text always sits on. That is a design system decision, and it should be made deliberately rather than discovered when a yellow-on-white day ships.
- Automated check: contrast validation over the full set of scope combinations, run in CI. With a fixed seven-color palette the combination space is small enough to test exhaustively — and the same check should run client-side when a user edits their own palette.

## Motion

The field "recomposes every day and transforms completely every fifty-two." Transitions between states, and any rotation of the dial, must respect `prefers-reduced-motion` — reduced to a cut or a brief cross-fade. Vestibular triggers are a real risk with large-area radial motion specifically.

## Input and the three-minute budget

The README's friction budget ("under three minutes, never once wonder where something is") is itself an accessibility requirement, and it applies with more force to users with motor or cognitive disabilities:

- Touch targets at minimum 44×44 CSS px, which matters on the dial's rings.
- Dawn/Dusk text entry must work with voice input and standard assistive text tooling — plain inputs, no custom-drawn text editing.
- No timed interactions. A check-in window is a prompt, never a countdown.
- Entries save locally as you type (see [data-model.md](data-model.md)), so an interrupted session never loses work.

## Standards target

WCAG 2.2 Level AA as the baseline commitment. Level AAA contrast is not realistic against a saturated color field and is not claimed.

Native shells inherit platform expectations too — VoiceOver and TalkBack navigation, Dynamic Type / font scaling honored rather than fixed `px` type, and safe-area handling per [multi-platform.md](multi-platform.md).

## Testing

- Automated: `axe` or equivalent in CI, plus the exhaustive contrast matrix above.
- Manual: full check-in flow by keyboard only, and with VoiceOver and TalkBack.
- CVD simulation over every shipped palette preset and the dial at all seven Hand states.
- Automated tooling catches roughly a third of real issues. The manual passes are the ones that matter.

## Open questions

- Whether the CVD presets should be offered proactively during onboarding (a "can you distinguish these seven?" step) or left in settings. Proactive is more likely to be found; it also opens the app by asking about a disability, which needs care.
- Whether user-authored palettes should be *blocked* from failing contrast or merely warned. Blocking protects legibility; it also overrides the user's authority over their own frame, which is the thing the whole project is about. Leaning warn-and-explain.
