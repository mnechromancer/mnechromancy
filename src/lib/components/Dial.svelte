<script lang="ts">
	/**
	 * Three concentric rings — Hand outer, week middle, day inner — plus a thin
	 * band tracing the Hand's 52-day progress. Spec: docs/design/HANDOFF.md §2.
	 *
	 * Geometry only knows about `Position` (src/lib/core/date-engine.ts); it never
	 * computes calendar dates itself. Clicking a segment and the arrow keys both
	 * emit a day-delta via `onstep` — the caller (which holds the birthday) turns
	 * that into an actual date with the date engine.
	 *
	 * Colors are read as `var(--{color}-*)` custom properties (lib/styles/tokens.css)
	 * via SVG presentation attributes (fill/stroke), not the `style` attribute —
	 * the app's CSP has no `unsafe-inline` for style-src (see src/app.html).
	 */
	import { COLORS, type AnyColor, type Color } from '$lib/core/colors';
	import { DAYS_PER_HAND, WEEKS_PER_HAND, type Position } from '$lib/core/date-engine';

	interface Props {
		position: Position;
		/** Called with a signed day count to move by (keyboard nav or a segment click). */
		onstep: (deltaDays: number) => void;
	}

	let { position, onstep }: Props = $props();

	const CX = 260;
	const CY = 260;
	const BAND_R = 254;
	const GAP_DEG = 3;

	const RINGS = {
		hand: { outer: 248, inner: 192 },
		week: { outer: 186, inner: 128 },
		day: { outer: 122, inner: 64 }
	};

	function tokenPrefix(color: AnyColor): string {
		return color.toLowerCase();
	}

	function polar(r: number, angleDeg: number) {
		const a = ((angleDeg - 90) * Math.PI) / 180;
		return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
	}

	/** A single donut-slice path, `startDeg`..`endDeg` inclusive of an inter-segment gap. */
	function segmentPath(rOuter: number, rInner: number, startDeg: number, endDeg: number): string {
		const s = startDeg + GAP_DEG / 2;
		const e = endDeg - GAP_DEG / 2;
		const largeArc = e - s <= 180 ? 0 : 1;
		const outerStart = polar(rOuter, e);
		const outerEnd = polar(rOuter, s);
		const innerStart = polar(rInner, s);
		const innerEnd = polar(rInner, e);
		return [
			'M',
			outerStart.x,
			outerStart.y,
			'A',
			rOuter,
			rOuter,
			0,
			largeArc,
			0,
			outerEnd.x,
			outerEnd.y,
			'L',
			innerStart.x,
			innerStart.y,
			'A',
			rInner,
			rInner,
			0,
			largeArc,
			1,
			innerEnd.x,
			innerEnd.y,
			'Z'
		].join(' ');
	}

	function labelPoint(rOuter: number, rInner: number, startDeg: number, endDeg: number) {
		const mid = (startDeg + endDeg) / 2;
		return polar((rOuter + rInner) / 2, mid);
	}

	interface Segment {
		index: number;
		color: Color;
		d: string;
		label: { x: number; y: number };
		active: boolean;
	}

	function ring(colors: readonly Color[], activeIndex: number | null, spec: { outer: number; inner: number }): Segment[] {
		const step = 360 / colors.length;
		return colors.map((color, i) => {
			const start = i * step;
			const end = start + step;
			return {
				index: i,
				color,
				d: segmentPath(spec.outer, spec.inner, start, end),
				label: labelPoint(spec.outer, spec.inner, start, end),
				active: activeIndex === i
			};
		});
	}

	const handSegs = $derived(ring(COLORS, position.hand !== null ? position.hand - 1 : null, RINGS.hand));
	const weekSegs = $derived(
		position.week !== null ? ring(COLORS, position.week - 1, RINGS.week) : ring(COLORS, null, RINGS.week)
	);
	const daySegs = $derived(
		ring(COLORS, COLORS.indexOf(position.dayColor as Color), RINGS.day)
	);

	const bandProgress = $derived(position.handDay !== null ? position.handDay : 0);
	const dashArray = $derived(`${bandProgress} ${DAYS_PER_HAND - bandProgress}`);

	const sentence = $derived(readoutSentence(position));

	function readoutSentence(p: Position): string {
		if (p.isArtificer) return `The Artificer — day ${p.dayOfYear} of 365, outside all Hands.`;
		const parts = [`${p.dayColor} day`];
		if (p.week !== null) parts.push(`${p.weekColor} week`);
		parts.push(`${p.handColor} Hand`);
		return `${parts.join(', ')} — cycle ${p.yearCycle}, day ${p.dayOfYear} of 365.`;
	}

	function stepHand(targetIndex: number) {
		if (position.hand === null) return;
		onstep((targetIndex + 1 - position.hand) * DAYS_PER_HAND);
	}

	function stepWeek(targetIndex: number) {
		if (position.week === null) return;
		onstep((targetIndex + 1 - position.week) * WEEKS_PER_HAND);
	}

	function stepDay(targetIndex: number) {
		const currentIndex = COLORS.indexOf(position.dayColor as Color);
		if (currentIndex === -1) return;
		onstep(targetIndex - currentIndex);
	}

	function onKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowRight':
				event.preventDefault();
				onstep(event.shiftKey ? DAYS_PER_HAND : 1);
				break;
			case 'ArrowLeft':
				event.preventDefault();
				onstep(event.shiftKey ? -DAYS_PER_HAND : -1);
				break;
			case 'ArrowDown':
				event.preventDefault();
				onstep(WEEKS_PER_HAND);
				break;
			case 'ArrowUp':
				event.preventDefault();
				onstep(-WEEKS_PER_HAND);
				break;
		}
	}
</script>

<!-- Compound widget: the container owns arrow-key navigation (like a slider),
     so its segments are click-only affordances with tabindex="-1" — they are
     never keyboard focus targets themselves, which is what the a11y lint
     below can't see. -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="dial"
	role="group"
	aria-label={sentence}
	tabindex="0"
	onkeydown={onKeydown}
>
	<svg viewBox="0 0 520 520" width="520" class="dial-svg">
		<circle cx={CX} cy={CY} r={BAND_R} fill="none" class="band-track" stroke-width="5" />
		{#if !position.isArtificer}
			<circle
				cx={CX}
				cy={CY}
				r={BAND_R}
				fill="none"
				stroke="var(--{tokenPrefix(position.handColor ?? 'White')}-core)"
				stroke-width="5"
				stroke-linecap="butt"
				pathLength={DAYS_PER_HAND}
				stroke-dasharray={dashArray}
				transform="rotate(-90 {CX} {CY})"
				class="band-progress"
			/>
		{/if}

		{#each handSegs as seg (seg.index)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<path
				d={seg.d}
				fill="var(--{tokenPrefix(seg.color)}-{seg.active ? 'core' : 'field'})"
				stroke="var(--{tokenPrefix(seg.color)}-line)"
				stroke-width="2"
				class="segment"
				role="button"
				tabindex="-1"
				aria-label="Jump to Hand {seg.index + 1} — {seg.color}"
				onclick={() => stepHand(seg.index)}
			/>
		{/each}
		{#each weekSegs as seg (seg.index)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<path
				d={seg.d}
				fill="var(--{tokenPrefix(seg.color)}-{seg.active ? 'core' : 'field'})"
				stroke="var(--{tokenPrefix(seg.color)}-line)"
				stroke-width="2"
				class="segment"
				role="button"
				tabindex="-1"
				aria-label="Jump to week {seg.index + 1} — {seg.color}"
				onclick={() => stepWeek(seg.index)}
			/>
		{/each}
		{#each daySegs as seg (seg.index)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<path
				d={seg.d}
				fill="var(--{tokenPrefix(seg.color)}-{seg.active ? 'core' : 'field'})"
				stroke="var(--{tokenPrefix(seg.color)}-line)"
				stroke-width="2"
				class="segment"
				role="button"
				tabindex="-1"
				aria-label="Jump to day — {seg.color}"
				onclick={() => stepDay(seg.index)}
			/>
		{/each}

		{#each handSegs as seg (seg.index)}
			<text x={seg.label.x} y={seg.label.y} class="segment-label" fill="var(--{tokenPrefix(seg.color)}-tint)">{seg.index + 1}</text>
		{/each}
		{#each weekSegs as seg (seg.index)}
			<text x={seg.label.x} y={seg.label.y} class="segment-label" fill="var(--{tokenPrefix(seg.color)}-tint)">{seg.index + 1}</text>
		{/each}
		{#each daySegs as seg (seg.index)}
			<text x={seg.label.x} y={seg.label.y} class="segment-label" fill="var(--{tokenPrefix(seg.color)}-tint)">{seg.index + 1}</text>
		{/each}

		<text x={CX} y={CY - 6} class="center-num">{position.dayOfYear}</text>
		<text x={CX} y={CY + 16} class="center-sub">of 365</text>
	</svg>
</div>

<style>
	.dial {
		display: inline-block;
		border-radius: 14px;
		outline: none;
	}

	.dial:focus-visible {
		box-shadow:
			0 0 0 2px var(--dusk-bg),
			0 0 0 4px var(--teal-core);
	}

	.dial-svg {
		display: block;
		max-width: 100%;
		height: auto;
	}

	.band-track {
		stroke: var(--dial-idle);
	}

	.band-progress {
		transition: stroke-dasharray 500ms ease, stroke 300ms;
	}

	.segment {
		cursor: pointer;
		transition: fill 300ms, stroke 300ms;
	}

	.segment:hover {
		filter: brightness(1.3);
	}

	.segment-label {
		font: 500 13px/1 var(--font-mono);
		text-anchor: middle;
		dominant-baseline: middle;
		pointer-events: none;
		font-variant-numeric: tabular-nums;
	}

	.center-num {
		font: var(--type-readout);
		fill: var(--dusk-text);
		text-anchor: middle;
		font-variant-numeric: tabular-nums;
	}

	.center-sub {
		font: 400 11.5px/1 var(--font-mono);
		fill: var(--dusk-dim);
		text-anchor: middle;
	}

	@media (prefers-reduced-motion: reduce) {
		.band-progress,
		.segment {
			transition: none;
		}
	}
</style>
