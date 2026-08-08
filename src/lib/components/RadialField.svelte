<script lang="ts">
	/**
	 * Groundwork for the radial background field: day at center, week around it,
	 * Hand at the rim. docs/design/HANDOFF.md §5 — slow cross-fade on recompose,
	 * cut under reduced motion (handled globally in app.css), never rotate.
	 *
	 * The gradient itself is one static rule; only which color feeds each stop
	 * varies, via static per-position classes that set a custom property. A
	 * dynamic `style="background: radial-gradient(...)"` would need inline
	 * style values, which this app's CSP (no unsafe-inline on style-src) blocks.
	 */
	import type { AnyColor } from '$lib/core/colors';

	interface Props {
		dayColor: AnyColor;
		/** Null on the bracket Hand-days (1 and 52) — falls back to the Hand color. */
		weekColor: AnyColor | null;
		/** Null only on the Artificer. */
		handColor: AnyColor | null;
	}

	let { dayColor, weekColor, handColor }: Props = $props();

	function slug(color: AnyColor): string {
		return color.toLowerCase();
	}
</script>

<div
	class="field field-day-{slug(dayColor)} field-week-{slug(weekColor ?? handColor ?? 'White')} field-hand-{slug(
		handColor ?? 'White'
	)}"
></div>

<style>
	.field {
		position: absolute;
		inset: 0;
		z-index: -1;
		background: radial-gradient(circle at center, var(--field-day), var(--field-week) 55%, var(--field-hand) 100%);
		transition: background 900ms ease;
	}

	@media (prefers-reduced-motion: reduce) {
		.field {
			transition: none;
		}
	}

	.field-day-red {
		--field-day: var(--red-field);
	}
	.field-day-orange {
		--field-day: var(--orange-field);
	}
	.field-day-yellow {
		--field-day: var(--yellow-field);
	}
	.field-day-green {
		--field-day: var(--green-field);
	}
	.field-day-teal {
		--field-day: var(--teal-field);
	}
	.field-day-indikon {
		--field-day: var(--indikon-field);
	}
	.field-day-violet {
		--field-day: var(--violet-field);
	}
	.field-day-white {
		--field-day: var(--white-field);
	}

	.field-week-red {
		--field-week: var(--red-field);
	}
	.field-week-orange {
		--field-week: var(--orange-field);
	}
	.field-week-yellow {
		--field-week: var(--yellow-field);
	}
	.field-week-green {
		--field-week: var(--green-field);
	}
	.field-week-teal {
		--field-week: var(--teal-field);
	}
	.field-week-indikon {
		--field-week: var(--indikon-field);
	}
	.field-week-violet {
		--field-week: var(--violet-field);
	}
	.field-week-white {
		--field-week: var(--white-field);
	}

	.field-hand-red {
		--field-hand: var(--red-field);
	}
	.field-hand-orange {
		--field-hand: var(--orange-field);
	}
	.field-hand-yellow {
		--field-hand: var(--yellow-field);
	}
	.field-hand-green {
		--field-hand: var(--green-field);
	}
	.field-hand-teal {
		--field-hand: var(--teal-field);
	}
	.field-hand-indikon {
		--field-hand: var(--indikon-field);
	}
	.field-hand-violet {
		--field-hand: var(--violet-field);
	}
	.field-hand-white {
		--field-hand: var(--white-field);
	}
</style>
