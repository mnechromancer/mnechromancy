# Mnechromancy

A calendar of seven colors, anchored to your birthday. Seven Hands, seven weeks, seven days — Red to Violet at every scale. Track the three you're inside, set a goal at each, log Dawn and Dusk. Inherited calendars measure time. This one you author. Live a life on terms you set, then check.

---

## Why a calendar

Calendars are the oldest interface between a person and their own life, and almost nobody chooses theirs.

The Gregorian year is an accounting instrument. It is very good at that. It tells you when the quarter closes, when rent is due, when the fiscal cycle turns — and it was designed by people who were not thinking about you and could not have been. The units are inherited, the divisions are administrative, and the meanings are borrowed from institutions that outlive individuals by design.

That would be fine if a calendar were only a measuring device. It isn't. Whatever divides your time also decides what recurs, what gets a name, what is treated as a beginning. A week that exists to organize labor produces a life organized around labor. This is not a conspiracy; it is just what structure does when nobody is choosing it.

The move here is to author the frame rather than only the goals inside it. Not a new productivity system layered on the old year, but different units, different names, different meanings assigned to each.

And there is a mechanical reason to put meaning in a calendar specifically rather than in a habit tracker or a resolution. **A date arrives whether or not you are paying attention.** Habits lapse, systems get abandoned, motivation is a poor substrate to build on. But September 20th comes regardless, and if September 20th carries a mandate, the mandate comes with it. Binding intention to time rather than to willpower is the entire trick.

---

## Why color

Color is a strange and useful material for this.

The perceptual apparatus is conserved. Three cone types, opponent-process channels, a well-mapped path from retina to V4. When two people discuss red, they are — mechanically — discussing something close to the same event. That shared substrate is what makes color one of the very few subjective domains where comparing notes is not futile.

The meaning on top of it is almost entirely learned. Berlin and Kay found color vocabularies expanding along a predictable path across unrelated languages, which means the categories are neither arbitrary nor fixed. Palmer and Schloss found preference tracking the accumulated valence of things a person has actually encountered in that color — your palette is a compressed record of your own experience.

So: universal in mechanism, personal in meaning, and still actively expanding. That combination is exactly what a self-authored calendar requires. A system of distinctions stable enough to structure a year, loose enough to hold meanings you put there rather than meanings you were handed.

Color is like music. Different traditions define their intervals differently and no one is wrong. Everyone makes their own song out of the same physics.

---

## The framework is open

This matters more than any particular thing in it.

The mandates below are one person's. So are the twenty-two Arcana and their archetypes. They are shipped as defaults because a system with no content is unusable, not because they are correct.

What is structural — and what the application actually implements — is narrower:

- Time divides into nested scopes that run the same sequence at every scale
- Each scope carries a goal with a horizon proportional to its length
- Scopes conflict, and the conflict is the working surface
- Every unit is both a *prescription* and a *thing you can read your state against*

Everything else is content. Replace the mandates. Rename the Arcana. Use a different spectrum. Use eight scopes instead of three. The frame is meant to survive someone disagreeing with all of it, and a version of this that only works if you accept another person's meanings has failed at the thing it claims to be for.

Openness here is not permissiveness. The structure is strict — that is what makes it load-bearing. But the structure is a grammar, and you write the sentences.

---

## Structure

The Color Calendar begins on your birthday and runs 365 days.

| Scale | Count | Length | Goal horizon |
|---|---|---|---|
| **Hand** | 7 | 52 days | Near-two-month structural change |
| **Week** | 7 per Hand | 7 days | Seven-day adaptation |
| **Day** | 7 per week | 1 day | Solidify the color itself |

Every scale runs the same spectrum in the same order. Every day therefore sits inside three colors at once — a Hand, a week, and a day. This self-similarity is the point: the same seven distinctions appear at every magnification, so the vocabulary you build at one scale is immediately legible at the others.

### The colors

| Color | Mandate |
|---|---|
| **Red** | Solidity, Crystallinity |
| **Orange** | Fluidity, Plasticity |
| **Yellow** | Growth, Direction |
| **Green** | Ubiquity, Love |
| **Teal** | Language, Understanding |
| **Indikon** | Discovery, Revelation |
| **Violet** | Creation, Detachment |

Hand is superordinate. Day is most subordinate. Week mediates. A non-Red week inside a Red Hand does not depart from the Hand's mandate — it becomes the mode through which that mandate is pursued. Fluidity in service of crystallization is a different instruction than either alone, and that composite is the actual unit of the system.

### Arcana

Twenty-two archetypes, drawn from the major arcana but not identical to it. Each Hand opens with one, closes with one, and carries a third at its center.

They do two jobs. On the day, the archetype is a prompt — a frame to move through rather than a task. Across years, they are fixed comparison points: the same Arcana returns on the same calendar day, and what you wrote there last time is waiting. A calendar that repeats its landmarks is a calendar that can show you drift.

### The Green anomaly

Green is the middle of the spectrum, where everything meets. The middle week of each Hand folds its Arcana into its Green slot, running eight calendar days across seven color positions.

It is the only irregularity in the structure, and it sits at the exact center — the hinge the rest of the Hand turns on. Whether that is elegance or artifact is left open on purpose.

### Date algorithm

```
Hand n opens at birthday + 52(n-1)
Hand-day  1        Red-Red Arcana
Hand-days 2–51     seven ROYGBIV weeks
                   week 4 spans eight calendar days;
                   its Green slot is the Green Arcana (Hand-days 26+27)
Hand-day  52       Red-Violet Arcana
Year-day  365      White — Artificer
```

7 Hands × 52 = 364, plus the Artificer = 365. The cycle closes on the day before your birthday.

---

## Unified subjectivity

Three traditions describe the same operation in different registers. The claim is not that they have been synthesized here — it is that they were never as separate as their vocabularies suggest.

**Dialectics.** The scopes conflict by design. A Yellow day wants direction; the Red Hand containing it wants crystallization. That contradiction is not a scheduling error to be smoothed away — it is the generative structure. Resolution produces something neither scope contained alone, and the new position immediately generates its own tension at the next scale. The system is meant to both resolve and sustain. Impulse arises as friction within the Hands, which reframes the thing usually treated as the obstacle to self-direction as its raw material.

**Yoga.** Patanjali's eight limbs are, read plainly, a behavior-change protocol with two millennia of field testing. Saucha purifies the environment before willpower is asked to do anything. Pratyahara withdraws attention from cues rather than resisting them. Pratipaksha bhavana cultivates the opposite instead of suppressing the impulse — arriving at behavioral replacement twenty-three centuries before ironic process theory explained why suppression backfires. Sakshi bhava watches the fluctuation crest and pass. Sankalpa and tapas are precommitment and its enforcement cost. Vairagya is baseline recalibration through insight rather than abstinence. And the sutras name abhyasa and vairagya — sustained practice plus non-attachment — as *jointly* sufficient, which is the same finding as structure-plus-insight outperforming either in isolation.

**Color theory.** Covered above: perceptually anchored, semantically open, still under construction. The one property that makes a self-authored system possible at all.

What connects them is a shared stance toward subjectivity — as substrate rather than problem. Dialectics holds that the contradictions inside a subject are what move it. Yoga holds that the fluctuations of mind are observable and therefore trainable. Color theory holds that the most vivid features of experience are universal in mechanism and personal in meaning. None of the three treats the first-person view as noise to be corrected. All three treat it as the working material.

---

## Check-ins

Two per day. The biofeedback loop runs in both directions and needs both to close: naming the color of a state you are already in, and setting a color your behavior then conforms to. Either alone degrades — pure reading becomes passive description, pure setting becomes wishful compliance.

**Dawn — direction set.** Name today's friction before it fires. Set one day goal with all three scopes in view. Pre-decide the counter-move for the impulse most likely to arrive, because cultivating the opposite only works if the opposite was chosen in advance rather than improvised at the moment of craving.

**Dusk — state read.** What held without willed effort. What did not. Which klesha was underneath. And what color the day *actually ran as*. No revision of the morning's entry.

The color read is the highest-signal field in the system. When the assigned color and the lived color diverge, that is data about the friction — not failure to comply. Enough of it in one place and the calendar starts telling you where your own semantics are wrong.

---

## Interface

The interface is not a shell around the calendar. It is the calendar.

A system whose entire subject is color cannot be delivered through a grid of gray cards. If the thing being built is an argument that the frame you live inside should be beautiful and chosen, then an ugly frame refutes the argument on sight.

Principles, held strictly:

**The instrument reads all three scopes at once.** Three concentric dials — the Hand's fifty-two days on the outer ring, seven weeks on the middle, seven days on the inner, each scope's current position lit. The nesting is not described in text. It is rendered, and it is legible in under a second.

**The field is composed of the day's own colors.** Background is a radial composition of the three active colors — day at the center, week around it, Hand at the rim. It recomposes every day and transforms completely every fifty-two. The application is never the same color twice in a row for long. Color is not decoration applied to the interface; it is the interface's subject matter, so it gets the largest surface.

**Precision over atmosphere.** Dials, hairlines, butt-cap ticks, a real type scale. Glow is cheap and reads as mood; exactness reads as an instrument you can trust. The system's own mandate is Solidity before Fluidity, and the interface should follow its own advice.

**No chrome that says nothing.** Every rule, label, and division encodes something true about the structure. Ornament that does not carry information gets cut.

**Fast enough to use at 6am and 11pm.** Two check-ins a day for a year is 730 sessions. Anything that adds friction to those is a bug, however beautiful. Elegance here means the whole entry takes under three minutes and you never once wonder where something is.

---

## Status

Early. The structure is settled and the date engine is verified on paper. Specs exist; no code does yet.

---

## Documentation

This README is the vision and the structural spec. Implementation specs live in [`docs/`](docs/):

- [Backlog](docs/backlog.md) — what's being built, in what order, and what's blocking
- [Architecture](docs/architecture.md) — stack (SvelteKit, Supabase, Capacitor), repo layout, data flow
- [Data model](docs/data-model.md) — entities, schema, local-first sync strategy
- [Auth](docs/auth.md) — account system, local-first-before-signup, session handling
- [Multi-platform](docs/multi-platform.md) — web + mobile strategy, what's shared vs. platform-specific
- [Date engine](docs/date-engine.md) — the birthday-to-Hand/Week/Day/Arcana algorithm, formalized with types and a test matrix
- [Design system](docs/design-system.md) — planned Claude Design session to produce color tokens, type scale, and the dial component
- [Audio](docs/audio.md) — pitch as a parallel channel to color; the three scopes as a chord
- [Accessibility](docs/accessibility.md) — colorblindness, redundant encoding, contrast against a color field
- [Arcana content](docs/arcana-content.md) — schema, placement, and authoring guidelines for the twenty-two
- [Privacy](docs/privacy.md) — what the log contains and what is committed to about it
