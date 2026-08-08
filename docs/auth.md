# Auth

Status: proposed, not yet implemented.

## Provider: Supabase Auth

Chosen over a self-rolled stack or an auth-only provider (Clerk) because it pairs directly with the Postgres store the [data model](data-model.md) already needs — one provider, one set of credentials, row-level security instead of a separate authorization layer.

Supported methods, in order of priority:

1. **Email/password** — the default, works identically on web and inside the Capacitor shells.
2. **Google OAuth** — low-friction sign-in matching the "under three minutes, no friction" interface principle.
3. **Apple Sign-In** — required by App Store guidelines once any other third-party social login is offered, so build it alongside Google rather than after.

## Local-first before signup

The backlog's first milestone is "Dawn/Dusk capture with local persistence" — no account required. Auth should not gate the core loop:

- A user can set their birthday and start doing Dawn/Dusk check-ins with zero sign-up, writing straight to IndexedDB (see [data-model.md](data-model.md)).
- Signing up later **claims** the existing local data: on first successful login, the client pushes everything in the local `sync_queue` up to Supabase, tagged with the new `user_id`.
- This means the account system's job is sync and cross-device continuity, not gatekeeping the product's value. Someone who never signs up still gets the full single-device experience.

## Session handling

The app ships as a static build with a client-rendered app shell (see [architecture.md](architecture.md#rendering-strategy)). There is **no server at request time on any platform**, so there is no `hooks.server.ts` and the session cannot live in an httpOnly cookie. Auth is client-side everywhere:

- **Web:** the Supabase JS client's default storage — `localStorage`, keyed to the project.
- **Capacitor (iOS/Android):** the same client, with its storage adapter pointed at Capacitor's `Preferences`/secure-storage plugin.

Same Supabase project, same client library, same `users` table and RLS policies on both. Only the storage adapter differs, which makes web and native genuinely one auth path rather than two that happen to agree.

### The tradeoff, stated plainly

An httpOnly cookie is unreadable by JavaScript; a `localStorage` token is not. **Any XSS on this origin is a full session compromise.** That is a real downgrade from the cookie-based approach, and it's accepted because the static build leaves no alternative — not because it's free.

What makes it defensible is that the XSS surface here is unusually small, and mostly for reasons the project already committed to:

| Mitigation | Source |
|---|---|
| No third-party scripts at all — no analytics, no session recording, no ad SDKs | [privacy.md](privacy.md) commitment 3. The single largest XSS vector in most web apps simply isn't present. |
| Strict CSP — no `unsafe-inline`, no `unsafe-eval`, self-only script sources | To be enforced at the edge and in the native shell config. |
| Short-lived access tokens with refresh rotation | Supabase default; keeps the blast radius of a stolen token to minutes. |
| No user-supplied HTML rendered anywhere | Entry text is long-form and personal but always rendered as text, never as markup. Worth holding as a rule — a future "rich text in Dusk entries" feature would break it. |

The privacy stance turns out to be load-bearing for security, not just for user trust. Anything that would reintroduce a third-party script to the app origin needs to be weighed as an auth decision too.

### Sync and RLS

The client talks to Supabase directly with the user's own JWT; row-level security does the authorization (see below). There is no application server in the path, so there is no server-side trust boundary to get wrong — but equally, **every security guarantee rests on the RLS policies being correct**, since a compromised or modified client can issue any query the token permits.

## Row-level security

Every table in the data model carries `user_id`. Postgres RLS policies restrict all reads/writes to `auth.uid() = user_id`, so authorization lives in the database rather than being re-implemented per API route. No table should be reachable without an RLS policy — the migration for a new table and its policy should land in the same commit.

## Open decisions

- Whether "claim local data on signup" needs conflict handling beyond last-write-wins (e.g. a user who used the app locally on two different devices before ever signing up, then signs into both).
- Password reset / magic-link flows — Supabase supports both out of the box; not yet decided which is default.
