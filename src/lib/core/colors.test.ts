import { describe, expect, it } from 'vitest';
import {
	ARTIFICER_COLOR,
	COLORS,
	DEFAULT_MANDATES,
	MIDDLE_INDEX,
	SPECTRUM_LENGTH,
	colorAt,
	indexOf,
	isColor
} from './colors';

describe('the spectrum', () => {
	it('has seven positions', () => {
		expect(SPECTRUM_LENGTH).toBe(7);
	});

	it('runs in the order the calendar assumes at every scale', () => {
		expect([...COLORS]).toEqual([
			'Red',
			'Orange',
			'Yellow',
			'Green',
			'Teal',
			'Indikon',
			'Violet'
		]);
	});

	it('puts Green at the exact middle', () => {
		// Not decoration: the Green anomaly folds its Arcana into the middle
		// week's Green slot precisely because it is the centre the Hand turns on.
		expect(MIDDLE_INDEX).toBe(3);
		expect(colorAt(MIDDLE_INDEX)).toBe('Green');
	});

	it('excludes White, which belongs to the Artificer and no Hand', () => {
		expect(COLORS).not.toContain(ARTIFICER_COLOR);
		expect(isColor(ARTIFICER_COLOR)).toBe(false);
	});
});

describe('mandates', () => {
	it('gives every position a two-term mandate', () => {
		for (const color of COLORS) {
			expect(DEFAULT_MANDATES[color]).toHaveLength(2);
			for (const term of DEFAULT_MANDATES[color]) {
				expect(term.length).toBeGreaterThan(0);
			}
		}
	});
});

describe('position lookup', () => {
	it('round-trips colour and index', () => {
		for (const color of COLORS) {
			expect(colorAt(indexOf(color))).toBe(color);
		}
	});

	it('throws on an out-of-range position rather than wrapping', () => {
		// Wrapping would return a plausible but wrong colour, which is worse
		// than failing — a caller out of range has a bug worth surfacing.
		expect(() => colorAt(-1)).toThrow(RangeError);
		expect(() => colorAt(SPECTRUM_LENGTH)).toThrow(RangeError);
		expect(() => colorAt(1.5)).toThrow(RangeError);
	});
});
