import { defineConfig } from '@playwright/test';

// End-to-end tests run against the built static output rather than the dev
// server — the SPA fallback only exists after a build, and it is exactly what
// these tests need to exercise.
//
// Requires browsers: `npx playwright install`.
export default defineConfig({
	testDir: 'e2e',
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI
	},
	use: {
		baseURL: 'http://localhost:4173'
	}
});
