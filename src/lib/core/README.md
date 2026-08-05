# `lib/core`

The framework-agnostic boundary. See [docs/architecture.md](../../../docs/architecture.md).

**Contract:** no Svelte, no DOM, no network, no persistence. Pure, synchronous, deterministic TypeScript.

Everything here is testable without a browser and importable from anywhere — the web app, the Capacitor shells, a future server-side job. It is the only part of the codebase a non-Capacitor shell would need.

## How the boundary is enforced

`vitest.config.ts` deliberately does not load the SvelteKit plugin. If a module in here ever needs `$lib` aliases, a Svelte import, or a browser environment to pass its tests, that test fails — and the failure *is* the boundary breaking. Enforcement lives in the toolchain, not in discipline.

Import direction is one-way: UI imports core, never the reverse.

## Contents

| Module | Status |
|---|---|
| `colors.ts` | Implemented — the seven-position spectrum and its default mandates. |
| `civil-date.ts` | Implemented — calendar dates and the single instant→date boundary. |
| `date-engine.ts` | Implemented — birthday to Hand/week/day/Arcana slot. Spec: [docs/date-engine.md](../../../docs/date-engine.md). |
| `arcana.ts` | Not yet written. Blocked on content authoring — spec: [docs/arcana-content.md](../../../docs/arcana-content.md). |
| `divergence.ts` | Not yet written. Assigned vs. lived color. |
| `audio.ts` | Not yet written. Color-to-pitch mapping — spec: [docs/audio.md](../../../docs/audio.md). Playback (the Web Audio graph) stays outside core; only the mapping is pure. |

## Defaults, not canon

The mandates in `colors.ts` are shipped defaults, and the README is explicit that they are one person's rather than correct. User overrides live in `calendar_overrides` (see [docs/data-model.md](../../../docs/data-model.md)). Nothing in core should assume the defaults are in force — take the active semantics as an argument rather than reaching for the constant.
