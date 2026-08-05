/**
 * The seven-position spectrum and its default mandates.
 *
 * Structural: seven positions in a fixed order, run identically at every scale
 * (Hand, week, day). The order never varies — which makes ordinal position a
 * reliable non-colour channel, and therefore load-bearing for accessibility.
 * See docs/accessibility.md.
 *
 * Content: the names and the mandates. Shipped as defaults because a system
 * with no content is unusable, not because they are correct. See the README's
 * "The framework is open".
 */

/** The seven positions, in spectrum order. Index is the position. */
export const COLORS = [
	'Red',
	'Orange',
	'Yellow',
	'Green',
	'Teal',
	'Indikon',
	'Violet'
] as const;

export type Color = (typeof COLORS)[number];

/**
 * White is the Artificer's colour — year-day 365, outside all Hands. It is not
 * one of the seven positions and never appears in a Hand, week, or day slot,
 * so it is deliberately kept out of `COLORS`.
 */
export const ARTIFICER_COLOR = 'White';
export type ArtificerColor = typeof ARTIFICER_COLOR;

/** Any colour the calendar can display, including the Artificer's. */
export type AnyColor = Color | ArtificerColor;

/** A mandate is a pair: the two terms the README gives for each colour. */
export type Mandate = readonly [string, string];

export const DEFAULT_MANDATES: Readonly<Record<Color, Mandate>> = {
	Red: ['Solidity', 'Crystallinity'],
	Orange: ['Fluidity', 'Plasticity'],
	Yellow: ['Growth', 'Direction'],
	Green: ['Ubiquity', 'Love'],
	Teal: ['Language', 'Understanding'],
	Indikon: ['Discovery', 'Revelation'],
	Violet: ['Creation', 'Detachment']
} as const;

/** Number of positions in the spectrum. */
export const SPECTRUM_LENGTH = COLORS.length;

/**
 * Index of the middle position — where everything meets, and where the Green
 * anomaly folds its Arcana. Derived rather than hardcoded so that a spectrum of
 * a different length (the framework permits one) still resolves its own centre.
 */
export const MIDDLE_INDEX = (SPECTRUM_LENGTH - 1) / 2;

/** The colour at a given spectrum position. Throws rather than wrapping — a
 *  caller passing an out-of-range index has a bug, and silently folding it
 *  would produce a plausible-looking wrong colour. */
export function colorAt(index: number): Color {
	if (!Number.isInteger(index) || index < 0 || index >= SPECTRUM_LENGTH) {
		throw new RangeError(
			`Spectrum position must be an integer in 0..${SPECTRUM_LENGTH - 1}, got ${index}`
		);
	}
	return COLORS[index];
}

/** The position of a given colour. */
export function indexOf(color: Color): number {
	return COLORS.indexOf(color);
}

export function isColor(value: unknown): value is Color {
	return typeof value === 'string' && (COLORS as readonly string[]).includes(value);
}
