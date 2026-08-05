# Date engine

Status: spec only. The README states the date engine is "verified" as a concept; this doc formalizes it into an implementable interface. Lives at `src/lib/core/date-engine.ts` per [architecture.md](architecture.md) — pure functions, no I/O, no Svelte.

## Source algorithm

From the README, restated precisely:

```
Hand n opens at birthday + 52(n-1),  n = 1..7
Hand-day 1          Red-Red Arcana        (opening)
Hand-days 2-51       seven ROYGBIV weeks
                     week 4 spans 8 calendar days;
                     its Green slot is the Green Arcana (Hand-days 26 and 27)
Hand-day 52          Red-Violet Arcana     (closing)
Year-day 365          White - Artificer     (outside all Hands)
```

7 Hands x 52 days = 364, + the Artificer = 365. The cycle closes the day before the next birthday.

## Types

```ts
type Color = 'Red' | 'Orange' | 'Yellow' | 'Green' | 'Teal' | 'Indikon' | 'Violet' | 'White';

interface Position {
  yearCycle: number;       // birthday-to-birthday cycle number, 1-indexed
  dayOfYear: number;        // 1-365 (366 on a leap cycle — see Open questions)
  isArtificer: boolean;      // true only on day 365 (the White day, outside all Hands)
  hand: number | null;        // 1-7, null on the Artificer day
  handDay: number | null;      // 1-52 within the Hand, null on the Artificer day
  week: number | null;          // 1-7 within the Hand
  weekDay: number | null;        // 1-7 (or 1-8 in the Green week — see below)
  dayColor: Color;                 // this day's own color
  weekColor: Color | null;          // the week's color (mediating scope)
  handColor: Color | null;           // the Hand's color (superordinate scope)
  arcana: ArcanaSlot | null;          // set on Hand-day 1, Hand-day 52, and the Green week's slot
  isGreenAnomaly: boolean;             // true on Hand-days 26 and 27 (the doubled Green slot)
}

interface ArcanaSlot {
  arcanaId: number;        // 0-21 (zero-indexed — 0 is a valid id, never truthiness-check it)
  position: 'open' | 'close' | 'center';
}
```

## Functions

```ts
function dateToPosition(birthday: Date, target: Date, timezone: string): Position;
function positionToDate(birthday: Date, position: { yearCycle: number; dayOfYear: number }, timezone: string): Date;
```

Both operate on **calendar dates**, not instants — `birthday` and `target` are compared as dates in `timezone`, with no time-of-day component. This matters because a Dawn check-in at 6am and a Dusk check-in at 11pm must resolve to the same `dayOfYear` even though real time has passed and the device may have crossed a DST boundary in between.

`dateToPosition` is the core of the app: it's called once per page load to know what to render, and once per entry save to stamp the entry with its `dayOfYear`.

## Derivation logic (informal)

1. `daysSinceBirthday = target - birthday` (in `timezone`-local calendar days), mod 365 (or 366 — see below) to get `dayOfYear`, and `yearCycle` from the integer division.
2. If `dayOfYear == 365`, it's the Artificer: `isArtificer = true`, `hand`/`handDay`/`week`/`weekDay` all null, `dayColor = 'White'`.
3. Otherwise, `hand = ceil(dayOfYear / 52)`, `handDay = dayOfYear - 52*(hand-1)`.
4. Within the Hand: `handDay == 1` -> Red-Red Arcana (open). `handDay == 52` -> Red-Violet Arcana (close). Otherwise, `handDay` falls in one of seven weeks running ROYGBIV — except week 4, which is 8 calendar days (see below), so the week/weekDay split isn't uniform division and has to walk the week boundaries rather than a single modulo.
5. Week 4 (Green): `handDay` 26 and 27 both map to `weekDay` = the Green slot, `isGreenAnomaly = true` on both, and that slot carries the Hand's center Arcana instead of a plain color prompt.
6. `arcana` is non-null exactly on Hand-day 1, Hand-day 52, and the two Green-anomaly days.

`positionToDate` is the inverse and should be implemented as an actual inverse (not a search) — same day-count arithmetic run backward.

## Test matrix

These are the cases that matter, given the irregularities are concentrated at Hand boundaries and the Green anomaly:

- Hand-day 1 of Hand 1 == the birthday itself.
- Hand-day 1 and Hand-day 52 of every Hand 1-7 -> correct Arcana with `position: 'open'`/`'close'`.
- Hand-days 26 and 27 of every Hand -> both `isGreenAnomaly: true`, same `arcanaId`, `position: 'center'`.
- Week boundaries immediately before/after the Green anomaly (handDay 25 and 28) -> correct non-anomalous week/weekDay.
- Day-of-year 365 -> Artificer, all Hand/week fields null.
- Day-of-year 1 of the next cycle (the day *after* the Artificer) -> `yearCycle` increments, back to Hand 1 Hand-day 1.
- `positionToDate(dateToPosition(birthday, d, tz), tz) == d` for a spread of dates across all seven Hands (round-trip property test).
- A date exactly on a DST transition in `timezone`, to confirm calendar-day math isn't silently off by one from instant-based subtraction.

## Open questions (unresolved — see README backlog)

- **Leap years.** 366 days breaks the 365-slot structure. The README floats doubling the Artificer as the leap-year treatment, following the Green-week precedent, but this is explicitly undecided. Until resolved, `dateToPosition` should treat this as a real edge case to handle deliberately (e.g. an explicit `leapTreatment` parameter defaulting to "not yet supported" with a thrown error) rather than silently producing a wrong position for users whose cycle crosses Feb 29.
- **Whether the doubled Green Arcana is one goal slot or two** — affects whether `goals` rows (see [data-model.md](data-model.md)) for the Green center Arcana key on `handDay` or on the Arcana slot as a whole.
