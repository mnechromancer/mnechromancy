<script lang="ts">
	import { civilDateInZone, formatCivil } from '$lib/core/civil-date';
	import { dateToPosition } from '$lib/core/date-engine';
	import { DEFAULT_MANDATES, type Color } from '$lib/core/colors';

	// Placeholder until the birthday is captured and persisted (docs/data-model.md).
	const birthday = { year: 1990, month: 9, day: 20 };
	const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	const today = civilDateInZone(new Date(), timeZone);
	const position = dateToPosition(birthday, today);

	const mandate = (color: Color) => DEFAULT_MANDATES[color].join(', ');
</script>

<svelte:head>
	<title>Today · Mnechromancy</title>
</svelte:head>

<h1>Today</h1>

<p>
	{formatCivil(today)} — cycle {position.yearCycle}, day {position.dayOfYear} of 365.
</p>

{#if position.isArtificer}
	<p>The Artificer. White, outside all Hands. The cycle closes tomorrow.</p>
{:else}
	<dl>
		<dt>Hand {position.hand}</dt>
		<dd>{position.handColor} — {mandate(position.handColor!)}</dd>

		{#if position.week !== null}
			<dt>Week {position.week}</dt>
			<dd>{position.weekColor} — {mandate(position.weekColor!)}</dd>
		{:else}
			<dt>Week</dt>
			<dd>None — Hand-day {position.handDay} brackets the Hand.</dd>
		{/if}

		<dt>Day</dt>
		<dd>{position.dayColor} — {mandate(position.dayColor as Color)}</dd>
	</dl>

	{#if position.arcana}
		<p>Arcana slot: {position.arcana.position}{position.isGreenAnomaly ? ' (Green anomaly)' : ''}</p>
	{/if}
{/if}

<p>
	Placeholder surface. The dial and Dawn/Dusk capture replace this — see <code>docs/backlog.md</code
	>. The birthday is hardcoded until persistence lands.
</p>
