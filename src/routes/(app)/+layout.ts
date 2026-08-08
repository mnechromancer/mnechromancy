// The app shell is client-rendered only.
//
// Not a performance choice — a structural one. State lives in IndexedDB, so the
// server has nothing to render; with account-optional signup it may never have
// had the data at all, and under field-level encryption it could not read it.
// The native shells have no server in the first place.
//
// See docs/architecture.md#rendering-strategy.
export const prerender = false;
export const ssr = false;
