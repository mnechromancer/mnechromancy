# Handoff — design system → src/lib/components

Pull order (one component at a time per docs/design-system.md workflow):

1. **tokens.css** — copy as-is (or transcribe into a `tokens.ts`). Behavioral rules are in the file's comments; the invariants below are non-negotiable.
2. **Dial** — three concentric rings, from center out: Hand (7 segments, click = jump Hand keeping hand-day), week (7, click = jump to week start), day (7, click = set day within week). Thin outer band (`pathLength=52` dasharray) traces the Hand's 52 days; marker dot at the current day. Current segment: `field` fill + 2px `core` stroke, white numeral; idle: `--dial-idle` fill, `tint` numeral. Labels are HTML overlay, not SVG `<text>`. Keyboard: ←/→ ±1 day, ↑/↓ ±1 week, shift+←/→ ±1 Hand. Segments ≥44px. Focus ring visible on the dial container. All fills transition 300ms; band/marker 500ms; gate on prefers-reduced-motion.
3. **Readout** — always-visible text equivalent (three scope rows + one sentence), never aria-only. Handles brackets (hand-day 1/52: no week), the Green anomaly (hand-days 26/27), and the Artificer (day 365).
4. **Dawn/Dusk forms** — fields verbatim from data-model.md (`friction_named`, `counter_move`, `day_goal`; `held`, `not_held`, `klesha` optional w/ datalist, `color_actual` 7-way selector with position numeral + name). Plain inputs. Autosave locally as-you-type. Dusk never revises Dawn. Divergence from assigned color is surfaced as data, not error.
5. **Radial field** — radial-gradient (or SVG/canvas) of the three active `*-field` tokens: day center → week mid → Hand rim. Slow cross-fade on recompose; cut under reduced motion; never rotate.
6. **Audio** — close-voiced chord stacked up from the Hand's base (~C3): MIDI `48 + [0,2,4,5,7,9,11][pos]`, each higher scope raised by octaves until ≥ the voice below (equal = unison, by design). Triangle osc, 1.4s decay, ~−23dB. Hum: sine per voice at ~0.011 gain with per-voice LFO (0.05 + 0.037n Hz, ±0.008), 2.5s master fade in/out, retune with `setTargetAtTime` on day change. User gesture required; muting must never cost information.

## Decided (this session)
- `color_actual` divergence copy lives in the **component layer**, not content.
- **Green anomaly**: the shared Green slot's day+week hum voices waver more than a normal green tone — LFO rate ×2.6, depth 0.013 (vs 0.008). Chord playback otherwise normal.
- **Arcana days** (open/close/center): distinct waveform — sawtooth at reduced gain (0.045) in the reference; waveform per-slot should be user-customizable via `audio_semantics` in `calendar_overrides`.
- **Artificer sound**: user-specified on the day itself. Not designed yet — leave a hook, no default chord.

## Invariants (docs/accessibility.md)
- Text only ever sits on `field` tokens (L 0.32–0.50, C ≤ 0.11) → white ≥5:1 worst case. `core` never behind text.
- Luminance ramp monotonic across positions; palette editor warns under ΔL 0.03 (warn, never block).
- Redundant encoding: position, always-on labels, luminance, optional texture fills (7 SVG patterns in the DC), audio.
- Contrast matrix over all triads in CI + client-side on palette edit. WCAG 2.2 AA.
- Chrome: dusk dark / dawn light by check-in; the field never leaves the dark envelope.

Reference implementation for all of the above: `reference/Mnechromancy Design System.dc.html` (template = markup/styles, logic class = geometry, date math, audio). Generated tokens: `reference/tokens.css`.
