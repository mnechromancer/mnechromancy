// Default posture: prerender at build time with SSR on, so public routes are
// real HTML — indexable, with working social previews.
//
// The app shell opts out of both in src/routes/(app)/+layout.ts. See
// docs/architecture.md#rendering-strategy.
export const prerender = true;
export const ssr = true;
