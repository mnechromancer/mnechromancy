<script lang="ts">
	import { COLORS, DEFAULT_MANDATES } from '$lib/core/colors';
</script>

<svelte:head>
	<title>Today · Mnechromancy</title>
</svelte:head>

<h1>Today</h1>

<p>
	Placeholder. The dial, the radial field, and Dawn/Dusk capture land here — see
	<code>docs/backlog.md</code>.
</p>

<p>
	Rendered client-side, which is the point of this route existing: it proves the SPA fallback
	resolves. The spectrum below comes from <code>$lib/core</code>, confirming the framework-agnostic
	core is importable from the UI.
</p>

<ol>
	{#each COLORS as color, i (color)}
		<li>
			<strong>{color}</strong> — {DEFAULT_MANDATES[color].join(', ')}
			{#if i === 3}<em>(the middle — where the Green anomaly sits)</em>{/if}
		</li>
	{/each}
</ol>
