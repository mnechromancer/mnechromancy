<script lang="ts">
	let { children } = $props();
</script>

<main class="app-shell">
	{@render children()}
</main>

<style>
	.app-shell {
		/* Safe-area padding for the native shells; resolves to 0 on the web.
		   See docs/multi-platform.md. */
		padding: max(1rem, env(safe-area-inset-top)) max(1rem, env(safe-area-inset-right))
			max(1rem, env(safe-area-inset-bottom)) max(1rem, env(safe-area-inset-left));
		min-height: 100dvh;
	}
</style>
