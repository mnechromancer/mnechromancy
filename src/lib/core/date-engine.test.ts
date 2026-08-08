import { describe, expect, it } from 'vitest';
import { type CivilDate, addDays, formatCivil } from './civil-date';
import {
	DAYS_PER_CYCLE,
	DAYS_PER_HAND,
	HANDS_PER_CYCLE,
	type Position,
	dateToPosition,
	positionToDate
} from './date-engine';

// September 20th, because the README uses it as the example of a date that
// arrives whether or not you are paying attention.
const BIRTHDAY: CivilDate = { year: 1990, month: 9, day: 20 };

/** Position on day `dayOfYear` of the first cycle. */
function day(dayOfYear: number, cycle = 1): Position {
	return dateToPosition(BIRTHDAY, positionToDate(BIRTHDAY, { yearCycle: cycle, dayOfYear }));
}

/** Day-of-year for a given Hand-day. */
function handDayIndex(hand: number, handDay: number): number {
	return DAYS_PER_HAND * (hand - 1) + handDay;
}

const EVERY_HAND = [1, 2, 3, 4, 5, 6, 7];

describe('anchoring', () => {
	it('opens cycle 1 on the birthday itself', () => {
		const position = dateToPosition(BIRTHDAY, BIRTHDAY);
		expect(position).toMatchObject({ yearCycle: 1, dayOfYear: 1, hand: 1, handDay: 1 });
	});

	it('closes the cycle the day before the next birthday', () => {
		// 1990-09-20 to 1991-09-19 inclusive is 365 days; 1991 is a common year.
		const lastDay = positionToDate(BIRTHDAY, { yearCycle: 1, dayOfYear: DAYS_PER_CYCLE });
		expect(formatCivil(lastDay)).toBe('1991-09-19');
		expect(formatCivil(addDays(lastDay, 1))).toBe('1991-09-20');
	});

	it('rolls into the next cycle on the following birthday', () => {
		const nextBirthday = addDays(
			positionToDate(BIRTHDAY, { yearCycle: 1, dayOfYear: DAYS_PER_CYCLE }),
			1
		);
		expect(dateToPosition(BIRTHDAY, nextBirthday)).toMatchObject({
			yearCycle: 2,
			dayOfYear: 1,
			hand: 1,
			handDay: 1
		});
	});

	it('refuses dates before the birthday', () => {
		expect(() => dateToPosition(BIRTHDAY, addDays(BIRTHDAY, -1))).toThrow(RangeError);
	});
});

describe('Hands', () => {
	it('opens Hand n at birthday + 52(n-1)', () => {
		for (const hand of EVERY_HAND) {
			expect(day(handDayIndex(hand, 1))).toMatchObject({ hand, handDay: 1 });
		}
	});

	it('runs the spectrum across the seven Hands', () => {
		const colors = EVERY_HAND.map((hand) => day(handDayIndex(hand, 1)).handColor);
		expect(colors).toEqual(['Red', 'Orange', 'Yellow', 'Green', 'Teal', 'Indikon', 'Violet']);
	});

	it('brackets each Hand with an opening and closing Arcana', () => {
		for (const hand of EVERY_HAND) {
			const opens = day(handDayIndex(hand, 1));
			const closes = day(handDayIndex(hand, DAYS_PER_HAND));

			expect(opens.arcana).toEqual({ hand, position: 'open' });
			expect(closes.arcana).toEqual({ hand, position: 'close' });

			// Red-Red opening, Red-Violet closing. Both sit outside the seven weeks.
			expect(opens.dayColor).toBe('Red');
			expect(closes.dayColor).toBe('Violet');
			expect(opens.week).toBeNull();
			expect(closes.week).toBeNull();
		}
	});
});

describe('the Green anomaly', () => {
	it('doubles the Green slot across Hand-days 26 and 27', () => {
		for (const hand of EVERY_HAND) {
			const first = day(handDayIndex(hand, 26));
			const second = day(handDayIndex(hand, 27));

			for (const position of [first, second]) {
				expect(position.isGreenAnomaly).toBe(true);
				expect(position.dayColor).toBe('Green');
				expect(position.week).toBe(4);
				expect(position.weekDay).toBe(4);
				expect(position.arcana).toEqual({ hand, position: 'center' });
			}
		}
	});

	it('runs eight calendar days across seven colour positions', () => {
		// The whole Green week, Hand-days 23-30. Position 4 occurs twice and the
		// week still closes on Violet — that is what "eight across seven" means.
		const week = [23, 24, 25, 26, 27, 28, 29, 30].map((handDay) =>
			day(handDayIndex(1, handDay))
		);

		expect(week.map((p) => p.weekDay)).toEqual([1, 2, 3, 4, 4, 5, 6, 7]);
		expect(week.map((p) => p.dayColor)).toEqual([
			'Red',
			'Orange',
			'Yellow',
			'Green',
			'Green',
			'Teal',
			'Indikon',
			'Violet'
		]);
		expect(week.every((p) => p.week === 4)).toBe(true);
	});

	it('leaves the days on either side of it unanomalous', () => {
		// Hand-day 25 is the last before the doubling, 28 the first after —
		// the two places an off-by-one would surface.
		const before = day(handDayIndex(1, 25));
		expect(before).toMatchObject({ week: 4, weekDay: 3, dayColor: 'Yellow', isGreenAnomaly: false });
		expect(before.arcana).toBeNull();

		const after = day(handDayIndex(1, 28));
		expect(after).toMatchObject({ week: 4, weekDay: 5, dayColor: 'Teal', isGreenAnomaly: false });
		expect(after.arcana).toBeNull();
	});

	it('keeps the weeks either side of the Green week aligned', () => {
		expect(day(handDayIndex(1, 22))).toMatchObject({ week: 3, weekDay: 7, dayColor: 'Violet' });
		expect(day(handDayIndex(1, 23))).toMatchObject({ week: 4, weekDay: 1, dayColor: 'Red' });
		expect(day(handDayIndex(1, 30))).toMatchObject({ week: 4, weekDay: 7, dayColor: 'Violet' });
		expect(day(handDayIndex(1, 31))).toMatchObject({ week: 5, weekDay: 1, dayColor: 'Red' });
	});
});

describe('the Artificer', () => {
	it('takes year-day 365, outside all Hands', () => {
		const artificer = day(DAYS_PER_CYCLE);
		expect(artificer).toMatchObject({
			isArtificer: true,
			dayColor: 'White',
			hand: null,
			handDay: null,
			week: null,
			weekDay: null,
			weekColor: null,
			handColor: null
		});
		expect(artificer.arcana).toEqual({ hand: null, position: 'artificer' });
	});

	it('is the only day of the cycle outside a Hand', () => {
		const outside = [];
		for (let d = 1; d <= DAYS_PER_CYCLE; d++) {
			if (day(d).hand === null) outside.push(d);
		}
		expect(outside).toEqual([DAYS_PER_CYCLE]);
	});
});

describe('whole-cycle invariants', () => {
	const cycle = Array.from({ length: DAYS_PER_CYCLE }, (_, i) => day(i + 1));

	it('gives every Hand exactly 52 days', () => {
		for (const hand of EVERY_HAND) {
			expect(cycle.filter((p) => p.hand === hand)).toHaveLength(DAYS_PER_HAND);
		}
	});

	it('accounts for 7 x 52 + 1 = 365 days', () => {
		expect(HANDS_PER_CYCLE * DAYS_PER_HAND + 1).toBe(DAYS_PER_CYCLE);
		expect(cycle).toHaveLength(365);
	});

	it('never reports a week position above seven', () => {
		for (const position of cycle) {
			if (position.weekDay !== null) {
				expect(position.weekDay).toBeGreaterThanOrEqual(1);
				expect(position.weekDay).toBeLessThanOrEqual(7);
			}
		}
	});

	it('places 21 Arcana in Hands plus the Artificer', () => {
		const slots = cycle.map((p) => p.arcana).filter((slot) => slot !== null);

		expect(slots.filter((s) => s.position === 'open')).toHaveLength(7);
		expect(slots.filter((s) => s.position === 'close')).toHaveLength(7);
		expect(slots.filter((s) => s.position === 'artificer')).toHaveLength(1);

		// 14 days carry the centre Arcana, but that is 7 Arcana each spanning the
		// doubled Green slot — the distinction the "one goal slot or two" question
		// still turns on.
		expect(slots.filter((s) => s.position === 'center')).toHaveLength(14);
		const centreHands = new Set(
			slots.filter((s) => s.position === 'center').map((s) => s.hand)
		);
		expect(centreHands.size).toBe(7);
	});

	it('distributes colours through a Hand as the structure requires', () => {
		// Derived from the README rather than from the implementation: a Hand is
		// 7 weeks x 7 positions (= 49) with Green doubled (= 50), bracketed by a
		// Red opening and a Violet closing (= 52). So every colour appears seven
		// times, except Red and Violet which gain their bracket day, and Green
		// which gains the anomaly.
		const counts: Record<string, number> = {};
		for (const position of cycle.filter((p) => p.hand === 1)) {
			counts[position.dayColor] = (counts[position.dayColor] ?? 0) + 1;
		}

		expect(counts).toEqual({
			Red: 8,
			Orange: 7,
			Yellow: 7,
			Green: 8,
			Teal: 7,
			Indikon: 7,
			Violet: 8
		});
		expect(Object.values(counts).reduce((a, b) => a + b)).toBe(DAYS_PER_HAND);
	});

	it('gives every day inside a Hand all three scope colours', () => {
		for (const position of cycle) {
			if (position.isArtificer) continue;
			expect(position.handColor).not.toBeNull();
			expect(position.dayColor).toBeTruthy();
			// Bracket days have no week scope; every other day does.
			const isBracket = position.handDay === 1 || position.handDay === DAYS_PER_HAND;
			expect(position.weekColor === null).toBe(isBracket);
		}
	});
});

describe('round-tripping', () => {
	it('inverts position back to the same date across the cycle', () => {
		for (let dayOfYear = 1; dayOfYear <= DAYS_PER_CYCLE; dayOfYear++) {
			const date = positionToDate(BIRTHDAY, { yearCycle: 3, dayOfYear });
			const position = dateToPosition(BIRTHDAY, date);
			expect(position.dayOfYear).toBe(dayOfYear);
			expect(position.yearCycle).toBe(3);
		}
	});

	it('agrees with plain day counting from the birthday', () => {
		// An independent check on the anchoring: cycle 1 is a common year, so
		// day N is simply N-1 days after the birthday.
		for (const dayOfYear of [1, 52, 53, 200, 364, 365]) {
			expect(positionToDate(BIRTHDAY, { yearCycle: 1, dayOfYear })).toEqual(
				addDays(BIRTHDAY, dayOfYear - 1)
			);
		}
	});
});

describe('leap years — undecided, so refused rather than guessed', () => {
	// Cycle 2 runs 1991-09-20 to 1992-09-19 and contains 1992-02-29, so it is
	// 366 days against a 365-slot structure.
	const extraDay: CivilDate = { year: 1992, month: 9, day: 19 };

	it('handles days 1-365 of a leap cycle normally', () => {
		const artificer = dateToPosition(BIRTHDAY, { year: 1992, month: 9, day: 18 });
		expect(artificer).toMatchObject({ yearCycle: 2, dayOfYear: 365, isArtificer: true });
	});

	it('throws on the 366th day rather than returning a wrong position', () => {
		expect(() => dateToPosition(BIRTHDAY, extraDay)).toThrow(/undecided/);
	});

	it('can double the Artificer when explicitly opted into', () => {
		const position = dateToPosition(BIRTHDAY, extraDay, { extraDay: 'double-artificer' });
		expect(position).toMatchObject({ dayOfYear: 366, isArtificer: true, dayColor: 'White' });
	});

	it('still starts the next cycle on the birthday', () => {
		expect(dateToPosition(BIRTHDAY, { year: 1992, month: 9, day: 20 })).toMatchObject({
			yearCycle: 3,
			dayOfYear: 1
		});
	});
});

describe('February 29 birthdays', () => {
	const LEAP_BORN: CivilDate = { year: 1992, month: 2, day: 29 };

	it('works normally within a leap year', () => {
		expect(dateToPosition(LEAP_BORN, LEAP_BORN)).toMatchObject({ yearCycle: 1, dayOfYear: 1 });
	});

	it('refuses to pick an anniversary in a common year by default', () => {
		expect(() => dateToPosition(LEAP_BORN, { year: 1993, month: 6, day: 1 })).toThrow(
			/undecided/
		);
	});

	it('honours an explicit choice of stand-in day', () => {
		const marchFirst = dateToPosition(
			LEAP_BORN,
			{ year: 1993, month: 3, day: 1 },
			{ leapDayBirthday: 'mar-01' }
		);
		expect(marchFirst).toMatchObject({ yearCycle: 2, dayOfYear: 1 });

		const febTwentyEighth = dateToPosition(
			LEAP_BORN,
			{ year: 1993, month: 2, day: 28 },
			{ leapDayBirthday: 'feb-28' }
		);
		expect(febTwentyEighth).toMatchObject({ yearCycle: 2, dayOfYear: 1 });
	});
});
