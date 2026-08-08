import { expect, test } from '@playwright/test';

// Guards the hybrid rendering split from docs/architecture.md#rendering-strategy.
// The two modes are easy to break silently — a stray `prerender = true` on an
// app route, or losing the SPA fallback — and neither shows up in a unit test.

test('the landing route is prerendered as real HTML', async ({ page }) => {
	const response = await page.goto('/');
	const html = await response!.text();

	// Present in the served HTML before any JavaScript runs — this is what
	// crawlers and link previews see.
	expect(html).toContain('Mnechromancy');
	expect(html).toContain('anchored to your birthday');
});

test('the app shell renders client-side through the SPA fallback', async ({ page }) => {
	await page.goto('/today');
	await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible();

	// Computed by $lib/core at runtime, so this also confirms the
	// framework-agnostic core is reachable from the UI layer.
	await expect(page.getByText(/cycle \d+, day \d+ of 365/)).toBeVisible();
});

test('a deep link into the app shell resolves on a cold load', async ({ page }) => {
	// The failure this catches: static hosting 404ing on any route that was not
	// prerendered. Client-side navigation would hide it; a direct hit does not.
	const response = await page.goto('/today');
	expect(response!.status()).toBe(200);
});
