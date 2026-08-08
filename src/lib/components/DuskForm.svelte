<script lang="ts">
	/**
	 * Dusk entry — docs/data-model.md `dusk_entries`: held, not_held, klesha,
	 * color_actual. Dusk never revises Dawn (append-only); divergence from the
	 * assigned color is surfaced as data, not an error. Persistence (IndexedDB)
	 * is the separate "Dawn/Dusk capture" backlog item — not wired up here.
	 */
	import { COLORS, type Color } from '$lib/core/colors';
	import type { Position } from '$lib/core/date-engine';

	export interface DuskFields {
		held: string;
		notHeld: string;
		klesha: string;
		colorActual: Color | null;
	}

	interface Props {
		position: Position;
		onchange?: (fields: DuskFields) => void;
		oncommit?: (fields: DuskFields) => void;
	}

	let { position, onchange, oncommit }: Props = $props();

	const KLESHAS = ['avidyā', 'asmitā', 'rāga', 'dveṣa', 'abhiniveśa'];

	let held = $state('');
	let notHeld = $state('');
	let klesha = $state('');
	let colorActual = $state<Color | null>(null);

	function fields(): DuskFields {
		return { held, notHeld, klesha, colorActual };
	}

	function report() {
		onchange?.(fields());
	}

	function pick(color: Color) {
		colorActual = color;
		report();
	}

	function commit() {
		oncommit?.(fields());
	}

	const diverges = $derived(colorActual !== null && colorActual !== position.dayColor);
</script>

<form class="dusk-form" onsubmit={(e) => (e.preventDefault(), commit())}>
	<div class="header">
		<span class="eyebrow">DUSK — STATE READ</span>
		<span class="title">What the day ran as</span>
	</div>

	<div class="grid">
		<label class="field">
			<span class="field-label">What held — without willed effort</span>
			<textarea rows="3" bind:value={held} oninput={report}></textarea>
		</label>
		<label class="field">
			<span class="field-label">What didn't</span>
			<textarea rows="3" bind:value={notHeld} oninput={report}></textarea>
		</label>
	</div>

	<label class="field klesha-field">
		<span class="field-label">Which klesha was underneath — if named</span>
		<input type="text" list="kleshas" placeholder="optional" bind:value={klesha} oninput={report} />
		<datalist id="kleshas">
			{#each KLESHAS as k (k)}
				<option value={k}></option>
			{/each}
		</datalist>
	</label>

	<div class="lived">
		<span class="field-label">What color did the day actually run as?</span>
		<div class="swatches">
			{#each COLORS as color, i (color)}
				<button
					type="button"
					class="pick pick-{color.toLowerCase()}"
					class:selected={colorActual === color}
					aria-pressed={colorActual === color}
					onclick={() => pick(color)}
				>
					<span class="pos">{i + 1}</span>
					<span class="name">{color}</span>
				</button>
			{/each}
		</div>
		{#if diverges}
			<p class="diverge-note">
				Assigned {position.dayColor}, lived {colorActual} — divergence noted, not corrected.
			</p>
		{/if}
	</div>

	<div class="footer">
		<button type="submit" class="commit">Commit Dusk</button>
		<span class="hint">Append-only — Dawn's entry is never revised.</span>
	</div>
</form>

<style>
	.dusk-form {
		display: flex;
		flex-direction: column;
		gap: 18px;
		width: 100%;
		max-width: 560px;
		background: var(--dusk-panel);
		border: 1px solid var(--dusk-line);
		border-radius: 12px;
		padding: 24px;
		color: var(--dusk-text);
	}

	.header {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.eyebrow {
		font-size: 12.5px;
		letter-spacing: 0.1em;
		font-weight: 500;
		color: var(--dusk-dim);
	}

	.title {
		font: var(--type-voice);
	}

	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 7px;
	}

	.klesha-field {
		max-width: 340px;
	}

	.field-label {
		font-size: 12.5px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 500;
		color: var(--dusk-dim);
	}

	textarea,
	input[type='text'] {
		width: 100%;
		box-sizing: border-box;
		background: var(--dusk-inset);
		border: 1px solid var(--dusk-line);
		border-radius: 6px;
		padding: 11px 12px;
		font: var(--type-entry);
		color: var(--dusk-text);
		resize: vertical;
	}

	.lived {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.swatches {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 8px;
	}

	.pick {
		min-height: 60px;
		border-radius: 7px;
		color: #fff;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 2px;
		padding: 6px 2px;
		border: 2px solid transparent;
	}

	.pick:hover {
		filter: brightness(1.15);
	}

	.pick.selected {
		border-color: #fff;
	}

	.pick .pos {
		font: 500 12px var(--font-mono);
	}

	.pick .name {
		font-size: 10.5px;
		letter-spacing: 0.04em;
	}

	.pick-red {
		background: var(--red-field);
	}
	.pick-orange {
		background: var(--orange-field);
	}
	.pick-yellow {
		background: var(--yellow-field);
	}
	.pick-green {
		background: var(--green-field);
	}
	.pick-teal {
		background: var(--teal-field);
	}
	.pick-indikon {
		background: var(--indikon-field);
	}
	.pick-violet {
		background: var(--violet-field);
	}

	.diverge-note {
		margin: 0;
		font-size: 13px;
		color: var(--yellow-tint);
	}

	.footer {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.commit {
		height: 44px;
		padding: 0 22px;
		border-radius: 7px;
		background: var(--yellow-field);
		border: 1px solid var(--yellow-core);
		color: #fff;
		font: 500 15px var(--font-ui);
		cursor: pointer;
	}

	.commit:hover {
		filter: brightness(1.18);
	}

	.hint {
		font-size: 12.5px;
		color: var(--dusk-dim);
	}
</style>
