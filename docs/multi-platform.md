# Multi-platform strategy

Status: proposed. Web is the first target; mobile shells come once the "Now" backlog (date engine, dial, Dawn/Dusk capture, goal capture) is working on web.

## Targets

Web (SvelteKit) + iOS/Android via Capacitor, sharing one codebase. Desktop is explicitly out of scope for now — revisit only if it becomes a stated goal.

## Why Capacitor over a PWA-only approach

A PWA gets most of the way there (installable, offline-capable via service worker) and is worth having regardless. But two things push toward native shells specifically:

- **Reliable local notifications.** Dawn and Dusk are time-windowed check-ins; a system that "arrives whether or not you are paying attention" needs a notification that actually fires, and PWA push on iOS is still meaningfully weaker than a native notification.
- **App-store distribution.** Two check-ins a day for a year is a habit-forming product; being discoverable and installable through the App Store/Play Store matters more here than for a typical utility.

Capacitor wraps the same built web output rather than requiring a separate native codebase, which keeps this from becoming two products.

## What has to be shared vs. platform-specific

**Shared (must not fork):**
- `src/lib/core` — date engine, divergence logic, Arcana/color tables. Pure TypeScript, zero platform dependencies, imported identically by web and native builds.
- All Svelte UI components — the dial, the radial color field, entry forms. One component tree, one design.

**Platform-specific (expected to differ):**
- **Notifications.** Web: browser push (where available) or in-app reminder only. Native: Capacitor's Local Notifications plugin scheduled against the user's Dawn/Dusk windows.
- **Session storage.** `localStorage` on web, `Preferences`/secure storage in Capacitor. Same Supabase client, different storage adapter — see [auth.md](auth.md).
- **Safe areas.** Native shells need `env(safe-area-inset-*)` handling around the dial and entry forms so notches/home indicators don't clip the interface; not a concern on web.
- **Export/import.** Backlog item "the log is the point and should never be trapped." Web: file download. Native: Capacitor's Filesystem + Share plugins to hand the export to the OS share sheet.

## Build pipeline

1. `npm run build` produces the static output via `adapter-static` — prerendered public routes, client-rendered app shell (see [architecture.md](architecture.md#rendering-strategy)). The native shells consume the same build the web deployment does; there is no separate mobile build target.
2. `npx cap sync` copies that build into the iOS and Android native projects and updates native dependencies.
3. Native projects (`capacitor/ios`, `capacitor/android`) are committed as thin wrappers — config and plugin bindings, no app logic — so a fresh `cap sync` is close to reproducible from the web build alone.

CI for native builds (device testing, store submission) is out of scope until the web app is functional; not designing it in detail yet.

## Non-goals for now

- Desktop (Tauri or Electron) — no stated need yet, and adding it prematurely would mean maintaining a third shell before the first two are proven.
- Offline-first isn't platform-specific — it's covered by the local-first IndexedDB design in [data-model.md](data-model.md), which both web and native share.
