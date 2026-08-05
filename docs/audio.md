# Audio

Status: proposed. New feature area — not yet in the README backlog.

Audio is a parallel channel to color, not a sound effect layer and not an accessibility accommodation. The same argument the README makes for color — universal in mechanism, personal in meaning, still under construction — holds for pitch, and the structure of the calendar happens to be unusually well-suited to it.

## What is structural vs. what is content

Following the README's [framework is open](../README.md#the-framework-is-open) rule, the structural claims are narrow:

- Each of the seven color positions has a parallel audio identity.
- The three active scopes sound **simultaneously**, the same way they render simultaneously.
- The audio identity is user-definable to the same depth as the color identity.

Everything else — which note is Red, which tuning system, which timbre — is content, shipped as a replaceable default exactly like the color mandates and the Arcana.

## The chord

This is the reason audio fits rather than decorates.

Every day sits inside three colors at once, and the README is explicit that the composite is the actual unit: *"Fluidity in service of crystallization is a different instruction than either alone, and that composite is the actual unit of the system."*

Three simultaneous pitches is a chord. The radial field composites three colors spatially; the audio composites the same three as a triad. Hand in the low register (superordinate, the ground), week in the middle (mediating), day on top (most subordinate, most audible). A day is a voicing.

This yields things the visual channel can't do as directly:

- **Consonance tracks scope conflict.** A Red day inside a Red Hand is a unison — no tension, and the system says so by design. A Yellow day inside a Red Hand is an interval with real friction in it. The dialectic the README describes as "the generative structure" becomes literally audible, and it's the same information the dial already shows, in a channel that doesn't require looking.
- **Divergence becomes a comparison of two chords.** Dusk records what color the day *actually ran as* — the highest-signal field in the system. Assigned triad versus lived triad, played back to back, is a more immediate read of divergence than a bar chart of it.
- **The Green anomaly and the Artificer get audio treatments.** The doubled Green slot and the single White day are the two irregularities in the structure; both should sound like irregularities. Open question below.

## Customization parity

The user can specify colors by exact hex. Audio needs the same depth, mapped along parallel axes:

| Color axis | Audio axis | Notes |
|---|---|---|
| Hue (which color) | Pitch class (which note) | The primary identity. Seven positions, seven pitches. |
| Lightness / value | Register (octave) | Also how scope is distinguished: Hand low, week mid, day high. |
| Saturation | Timbre / harmonic richness | A muted color and a thin waveform are the same gesture. |
| The composited field | Voicing and balance | How the three scopes sit against each other in the mix. |
| — | Tuning system | No color analogue. See below. |

Tuning has no color equivalent and is where the README's "different traditions define their intervals differently and no one is wrong" cashes out most literally. 12-tone equal temperament as default; just intonation as an option, which changes how consonant a given scope-conflict actually sounds. Users defining their own frequencies directly is the audio equivalent of specifying hex.

## Default mappings

Ship more than one preset. A single default reads as canon; several presets that disagree with each other demonstrate the openness claim instead of asserting it — the same job the twenty-two Arcana do for archetype content.

Candidate presets:

- **Diatonic (default).** Straight ascending major scale, Red through Violet. Learnable in a day, which matters for a system meant to build vocabulary through repetition.
- **Newton.** Newton mapped the spectrum onto a diatonic scale in the *Opticks*, and the seven-color spectrum the calendar uses descends from that same act of division. Historically apt as a preset.
- **Scriabin.** His color-key mapping runs by circle of fifths rather than by spectral order, so it disagrees with Newton structurally, not just in detail — which is the point of shipping both.

**Do not invent the exact tables.** Newton's and Scriabin's mappings should be transcribed from a real source at implementation time, not reconstructed from memory. A preset that misattributes its own mapping undercuts the thing it exists to demonstrate.

## Where audio appears

| Moment | Behavior |
|---|---|
| Opening the app / day view | The day's triad sounds once. Short. This is the primary audio event. |
| Scope transition | Week rollover and Hand rollover get distinct treatments — a Hand opening is the largest structural event in the calendar and should be the largest sound. |
| Dawn commit | Confirmation tone derived from the day's assigned triad. |
| Dusk commit | The *lived* color sounds against the assigned one. |
| Green anomaly | Open question — see below. |
| Artificer (day 365) | Outside all Hands, White, no Hand or week color. Arguably the only day with no chord: a single tone, or silence, or all seven. Open question. |
| Divergence review | Assigned vs. lived triads, per day or aggregated per Hand. |

## Constraints

- **Silence is first-class.** Fully mutable, and muting must never cost information — every audio signal has a visual and textual equivalent. Audio is a third channel, never the only one.
- **6am and 11pm.** The check-in windows are exactly the hours when a phone making noise is most unwelcome. Respect system silent mode, default to short and quiet, and never autoplay on a cold launch without prior consent.
- **Under three minutes.** The README's friction budget applies. Audio that delays the entry flow is a bug, however beautiful.

## Technical implications

- **Synthesis, not samples.** Users can define arbitrary frequencies, tunings, and timbres, so a fixed sample set can't cover the space. Web Audio API oscillators + envelopes, generated at runtime. This also keeps the bundle small and works identically inside the Capacitor shells (see [multi-platform.md](multi-platform.md)).
- Audio mapping logic belongs in `src/lib/core` — it's pure, deterministic, and derived from the same `Position` the date engine already returns (see [date-engine.md](date-engine.md)). Playback (the Web Audio graph) sits outside core, in the UI layer.
- Audio preferences persist alongside color semantics in `calendar_overrides` (see [data-model.md](data-model.md)) — the `color_semantics` jsonb column gets an `audio_semantics` sibling rather than a separate table.
- Browsers require a user gesture before audio can start; the app must never appear broken on first load because of it.

## Open questions

- **The Green anomaly.** Two calendar days sharing one color slot. A repeated note, a sustained one across both days, or a unison — unresolved, and it should follow whatever the README's open question about "one goal slot or two" resolves to.
- **The Artificer.** Silence is the most interesting answer and the most likely to read as a bug. Needs a design decision, not a default.
- **Whether the chord is heard or built.** Playing the triad is passive. Letting the user *tune* it — adjust the lived-color pitch until it matches what the day felt like — would make audio an input channel, not just an output. That's a much larger feature and possibly a better one, since the README's whole check-in model is a two-directional loop of reading and setting.
- Whether scope should map to register (Hand low / day high) or to volume, or both. Register is the stronger default but untested.
