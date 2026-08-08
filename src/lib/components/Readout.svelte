<script lang="ts">
	/**
	 * Always-visible text equivalent of the dial. Not aria-only: docs/design/accessibility.md
	 * requires a visible readout naming the three active scopes, which serves screen
	 * reader users, colorblind users, and the "legible in under a second" goal at once.
	 * Handles the brackets (Hand-day 1/52), the Green anomaly, and the Artificer.
	 */
	import { DEFAULT_MANDATES, type Color } from '$lib/core/colors';
	import type { Position } from '$lib/core/date-engine';

	interface Props {
		position: Position;
	}

	let { position }: Props = $props();

	function mandate(color: Color): string {
		return DEFAULT_MANDATES[color].join(', ');
	}
</script>

<div class="readout">
	{#if position.isArtificer}
		<div class="row">
			<span class="swatch white"></span>
			<span class="scope-body">
				<span class="scope-label">ARTIFICER</span>
				<span class="scope-name">White</span>
				<span class="scope-mandate">Outside all Hands — the cycle closes tomorrow.</span>
			</span>
		</div>
	{:else}
		<div class="row">
			<span class="swatch swatch-{position.handColor!.toLowerCase()}">
				{position.hand}
			</span>
			<span class="scope-body">
				<span class="scope-label">HAND</span>
				<span class="scope-name">{position.handColor}</span>
				<span class="scope-mandate">{mandate(position.handColor!)}</span>
			</span>
		</div>

		{#if position.week !== null}
			<div class="row">
				<span class="swatch swatch-{position.weekColor!.toLowerCase()}">
					{position.week}
				</span>
				<span class="scope-body">
					<span class="scope-label">WEEK</span>
					<span class="scope-name">{position.weekColor}</span>
					<span class="scope-mandate">{mandate(position.weekColor!)}</span>
				</span>
			</div>
		{:else}
			<div class="row">
				<span class="swatch idle">—</span>
				<span class="scope-body">
					<span class="scope-label">WEEK</span>
					<span class="scope-name">None</span>
					<span class="scope-mandate">Hand-day {position.handDay} brackets the Hand.</span>
				</span>
			</div>
		{/if}

		<div class="row">
			<span class="swatch swatch-{position.dayColor.toLowerCase()}">
				{position.weekDay ?? ''}
			</span>
			<span class="scope-body">
				<span class="scope-label">DAY</span>
				<span class="scope-name">{position.dayColor}</span>
				<span class="scope-mandate">{mandate(position.dayColor as Color)}</span>
			</span>
		</div>

		{#if position.isGreenAnomaly}
			<p class="note">
				Green anomaly — Hand-days 26 and 27 share this Green slot; the week runs eight
				calendar days across seven positions.
			</p>
		{/if}

		{#if position.arcana}
			<p class="note">Arcana slot: {position.arcana.position}.</p>
		{/if}
	{/if}

	<p class="sentence">
		Cycle {position.yearCycle}, day {position.dayOfYear} of 365.
	</p>
</div>

<style>
	.readout {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 14px;
	}

	.swatch {
		width: 40px;
		height: 40px;
		border-radius: 5px;
		flex: none;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		font: 500 14px/1 var(--font-mono);
		font-variant-numeric: tabular-nums;
	}

	.swatch.white {
		background: var(--white-field);
	}

	.swatch.idle {
		background: var(--dial-idle);
		color: var(--dusk-dim);
	}

	/* One class per spectrum position — CSP's style-src has no unsafe-inline, so
	   colors are selected via static classes rather than a dynamic style attribute. */
	.swatch-red {
		background: var(--red-field);
	}
	.swatch-orange {
		background: var(--orange-field);
	}
	.swatch-yellow {
		background: var(--yellow-field);
	}
	.swatch-green {
		background: var(--green-field);
	}
	.swatch-teal {
		background: var(--teal-field);
	}
	.swatch-indikon {
		background: var(--indikon-field);
	}
	.swatch-violet {
		background: var(--violet-field);
	}

	.scope-body {
		display: flex;
		flex-direction: column;
		gap: 1px;
		min-width: 0;
	}

	.scope-label {
		font-size: 11px;
		letter-spacing: 0.1em;
		color: var(--dusk-dim);
		font-weight: 500;
	}

	.scope-name {
		font-size: 16px;
		font-weight: 600;
	}

	.scope-mandate {
		font: var(--type-voice);
		color: var(--dusk-dim);
	}

	.note {
		margin: 0;
		font-size: 13px;
		color: var(--yellow-tint);
	}

	.sentence {
		margin: 0;
		font: var(--type-voice);
		color: var(--dusk-text);
	}
</style>
