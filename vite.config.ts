import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Static build — there is no server at request time on any platform.
			// Public routes prerender; the app shell is client-rendered and served
			// through the SPA fallback. Forced by Capacitor and by local-first data.
			// See docs/architecture.md#rendering-strategy.
			adapter: adapter({
				// Must NOT be index.html: that path is the prerendered landing page,
				// and naming the fallback the same thing overwrites it with a blank
				// shell — silently destroying the SEO the split exists for.
				// The host serves this for any path with no prerendered file (see
				// vercel.json).
				fallback: '200.html'
			}),

			// Hash mode rather than nonce: nonces need a per-request server, which a
			// static build does not have. See docs/auth.md — with the session in
			// localStorage rather than an httpOnly cookie, this CSP is load-bearing
			// for auth, not merely hardening.
			//
			// Note: SvelteKit emits this as a <meta> tag on prerendered pages, and
			// meta-tag CSP silently ignores frame-ancestors. That directive has to be
			// a real response header — deferred to the deployment config.
			csp: {
				mode: 'hash',
				directives: {
					'default-src': ['self'],
					'script-src': ['self'],
					'style-src': ['self'],
					'img-src': ['self', 'data:'],
					'font-src': ['self'],
					// The Supabase project origin gets added here when sync lands.
					'connect-src': ['self'],
					'object-src': ['none'],
					'base-uri': ['self'],
					'form-action': ['self']
				}
			}
		})
	]
});
