<script lang="ts">
	import { addDays, civilDateInZone, formatCivil, type CivilDate } from '$lib/core/civil-date';
	import { dateToPosition } from '$lib/core/date-engine';
	import Dial from '$lib/components/Dial.svelte';
	import Readout from '$lib/components/Readout.svelte';
	import RadialField from '$lib/components/RadialField.svelte';
	import DawnForm from '$lib/components/DawnForm.svelte';
	import DuskForm from '$lib/components/DuskForm.svelte';

	// Placeholder until the birthday is captured and persisted (docs/data-model.md).
	const birthday = { year: 1990, month: 9, day: 20 };
	const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	let current = $state<CivilDate>(civilDateInZone(new Date(), timeZone));
	const position = $derived(dateToPosition(birthday, current));

	function step(deltaDays: number) {
		current = addDays(current, deltaDays);
	}
</script>

<svelte:head>
	<title>Today · Mnechromancy</title>
</svelte:head>

<RadialField
	dayColor={position.dayColor}
	weekColor={position.weekColor}
	handColor={position.handColor}
/>

<h1>Today</h1>

<p class="civil-date">{formatCivil(current)} — cycle {position.yearCycle}, day {position.dayOfYear} of 365.</p>

<div class="dial-row">
	<Dial {position} onstep={step} />
	<Readout {position} />
</div>

<div class="forms-row">
	<DawnForm {position} />
	<DuskForm {position} />
</div>

<p class="footnote">
	The birthday is hardcoded until persistence lands — see <code>docs/backlog.md</code>. Dawn/Dusk
	commits aren't saved yet; that's the separate IndexedDB backlog item.
</p>

<style>
	/* The field stays in the dark envelope (docs/design/HANDOFF.md), so chrome
	   text follows the dusk tokens — this is the page's own body copy, not a
	   token-consuming component, so it doesn't get this for free. */
	:global(body) {
		color: var(--dusk-text);
	}

	h1 {
		font: var(--type-display);
		text-transform: uppercase;
	}

	.civil-date {
		font: 400 14px var(--font-mono, monospace);
		color: var(--dusk-dim);
	}

	.dial-row {
		display: flex;
		gap: 44px;
		flex-wrap: wrap;
		align-items: flex-start;
		margin-top: 24px;
	}

	.forms-row {
		display: flex;
		gap: 32px;
		flex-wrap: wrap;
		align-items: flex-start;
		margin-top: 48px;
	}

	.footnote {
		margin-top: 48px;
		font-size: 12.5px;
		opacity: 0.7;
	}
</style>
