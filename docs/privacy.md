# Privacy

Status: proposed. A stance, meant to constrain implementation — not a legal privacy policy. The user-facing policy comes later and should be derivable from this without contradiction.

## What this application actually holds

Worth stating plainly, because it determines everything else. A complete Mnechromancy log contains:

- **Date of birth** — a hard identifier, and structurally unavoidable here since it's the calendar's anchor.
- **Daily records of psychological state** — named frictions, which klesha was underneath, what held and what didn't, twice a day, for years.
- **Goals and their failures**, at three scopes.
- **A longitudinal behavioral time series** — Dawn/Dusk timestamps alone reveal sleep patterns, and gaps reveal crises.

This is closer to a therapy journal than to a habit tracker. Aggregated over a year it is more revealing about a person than most of what they have written anywhere else. Handling it as ordinary app data would be a category error.

The system is also explicitly designed to be used honestly — the README calls the divergence between assigned and lived color *"the highest-signal field in the system."* Honest entry only happens if the user is confident the log is private. **Privacy is a functional requirement, not a compliance obligation.** A user who softens a Dusk entry because they're unsure who can read it has produced worthless data, and the application has failed at its stated purpose.

## Commitments

1. **The account is optional.** Full single-device functionality with no sign-up, per [auth.md](auth.md). An account buys sync and cross-device continuity, nothing else. Never gate the core loop behind an identity.
2. **No advertising, ever. No sale or sharing of user data, ever.** This isn't a business-model decision to revisit later; it's incompatible with the product working at all.
3. **No third-party analytics on entry content.** No session recording, no heatmaps, no behavioral SDKs. If product analytics are needed, they are self-hosted or aggregate-only, and entry text, goals, and color reads are never in scope. Crash reporting must scrub user content.
4. **No model training on user content.** No entry is used to train or fine-tune anything, by us or by any provider, without explicit opt-in that defaults to off.
5. **Export is unconditional and complete.** The README: *"The log is the point and should never be trapped."* Full export in an open, self-describing format (JSON, plus a readable rendering), available without an account, without a support request, and without a paywall — including on the free tier if there ever is a paid one.
6. **Deletion is real deletion.** Account deletion removes rows, not just flags them. Bounded, stated backup-retention window after which it's gone from backups too. Local deletion clears IndexedDB. Deletion is available in-app, not by email.
7. **Local-first by default.** Data lives on the device first (see [data-model.md](data-model.md)). The network is a sync target, not the source of truth. A user who never signs in never transmits an entry.
8. **Minimal collection.** Birthday and timezone because the date engine requires them; email only if an account is created. No contacts, no location, no device fingerprinting, no ad identifiers.

## What the server can see, stated honestly

With Supabase Postgres and row-level security (see [auth.md](auth.md)), entries are encrypted in transit and at rest at the disk level, and RLS prevents one user reading another's rows.

**It does not prevent us, or Supabase, or anyone with database access, from reading entry text.** A subpoena, a breach, or a misconfigured policy exposes plaintext.

Say this in the user-facing policy, in those terms. A privacy stance that overstates its guarantees is worse than none, because it induces exactly the candor it can't protect.

## End-to-end encryption

The honest answer is that this data warrants E2EE and that E2EE has real costs, so the decision needs making deliberately rather than by default.

**For:** the threat model — years of psychological self-reporting tied to a legal identifier — is squarely the case E2EE exists for. It also converts commitment 3 from a promise into a mathematical fact.

**Against:**
- Server-side divergence analytics become impossible. Everything moves client-side, which is workable — the [data model](data-model.md) already treats divergence as derived — but it constrains any future server-computed feature.
- Search across years must be client-side, requiring a full local corpus.
- Key management across web and two native shells is genuinely hard, and it's the most common place E2EE implementations break.
- **Password reset becomes data loss.** A forgotten password destroys years of irreplaceable log. Mitigable with recovery codes, but the failure mode is severe and users don't read warnings.

**Leaning:** encrypt the free-text fields (`friction_named`, `counter_move`, `day_goal`, `held`, `not_held`, goal text, Arcana notes) while leaving structural fields (`day_index`, `color_actual`, `klesha` enum, timestamps) in plaintext. Structural fields drive every analytic the backlog names; free text drives none of them and carries nearly all the sensitivity. This gets most of the protection at a fraction of the cost.

Decide before launch. Retrofitting encryption onto an existing corpus is far worse than building with it.

## Notifications

Dawn/Dusk reminders (see [multi-platform.md](multi-platform.md)) surface on lock screens, in public, on shared devices.

**Notification bodies must never contain entry content, goal text, or Arcana prompts.** "Dusk" is sufficient. The user knows what it means; the person behind them in line does not. Deep-link into the app for anything specific.

## Third parties

Every subprocessor is a party to the data. Keep the list short, and enumerate it in the user-facing policy:

- **Supabase** — database and auth. Holds everything not client-side encrypted.
- **Vercel** — web hosting. Serves the app; should not see entry content, since sync goes directly from client to Supabase.
- **Apple / Google** — app distribution and push delivery. Push payloads carry no content, per above.

Adding a subprocessor is a privacy-stance change, not an implementation detail. Anything that would transmit entry content to a new party needs an explicit decision and user notice.

## Screenshots and shoulder-surfing

Worth a design pass, given a check-in happens at 6am and 11pm on a phone that might not be alone: an optional privacy screen (biometric lock), obscuring entry text in the app switcher, and a "hide previous entries" mode for reviewing on a shared screen. Not v1, but cheaper to design for early.

## Open questions

- Field-level E2EE: ship at v1 or accept the retrofit cost? Above.
- Whether local-only users should be nudged toward backup at all. Losing a year to a dropped phone is a catastrophic outcome the local-first stance makes *more* likely, and the honest fix — sync — is the thing that weakens privacy. A local encrypted export reminder may be the resolution.
- Whether `klesha` stays a closed enum (analyzable, less sensitive) or allows free text (more expressive, more sensitive). Affects what can stay plaintext under the leaning above.
- Minors. A birthday-anchored app will attract users under 13, which triggers COPPA and equivalents. Needs a decision before any public launch.
