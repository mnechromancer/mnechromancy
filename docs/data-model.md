# Data model

Status: proposed schema, not yet migrated anywhere.

## Principles

- **Local-first.** Every write lands in IndexedDB before it touches the network. Supabase is the sync target and the multi-device/multi-year archive, not the primary write path.
- **Entries are append-only.** The README is explicit that Dusk never revises Dawn's entry. In storage terms: a Dawn entry and its Dusk entry are separate rows linked by id, not one mutable row. Same-day edits before the *next* scope closes are fine; retroactive rewrites of a closed day are not a feature.
- **Hand/Week/Day positions are computed, not stored.** The date engine (see [date-engine.md](date-engine.md)) derives a day's position from `birthday` alone. Nothing about "today is Hand 3, Week 5, Red" needs to live in a table — only the birthday does. Storing it would create a second source of truth that drifts.

## Entities

### `users`
Managed by Supabase Auth (`auth.users`). Extended with a profile row:

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK, FK → `auth.users.id` | |
| `birthday` | date | Calendar anchor. No time component — the date engine works in calendar days, not instants. |
| `timezone` | text (IANA name) | Needed to resolve "what calendar day is it right now" consistently across devices. |
| `created_at` | timestamptz | |

### `calendar_overrides`
One row per user, optional. Backs the "editable color semantics and custom Arcana" backlog item — not needed for the v1 build, but the schema should not preclude it.

| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid, PK, FK → `users.id` | |
| `color_semantics` | jsonb | Overrides for the default seven-mandate table in `lib/core/colors.ts`, including exact hex values. Null = use defaults. |
| `audio_semantics` | jsonb | Parallel overrides for pitch, register, timbre, and tuning system. See [audio.md](audio.md). Null = use defaults. |
| `arcana_overrides` | jsonb | Sparse overrides for the 22 Arcana, keyed by stable `id`. See [arcana-content.md](arcana-content.md). Null = use defaults. |

Note: [accessibility.md](accessibility.md) argues `color_semantics` editing has to ship earlier than the README's "Later" tier places it — for a colorblind user, palette editing is what makes the app usable at all, not a customization nicety.

### `goals`
One row per scope-open (Hand, Week, or Day).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `user_id` | uuid, FK | |
| `scope` | enum(`hand`, `week`, `day`) | |
| `hand_number` | int (1–7) | Which Hand this goal belongs to. |
| `week_number` | int (1–7), nullable | Set for `week` and `day` scope goals. |
| `day_index` | int (1–366), nullable | Set for `day` scope goals only; day-of-year for leap-year headroom (see date-engine.md's open leap-year question). |
| `text` | text | |
| `created_at` | timestamptz | |

### `dawn_entries`
One per calendar day.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `user_id` | uuid, FK | |
| `day_index` | int | Day-of-year, ties the entry to a Hand/Week/Day position via the date engine. |
| `friction_named` | text | "Name today's friction before it fires." |
| `counter_move` | text | Pre-decided response to the likely impulse. |
| `day_goal` | text | |
| `created_at` | timestamptz | |

### `dusk_entries`
One per calendar day, 0-or-1 per `dawn_entries` row (a Dusk without a Dawn is allowed — the README doesn't make Dawn mandatory for Dusk to be meaningful — but it references the same `day_index`).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `user_id` | uuid, FK | |
| `day_index` | int | |
| `dawn_entry_id` | uuid, FK, nullable | |
| `held` | text | What held without willed effort. |
| `not_held` | text | What didn't. |
| `klesha` | text, nullable | Which klesha was underneath, if named. |
| `color_actual` | enum(seven colors) | The highest-signal field: what color the day actually ran as. |
| `created_at` | timestamptz | |

### `arcana_notes`
Free text tied to a specific Arcana appearance, enabling the "prior-year entries side by side" view.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `user_id` | uuid, FK | |
| `arcana_id` | int (0–21) | Zero-indexed, matching the tarot Major Arcana convention. See [arcana-content.md](arcana-content.md). |
| `hand_number` | int | |
| `position` | enum(`open`, `close`, `center`) | |
| `year_cycle` | int | Which birthday-to-birthday cycle (year 1, year 2, …) this note belongs to — needed since Arcana recur every cycle at the same position. |
| `text` | text | |
| `created_at` | timestamptz | |

## Derived, not stored

**Divergence** (assigned vs. lived color, aggregated per Hand) is computed from `dawn_entries`/`dusk_entries` joined against the date engine's assigned color for each `day_index`. It's a query/view, not a table — recomputing it is cheap and storing it risks staleness when historical entries are corrected.

## Sync strategy

- Local IndexedDB mirrors the four entry-producing tables (`goals`, `dawn_entries`, `dusk_entries`, `arcana_notes`) plus a `sync_queue` of pending writes.
- Each row carries a client-generated UUID (not a server-assigned serial), so writes made offline don't need a round-trip to get an id before the UI can reference them.
- Conflict policy: last-write-wins by `created_at`, scoped per row. Because entries are append-only in practice (see Principles), real conflicts should be rare — the common case is "same row synced from two devices that were both offline," not concurrent edits.
- Row-level security in Postgres scopes every table to `auth.uid() = user_id`; see [auth.md](auth.md).
