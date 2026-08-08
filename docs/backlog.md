# Backlog

Moved out of the README so the README stays the vision and structural spec. Tiers are the original ones; items are broken down to the level where you can tell what the work actually is and what blocks it.

Spec links point to the doc that governs each item. Where a spec doesn't exist yet, that's noted as work.

## Sequencing

Four things gate large amounts of downstream work, in this order:

1. **Project scaffold** — nothing else starts without it.
2. **Date engine** — every surface in the app renders from the `Position` it returns.
3. **Design system session** — the dial and the color field are hard to retrofit, and the accessibility constraints on text contrast are foundational rather than a later pass.
4. **Arcana content authoring** — the Arcana view has nothing to show until the twenty-two exist. Now unblocked (see [arcana-content.md](arcana-content.md)).

---

## Now

Foundation. Nothing ships without all of it.

### Project scaffold
Spec: [architecture.md](architecture.md)
- [x] SvelteKit + TypeScript init, repo layout per spec
- [x] `src/lib/core` boundary established — no Svelte, no DOM, no network imports
- [x] Vitest for core — 46 passing, boundary enforced by omitting the SvelteKit plugin from `vitest.config.ts`
- [ ] Playwright for the check-in flow *(harness is wired — see `e2e/rendering.test.ts` — but the flow itself doesn't exist until Dawn/Dusk capture lands)*
- [x] Configure `adapter-static` — prerendered public routes, `ssr = false` on the app shell (settled)
- [x] Strict CSP with no `unsafe-inline` / `unsafe-eval` *(load-bearing for auth — see [auth.md](auth.md))*

### Date engine — **done**
Spec: [date-engine.md](date-engine.md)
- [x] Position derivation — birthday → Hand / handDay / week / weekDay
- [x] Green anomaly — Hand-days 26 and 27 share the Green slot
- [x] Artificer, day 365, outside all Hands
- [x] `positionToDate` as a true inverse, not a search
- [x] Calendar-date layer (`civil-date.ts`) so DST can't produce off-by-ones
- [x] Full test matrix per spec, including DST, round-trip, and distribution invariants
- [x] Leap handling — refuses by default, opt-in for the floated treatment
- [ ] Arcana slot → `arcanaId` resolution *(blocked on content authoring; the engine
      returns the structural slot, so nothing else is held up)*

### Design system session
Spec: [design-system.md](design/design-system.md) · constrained by [accessibility.md](design/accessibility.md)
- [x] Color tokens — seven mandates + White, with per-scope behavior rules — `src/lib/styles/tokens.css`
- [x] Luminance ramp across the seven positions (accessibility requirement, not aesthetic preference)
- [x] Text-contrast strategy against a daily-changing saturated field — scrim vs. constrained luminance envelope *(the `field` role: L 0.32–0.50, C ≤ 0.11 — white text ≥5:1 on the worst case)*
- [x] Type scale
- [x] Dial component design
- [x] Dawn/Dusk form patterns
- [x] Radial field groundwork
- [x] Sync into `src/lib/components` *(pulled manually per [design/HANDOFF.md](design/HANDOFF.md) — the Claude Design project was created as a regular project, not `PROJECT_TYPE_DESIGN_SYSTEM`, so the `/design-sync` tool couldn't target it)*

### The dial
- [x] Three concentric rings, current position lit at each scope — `src/lib/components/Dial.svelte`
- [x] Day navigation — click a segment or arrow keys (±1 day / ±1 week / shift±1 Hand)
- [x] Always-visible text readout of the three active scopes *(serves screen readers, colorblind users, and the README's own "legible in under a second" goal — same solution)* — `src/lib/components/Readout.svelte`
- [x] Keyboard operation with focus states that survive every triad *(focus ring is fixed teal-on-dusk-bg, independent of the day's triad)*
- [x] 44×44px minimum touch targets on ring interactions *(smallest segment ≈54×58px at the day ring's inner edge)*

### Dawn / Dusk capture
Spec: [data-model.md](data-model.md)
- [ ] IndexedDB local store + schema
- [ ] Dawn: friction named, counter-move pre-decided, day goal
- [ ] Dusk: what held, what didn't, klesha, lived color
- [ ] Append-only enforcement — Dusk never revises Dawn
- [ ] Save-as-you-type so an interrupted session loses nothing

### Goal capture at scope-open
- [ ] Hand goal at Hand open
- [ ] Week goal at week open
- [ ] Day goal (part of Dawn)
- [ ] All three scopes visible while setting any one of them

### Color semantics editing
Spec: [accessibility.md](design/accessibility.md) · [data-model.md](data-model.md)

**Promoted from Later.** For a colorblind user this isn't customization, it's what makes the app usable at all — the seven-color spectrum is close to a worst case for the common deficiencies.
- [ ] Per-position hex editing, persisted to `color_semantics`
- [ ] CVD-safe presets — deuteranopia, protanopia, tritanopia, high-contrast monochrome
- [ ] Contrast + luminance-separation warnings on user-authored palettes
- [ ] Default palette checked for CVD separation, not chosen purely aesthetically

### Accessibility baseline
Spec: [accessibility.md](design/accessibility.md)
- [ ] Redundant encoding — position, optional always-on labels, luminance, optional texture
- [ ] `prefers-reduced-motion` on field recomposition and dial motion
- [ ] Exhaustive contrast matrix over all scope combinations, in CI
- [ ] Keyboard-only pass on the full check-in flow
- [ ] WCAG 2.2 AA as the standing target

---

## Next

### Arcana content authoring
Spec: [arcana-content.md](arcana-content.md)
- [ ] Author against ids **0–21** (settled) — `id` is permanent and must never be renumbered
- [ ] Write the twenty-two: name, prompt, gloss, tarot antecedent, imagery notes
- [ ] Placement table — which Arcana opens, centers, and closes each Hand
- [ ] Ship as data in `lib/core/arcana.ts`, never as literals in components

### Arcana view
- [ ] The day's archetype and its prompt
- [ ] Prior-year entries for the same Arcana, side by side
- [ ] Per-Arcana note capture

### Scope closes
- [ ] Week close at each Violet day — seven days of divergence reviewed, incoming week's goal set
- [ ] Hand close at the Red-Violet Arcana — full 52-day review, carry forward what survives without scaffolding

### Divergence analytics
- [ ] Assigned vs. lived color, per day
- [ ] Aggregated per Hand
- [ ] Computed as a view, never stored *(see [data-model.md](data-model.md))*

### Export and import
Spec: [privacy.md](privacy.md) — commitment 5
- [ ] Complete JSON export, plus a human-readable rendering
- [ ] Import / restore
- [ ] Available without an account and without a paywall, unconditionally

### Accounts and sync
Spec: [auth.md](auth.md)
- [ ] Supabase Auth — email/password, Google, Apple
- [ ] Postgres schema + RLS policies (policy lands in the same commit as its table)
- [ ] Sync queue, client-generated UUIDs, last-write-wins per row
- [ ] Claim local data on first signup
- [ ] Session storage: cookies on web, secure storage in Capacitor

### Audio: the triad
Spec: [audio.md](audio.md)
- [ ] Web Audio synthesis layer — oscillators + envelopes, no samples
- [ ] Color → pitch mapping in `lib/core`, derived from `Position`
- [ ] The day's chord: Hand low, week mid, day high
- [ ] Dawn/Dusk commit tones
- [ ] Mute as first-class — no information lost when silent
- [ ] Respect system silent mode; no autoplay before a user gesture

---

## Later

- [ ] **Year wheel** — all seven Hands, Arcana as fixed points on the rim
- [ ] **Multi-year Arcana comparison** — the cross-year view the Arcana exist for
- [ ] **Friction log as its own surface** — which scope-conflict fired, which klesha, whether the counter-move held
- [ ] **Custom Arcana** — sparse overrides keyed by stable `id`; renaming preserves history
- [ ] **Color-semantic drift over time** — what your own definitions became
- [ ] **Mobile shells** — Capacitor iOS/Android, safe areas, native export via share sheet *(spec: [multi-platform.md](multi-platform.md))*
- [ ] **Notifications** bound to the Dawn and Dusk windows — depends on the shells; bodies never contain entry content
- [ ] **Audio: deep customization** — user-defined frequencies, tuning systems, timbre, Newton and Scriabin presets
- [ ] **Divergence as audio** — assigned vs. lived triad played back to back
- [ ] **Privacy hardening** — biometric lock, obscured app-switcher preview, hide-previous-entries mode
- [ ] **Localization** — schema already shaped for it; keep prompt text out of components

---

## Blocking decisions

Things that stop or rework real work if left open.

- **Leap years — the 366th day.** 366 days breaks a 365-slot structure. Doubling the Artificer follows the Green Week precedent and is implemented as an opt-in; the default throws. *Blocks: one day per affected user, per leap cycle.*
- **February 29 birthdays.** *Surfaced while implementing the date engine.* No anniversary exists in a common year, and Feb 28 vs. Mar 1 is a semantic call, so the engine refuses by default. Unlike the 366th day this breaks the app **entirely** for those users (~1 in 1461). *Blocks: onboarding anyone born on Feb 29.*
- **Field-level E2EE — ship at v1 or accept the retrofit?** Retrofitting encryption onto an existing corpus is far worse than building with it. *Blocks: nothing now; blocks launch.* *(see [privacy.md](privacy.md))*
- **Doubled Green Arcana — one goal slot or two?** *Blocks: goal capture at the Green center, and the audio treatment of the anomaly.*
- **Minors.** A birthday-anchored app will attract users under 13 — COPPA and equivalents. *Blocks: public launch.*

## Open questions

The conceptual ones, preserved from the README. These don't block implementation; they're what the system is for finding out.

- **Failure handling.** A Hand goal that is not met — absorbed, extended, restarted, or noted and passed. Dusk produces the data; no rule consumes it yet.
- **Whether Dusk's color read should be recorded blind to the morning triad.** Blind yields cleaner divergence data; non-blind is faster and keeps the day's frame.
- **Whether self-similar scopes are load-bearing or merely satisfying.** The system asserts the same seven distinctions work at every magnification; a year of divergence data is what would test it.
- **Whether the chord is heard or built.** Letting the user *tune* the lived-color pitch would make audio an input channel, not just an output — matching the two-directional read/set loop the check-ins already run on. *(see [audio.md](audio.md))*
- **The Artificer's sound.** Outside all Hands, no chord. Silence is the most interesting answer and the most likely to read as a bug.

Per-doc open questions live in their own specs and aren't duplicated here.
