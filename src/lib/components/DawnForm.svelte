<script lang="ts">
	/**
	 * Dawn entry — docs/data-model.md `dawn_entries`: friction_named, counter_move,
	 * day_goal. Plain inputs, no timers (docs/design/accessibility.md). This component
	 * only holds the fields and reports changes via `onchange`/`oncommit` — persistence
	 * (IndexedDB, save-as-you-type storage) is the separate "Dawn/Dusk capture" backlog
	 * item and isn't wired up yet.
	 */
	import type { Position } from '$lib/core/date-engine';

	export interface DawnFields {
		frictionNamed: string;
		counterMove: string;
		dayGoal: string;
	}

	interface Props {
		position: Position;
		onchange?: (fields: DawnFields) => void;
		oncommit?: (fields: DawnFields) => void;
	}

	let { position, onchange, oncommit }: Props = $props();

	let frictionNamed = $state('');
	let counterMove = $state('');
	let dayGoal = $state('');

	function fields(): DawnFields {
		return { frictionNamed, counterMove, dayGoal };
	}

	function report() {
		onchange?.(fields());
	}

	function commit() {
		oncommit?.(fields());
	}

	const dayGoalPlaceholder = $derived(
		`${position.dayColor} in service of ${position.weekColor ?? position.handColor} in service of ${position.handColor ?? 'the cycle'}`
	);
</script>

<form class="dawn-form" onsubmit={(e) => (e.preventDefault(), commit())}>
	<div class="header">
		<span class="titles">
			<span class="eyebrow">DAWN — DIRECTION SET</span>
			<span class="title">Before it fires</span>
		</span>
	</div>

	<label class="field">
		<span class="field-label">Name today's friction — before it fires</span>
		<textarea
			rows="2"
			placeholder="The impulse most likely to arrive"
			bind:value={frictionNamed}
			oninput={report}
		></textarea>
	</label>

	<label class="field">
		<span class="field-label">Pre-decide the counter-move</span>
		<textarea
			rows="2"
			placeholder="Chosen in advance, not improvised at the moment of craving"
			bind:value={counterMove}
			oninput={report}
		></textarea>
	</label>

	<label class="field">
		<span class="field-label">One day goal — all three scopes in view</span>
		<input type="text" placeholder={dayGoalPlaceholder} bind:value={dayGoal} oninput={report} />
	</label>

	<button type="submit" class="commit">Commit Dawn</button>
	<p class="hint">Saves locally as you type — an interrupted session never loses work.</p>
</form>

<style>
	.dawn-form {
		display: flex;
		flex-direction: column;
		gap: 18px;
		width: 100%;
		max-width: 420px;
		background: var(--dawn-panel);
		border: 1px solid var(--dawn-line);
		border-radius: 12px;
		padding: 24px;
		color: var(--dawn-text);
	}

	.eyebrow {
		display: block;
		font-size: 12.5px;
		letter-spacing: 0.1em;
		font-weight: 500;
		color: var(--dawn-dim);
	}

	.title {
		display: block;
		font: var(--type-voice);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 7px;
	}

	.field-label {
		font-size: 12.5px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 500;
		color: var(--dawn-dim);
	}

	textarea,
	input[type='text'] {
		width: 100%;
		box-sizing: border-box;
		background: var(--dawn-inset);
		border: 1px solid var(--dawn-line);
		border-radius: 6px;
		padding: 11px 12px;
		font: var(--type-entry);
		color: var(--dawn-text);
		resize: vertical;
	}

	.commit {
		height: 44px;
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
		margin: 0;
		font-size: 12.5px;
		color: var(--dawn-dim);
	}
</style>
