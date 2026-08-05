# Date engine

Status: **implemented** at `src/lib/core/date-engine.ts`, with the calendar-date layer at `src/lib/core/civil-date.ts`. Pure functions, no I/O, no Svelte, per [architecture.md](architecture.md). Covered by 46 unit tests.

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
interface CivilDate {          // a calendar date, never an instant
  year: number;
  month: number;                // 1-12, not zero-based
  day: number;                   // 1-31
}

interface Position {
  yearCycle: number;       // birthday-to-birthday cycle number, 1-indexed
  dayOfYear: number;        // 1-365 (366 only on a leap cycle, and only when opted in)
  isArtificer: boolean;      // true only on day 365 (the White day, outside all Hands)
  hand: number | null;        // 1-7, null on the Artificer day
  handDay: number | null;      // 1-52 within the Hand, null on the Artificer day
  week: number | null;          // 1-7; null on the Artificer and on Hand-days 1 and 52
  weekDay: number | null;        // 1-7, never 8 — see the Green anomaly below
  dayColor: AnyColor;              // this day's own color
  weekColor: Color | null;          // the week's color (mediating scope)
  handColor: Color | null;           // the Hand's color (superordinate scope)
  arcana: ArcanaSlot | null;          // Hand-day 1, Hand-day 52, the Green slot, the Artificer
  isGreenAnomaly: boolean;             // true on Hand-days 26 and 27 (the doubled Green slot)
}

interface ArcanaSlot {
  hand: number | null;      // null for the Artificer, which sits outside the Hands
  position: 'open' | 'center' | 'close' | 'artificer';
}
```

`ArcanaSlot` carries **where** the Arcana sits, not **which** of the twenty-two it is. Resolving a slot to an `arcanaId` is a lookup against the placement table in `arcana.ts` (see [arcana-content.md](arcana-content.md)), which is blocked on content authoring. Keeping the mapping out of the engine is what lets a user reorder their Arcana without touching date logic.

`weekDay` never exceeds 7. The Green week runs eight *calendar days* across seven *color positions*, so position 4 simply occurs twice — an earlier draft of this spec said `1-8`, which misread the anomaly.

## Functions

```ts
function dateToPosition(birthday: CivilDate, target: CivilDate, options?: DateEngineOptions): Position;
function positionToDate(birthday: CivilDate, position: { yearCycle; dayOfYear }, options?): CivilDate;

// the single instant -> calendar date boundary, in civil-date.ts
function civilDateInZone(instant: Date, timeZone: string): CivilDate;
```

**Deviation from the original spec, deliberate.** This doc first specified `dateToPosition(birthday: Date, target: Date, timezone: string)`. Taking `Date` objects into the engine means the engine can subtract instants, and subtracting instants answers a question about elapsed milliseconds rather than about calendar days — the two disagree twice a year, on 23- and 25-hour days.

Instead the conversion happens once, at the edge, in `civilDateInZone`. The engine only ever sees `{year, month, day}`, which makes the DST class of bug structurally impossible rather than merely tested for. It also makes `positionToDate` an exact inverse: round-tripping through a `Date` would reintroduce the zone question on the way back.

`dateToPosition` is the core of the app: called once per page load to know what to render, and once per entry save to stamp the entry with its `dayOfYear`.

### Cycle anchoring

Cycles anchor to the **anniversary**, not to a rolling 365-day count. The README says the cycle closes the day before your birthday; a fixed 365-day count drifts one day off the birthday after every leap year, and the drift compounds.

## Derivation logic (informal)

1. Find the anniversary of `birthday` on or before `target`; that opens the cycle. `dayOfYear` is the day count from it, plus one; `yearCycle` is the anniversary year minus the birth year, plus one.
2. If `dayOfYear == 365`, it's the Artificer: `isArtificer = true`, `hand`/`handDay`/`week`/`weekDay` all null, `dayColor = 'White'`.
3. Otherwise, `hand = ceil(dayOfYear / 52)`, `handDay = dayOfYear - 52*(hand-1)`.
4. Within the Hand: `handDay == 1` -> Red-Red Arcana (open). `handDay == 52` -> Red-Violet Arcana (close). These bracket days sit outside the seven weeks, so `week`, `weekDay`, and `weekColor` are all null on them.
5. Otherwise `handDay` (2–51, fifty days) falls in one of seven ROYGBIV weeks. Week 4 is eight days, so the split walks a boundary table rather than dividing — with one 8-day week among six 7-day ones, no single modulo lands correctly on both sides of it.

   | Week | 1 | 2 | 3 | **4** | 5 | 6 | 7 |
   |---|---|---|---|---|---|---|---|
   | Hand-days | 2–8 | 9–15 | 16–22 | **23–30** | 31–37 | 38–44 | 45–51 |

6. Week 4 (Green): Hand-days 26 and 27 both map to `weekDay` 4, `isGreenAnomaly = true` on both, and the slot carries the Hand's center Arcana. Everything after shifts back by one so the week still closes on Violet at Hand-day 30.
7. `arcana` is non-null exactly on Hand-day 1, Hand-day 52, the two Green-anomaly days, and the Artificer.

`positionToDate` is implemented as an actual inverse, not a search — the same day-count arithmetic run backward.

## Test matrix

All implemented and passing. The irregularities cluster at Hand boundaries and the Green anomaly, so that is where the cases concentrate:

- Hand-day 1 of Hand 1 == the birthday itself.
- Hand-day 1 and Hand-day 52 of every Hand 1-7 -> correct Arcana with `position: 'open'`/`'close'`, and no week scope.
- Hand-days 26 and 27 of every Hand -> both `isGreenAnomaly: true`, `position: 'center'`.
- The full Green week (Hand-days 23–30) -> `weekDay` runs `[1,2,3,4,4,5,6,7]` and colors run Red…Violet across eight days.
- Week boundaries either side of the anomaly (Hand-days 22/23 and 30/31, and 25/28) -> correct non-anomalous week/weekDay.
- Day-of-year 365 -> Artificer, all Hand/week fields null; and it is the *only* day of the cycle outside a Hand.
- Day-of-year 1 of the next cycle -> `yearCycle` increments, back to Hand 1 Hand-day 1.
- Round-trip `positionToDate` -> `dateToPosition` across all 365 days of a cycle.
- **Color distribution per Hand** — Red 8, Orange 7, Yellow 7, Green 8, Teal 7, Indikon 7, Violet 8, summing to 52. Derived from the README's structure rather than from the implementation, so it catches a coherent-but-wrong reading of the anomaly.
- DST: 23-hour and 25-hour days each resolve to a single calendar day, and consecutive Dawn check-ins across a transition are exactly one day apart.
- Leap-cycle days 1–365 behave normally; day 366 throws unless explicitly opted into.

Anchor dates were cross-checked against GNU `date` rather than only against the implementation's own arithmetic.

## Open questions

- **Leap years — the 366th day.** Undecided. `dateToPosition` throws on it by default rather than returning a plausible wrong position. The README's floated treatment is available as an opt-in (`extraDay: 'double-artificer'`) so it can be tried without being settled. Days 1–365 of a leap cycle are unaffected, so this breaks exactly one day per affected user rather than the whole cycle.
- **February 29 birthdays** — *surfaced during implementation, not previously tracked.* Such a birthday has no anniversary in a common year, and which day stands in (Feb 28 or Mar 1) is a semantic decision the project has not made. Defaults to throwing; `leapDayBirthday: 'feb-28' | 'mar-01'` chooses. Unlike the 366th-day question this breaks the app *entirely* for affected users (~1 in 1461), so it wants deciding sooner.
- **Whether the doubled Green Arcana is one goal slot or two** — affects whether `goals` rows (see [data-model.md](data-model.md)) for the Green center Arcana key on `handDay` or on the Arcana slot as a whole. The engine reports 14 center-Arcana *days* across 7 center-Arcana *slots*, which keeps both readings available.
- **What the "Red-Red" and "Red-Violet" names denote on the bracket days.** The engine gives them a `dayColor` (Red and Violet) and no week scope, since the README places the seven weeks at Hand-days 2–51. If the paired naming is meant to imply a week-level color on those days too, that is a structure the rest of the spec does not otherwise describe.
