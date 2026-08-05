import { defineConfig } from 'vitest/config';

// Deliberately does NOT load the SvelteKit plugin.
//
// src/lib/core is framework-agnostic by contract (docs/architecture.md): no
// Svelte, no DOM, no network. Running its tests without the plugin means the
// boundary is enforced by the toolchain rather than by discipline — if a core
// module ever needs $lib aliases, Svelte, or a browser environment to pass its
// tests, that failure is the boundary breaking, and it should be loud.
//
// UI component tests, when they exist, are a separate concern and will need
// their own config that does load the plugin.
export default defineConfig({
	test: {
		include: ['src/lib/core/**/*.test.ts'],
		environment: 'node'
	}
});
