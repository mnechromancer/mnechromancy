# Arcana content spec

Status: proposed. Defines the *shape* of Arcana content and how it's authored, stored, and overridden. Does not write the twenty-two entries themselves — that's authoring work, and it's the largest piece of non-code content in the project.

Complements [data-model.md](data-model.md) (which stores user notes *about* Arcana) and [date-engine.md](date-engine.md) (which computes *which* Arcana falls where).

## The slot arithmetic

Seven Hands, each with an opening, a center, and a closing Arcana: 7 × 3 = **21 placed slots**. Day 365 is the **Artificer**, White, standing outside all Hands.

21 + 1 = **22**. The Artificer is one of the twenty-two — confirmed. The set has no unplaced members and no slot goes unfilled.

The twenty-two are parallels to the tarot Major Arcana: same count, same function as a closed set of archetypes that recur, drawn from that tradition but — per the README — *"not identical to it."* The antecedent belongs in each entry's `inheritedFrom` field, which makes the lineage legible without implying the calendar inherits the tarot's meanings wholesale.

The Artificer is the only Arcana that sits outside the Hand structure entirely, which makes it structurally singular in a way the other twenty-one are not. Whatever tarot antecedent it draws on, its slot has no Hand, no week, and no color but White.

### Numbering

**Settled: ids run 0–21.**

The Major Arcana are conventionally numbered 0–21, and since these are parallels, matching that convention keeps the correspondence readable at a glance. Twenty-two entries, zero-indexed.

Note the consequence for anyone reading the code: `id` is *not* an array position plus one, and a falsy `0` is a valid id. Guard against truthiness checks on `arcanaId` — `if (!arcanaId)` is a bug waiting to happen against Arcana 0.

## Entry schema

Each Arcana is a content record, shipped as a default and overridable per user:

```ts
interface Arcana {
  id: number;               // 0-21, stable forever — user notes key on this
  name: string;              // e.g. "The Artificer"
  slug: string;               // stable machine identifier
  prompt: string;              // the day's frame — see authoring guidelines
  gloss: string;                // one line on what this archetype is for
  inheritedFrom?: string;        // the major-arcana antecedent, where there is one
  imagery?: string;               // visual/symbolic notes for the design system
}
```

`id` is permanent and must never be reused or renumbered. The README's central claim for the Arcana is cross-year comparison — *"the same Arcana returns on the same calendar day, and what you wrote there last time is waiting."* Renumbering silently reattaches a user's history to the wrong archetype and destroys exactly the thing the feature exists for.

## Placement

Placement is a separate table from content, because the same 22 entries could be arranged differently by a user who reorders without rewriting:

```ts
interface ArcanaPlacement {
  hand: number;                        // 1-7
  position: 'open' | 'center' | 'close';
  arcanaId: number;                     // 0-21
}
```

Plus one entry for the Artificer at day 365, outside the Hand structure. The date engine reads this table to resolve `ArcanaSlot` (see [date-engine.md](date-engine.md)); it should not hardcode the mapping.

Ordering is unspecified in the README. Whether the default placement runs 1–21 in sequence across the Hands, or is arranged so particular archetypes land on particular color positions, is an authoring decision — and a meaningful one, since an Arcana's slot color inflects how it reads.

## Authoring guidelines

The README is precise about what an Arcana prompt is: *"a frame to move through rather than a task."* That distinction is the whole spec.

**Write frames, not tasks.**
- Task: "List three things you're avoiding." — completable, closed, produces a list.
- Frame: names a stance to occupy for the day and leaves what happens inside it open.

A frame can be inhabited by someone having a terrible day and someone having an excellent one, and it means something different to each. A task just gets done or not.

**Constraints:**

| Rule | Why |
|---|---|
| Present tense, second person or impersonal. | It's a stance for today, not a description of an archetype. |
| No moral scoring. | The system reads state; it does not grade. Divergence is data, not failure — the README is explicit. |
| Survives repetition. | Each prompt is read once a year for as long as the user keeps the practice. A clever line wears out; a real question doesn't. |
| Legible in under fifteen seconds. | Two check-ins a day for a year. A prompt that needs parsing is friction. |
| No presumed circumstances. | Not everyone has a job, a partner, a home, a body that cooperates. A frame that assumes any of these excludes people from their own calendar. |
| Doesn't resolve itself. | If the prompt implies its own correct answer, it's an instruction wearing a question's clothes. |

**Voice:** match the README — declarative, unhedged, comfortable with abstraction, no motivational register. The README earns its authority by being precise rather than encouraging, and the Arcana should sound like the same author.

## These are defaults, not canon

The README is unambiguous: the twenty-two Arcana are *"one person's,"* shipped *"because a system with no content is unusable, not because they are correct."*

Consequences for implementation:

- The default set lives in `src/lib/core/arcana.ts` as data, never as literals scattered through UI components.
- Overrides go in `calendar_overrides.arcana_overrides` (see [data-model.md](data-model.md)) — sparse, so a user who rewrites one prompt inherits future edits to the other twenty-one.
- A user who renames an Arcana keeps its `id`, and therefore keeps their history on it. Renaming is not deletion.
- The UI should never present the defaults in a way that implies authority — no "correct" reading, no locked entries. The README treats "editable semantics and custom Arcana" as *"the one that makes the openness above true rather than stated."*

## Localization

Not a v1 target, but the schema shouldn't preclude it: content records keyed by `id` with translatable `name`/`prompt`/`gloss` fields are already the right shape. Avoid embedding prompt text in components, which is the thing that actually makes translation expensive later.

## Open questions

- **Does the doubled Green slot carry one prompt or two?** Downstream of the README's open question about whether it's one goal slot or two. If two, the center placement needs a second `arcanaId` or an explicit rule for reusing one across both days.
- **Do opening, center, and closing positions want different prompt registers?** An opening frame ("here is what this Hand is for") and a closing one ("here is what to check") are doing different work, which may argue for `prompt` becoming position-aware rather than a single string.
- **How much does the slot's color inflect the prompt?** The Red-Red opening and the Red-Violet closing are named by color position in the README's date algorithm. If prompts are meant to be read through their color, that's a composition rule worth stating rather than leaving implicit.
