# Architecture

Status: proposed, not yet implemented. See [Status](../README.md#status) for what actually exists.

## Stack

| Layer | Choice | Why |
|---|---|---|
| App framework | SvelteKit, TypeScript | Small runtime, fast enough for two daily check-ins to feel instant; component model suits the dial-heavy UI without a heavy client framework tax. |
| Visuals | Hand-written SVG components (no chart/UI kit) | The interface's own principles rule out generic components — dials, hairlines, and the radial color field are bespoke enough that a UI kit would fight the design more than help it. |
| Styling | Plain CSS (custom properties for the active triad), no utility framework | The color field *is* the interface; hard-coding a utility framework's palette assumptions works against that. |
| Backend | Supabase (Postgres + Auth) | One provider covers auth and the relational store the data model needs, with row-level security instead of a hand-rolled API layer. See [auth.md](auth.md). |
| Local storage | IndexedDB (via a thin wrapper, e.g. `idb`) | Dawn/Dusk capture has to work with no connectivity at 6am. Local-first with a sync queue, not a Supabase-only client. See [data-model.md](data-model.md). |
| Mobile shell | Capacitor | Wraps the built web app for iOS/Android with real push notifications (needed for Dawn/Dusk reminders) and app-store distribution. See [multi-platform.md](multi-platform.md). |
| Rendering | `adapter-static` — prerendered public routes, client-rendered app shell | Forced by Capacitor and by local-first data. See [Rendering strategy](#rendering-strategy). |
| Deployment (web) | Vercel | Serves the static build; preview deployments per branch. |

## Repository layout

```
src/
  lib/
    core/           # framework-agnostic domain logic — no Svelte, no DOM
      date-engine.ts     # birthday -> Hand/Week/Day/Arcana position (see date-engine.md)
      divergence.ts       # assigned-vs-lived color comparison
      arcana.ts            # the 22 Arcana table + lookup by position
      colors.ts             # default seven-color mandate table (README's spectrum)
    data/            # persistence — IndexedDB local store + Supabase sync
      local.ts
      sync.ts
      schema.ts       # mirrors data-model.md
    components/      # Svelte UI: dial, radial field, entry forms
    stores/          # Svelte stores wiring core + data into the UI
  routes/            # SvelteKit pages (dial/today, dawn, dusk, arcana, settings)
static/
supabase/
  migrations/        # SQL migrations for the Postgres schema
capacitor/           # native project shells (added when mobile work starts)
docs/
```

`src/lib/core` is the load-bearing boundary: it has no dependency on Svelte, Supabase, or the DOM. It is pure, synchronous, and unit-testable, and it is the only part of the codebase that a future non-Capacitor shell (or a server-side job, e.g. computing tonight's Dusk reminder) would need to import.

## Data flow

1. Domain logic in `lib/core` computes the day's position (Hand/Week/Day/Arcana) from the user's stored birthday — pure function, no I/O.
2. Dawn/Dusk entries write to IndexedDB first, unconditionally. The UI never blocks on network.
3. A sync worker pushes queued local writes to Supabase when online, and pulls remote changes (e.g. from another device) into the local store.
4. Divergence analytics and the Arcana's "prior-year entries" view read from Supabase once synced, since they need cross-device/cross-year history that a single device's local store won't have after a reinstall.

## Rendering strategy

**Decided: `adapter-static`, hybrid.** Public routes prerender at build time; the app shell is client-rendered (`export const ssr = false`).

Three things force this, none of them about Svelte — SvelteKit's SSR is perfectly good and this is not a vote against it:

1. **Capacitor has no server.** Native shells serve static files off the device. The app shell must render client-side regardless of what the web deployment does, so building it SSR-first would mean maintaining two rendering paths for one UI.
2. **SSR has nothing to render.** State lives in IndexedDB. The server does not have it — and with account-optional signup (see [auth.md](auth.md)), for some users it never will. SSR would emit an empty shell and hydrate from local storage anyway.
3. **E2EE would make it impossible, not just pointless.** If field-level encryption ships (see [privacy.md](privacy.md)), the server cannot read entry text by construction.

What stays prerendered: any marketing/landing route, so it's indexable and has real social previews. SvelteKit routing, layouts, and `load` functions all still work — only server rendering is given up.

One consequence, handled in [auth.md](auth.md): with no server at request time there is no `hooks.server.ts`, so the Supabase session cannot live in an httpOnly cookie. Web and native both use client-side session storage.

## Open decisions

- Testing framework — likely Vitest for `lib/core` (pure functions, cheap to test exhaustively) and Playwright for the check-in flow, not yet set up.
