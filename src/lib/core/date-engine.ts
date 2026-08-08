/**
 * Birthday to Hand / week / day / Arcana, for any date.
 *
 * Spec: docs/date-engine.md. Pure and synchronous — this module is the thing
 * every surface in the app renders from.
 *
 *   Hand n opens at birthday + 52(n-1),  n = 1..7
 *   Hand-day  1        opening Arcana
 *   Hand-days 2-51     seven ROYGBIV weeks
 *                      week 4 spans eight calendar days; its Green slot is
 *                      doubled across Hand-days 26 and 27
 *   Hand-day  52       closing Arcana
 *   Year-day  365      White — the Artificer, outside all Hands
 *
 * 7 x 52 = 364, + the Artificer = 365.
 */

import { ARTIFICER_COLOR, COLORS, type AnyColor, type Color } from './colors';
import {
	type CivilDate,
	addDays,
	compareCivil,
	daysBetween,
	formatCivil,
	isLeapYear
} from './civil-date';

export const HANDS_PER_CYCLE = 7;
export const DAYS_PER_HAND = 52;
export const WEEKS_PER_HAND = 7;
/** The middle week, whose Green slot is doubled. */
export const GREEN_WEEK = 4;
export const DAYS_PER_CYCLE = HANDS_PER_CYCLE * DAYS_PER_HAND + 1; // 365

export type ArcanaPosition = 'open' | 'center' | 'close' | 'artificer';

/**
 * Where an Arcana sits, structurally. Which of the twenty-two lands here is a
 * separate lookup against the placement table — see docs/arcana-content.md.
 * The engine deliberately does not hardcode that mapping.
 */
export interface ArcanaSlot {
	/** 1-7, or null for the Artificer, which sits outside the Hands. */
	hand: number | null;
	position: ArcanaPosition;
}

export interface Position {
	/** Birthday-to-birthday cycle, 1-indexed. Cycle 1 opens on the birthday. */
	yearCycle: number;
	/** 1-365 (366 only on a leap cycle, and only when explicitly allowed). */
	dayOfYear: number;
	isArtificer: boolean;
	/** 1-7. Null on the Artificer day. */
	hand: number | null;
	/** 1-52 within the Hand. Null on the Artificer day. */
	handDay: number | null;
	/** 1-7 within the Hand. Null on the Artificer and on the bracket days. */
	week: number | null;
	/**
	 * 1-7 within the week. The Green week runs eight calendar days across these
	 * seven positions, so position 4 occurs twice and this never exceeds 7.
	 */
	weekDay: number | null;
	dayColor: AnyColor;
	weekColor: Color | null;
	handColor: Color | null;
	arcana: ArcanaSlot | null;
	/** True on both halves of the doubled Green slot (Hand-days 26 and 27). */
	isGreenAnomaly: boolean;
}

export interface DateEngineOptions {
	/**
	 * A cycle spanning a Feb 29 is 366 days, and the structure has 365 slots.
	 * Days 1-365 are unaffected; only the final day is unaccounted for.
	 *
	 * 'throw' (default) refuses rather than silently returning a wrong position.
	 * 'double-artificer' is the README's floated proposal, following the Green
	 * week precedent — available to try, not settled. See docs/backlog.md.
	 */
	extraDay?: 'throw' | 'double-artificer';
	/**
	 * A Feb 29 birthday has no anniversary in a common year. Which day stands in
	 * is a semantic decision the project has not made, so the default refuses.
	 */
	leapDayBirthday?: 'throw' | 'feb-28' | 'mar-01';
}

/** Hand-day on which each week begins. Index 0 is unused; weeks are 1-indexed. */
const WEEK_STARTS = [0, 2, 9, 16, 23, 31, 38, 45] as const;
/** One past the last Hand-day belonging to a week. */
const WEEKS_END = 52;

/**
 * Resolve a Hand-day in 2..51 to its week and position within that week.
 *
 * The Green week is why this walks a table instead of dividing: with one 8-day
 * week among six 7-day ones, no single modulo lands correctly on both sides
 * of it.
 */
function weekPosition(handDay: number): {
	week: number;
	weekDay: number;
	isGreenAnomaly: boolean;
} {
	for (let week = WEEKS_PER_HAND; week >= 1; week--) {
		const start = WEEK_STARTS[week];
		if (handDay < start) continue;

		const end = week === WEEKS_PER_HAND ? WEEKS_END : WEEK_STARTS[week + 1];
		if (handDay >= end) break;

		const offset = handDay - start;

		if (week !== GREEN_WEEK) {
			return { week, weekDay: offset + 1, isGreenAnomaly: false };
		}

		// Eight calendar days across seven colour positions: offsets 3 and 4 are
		// both Green (position 4), and everything after shifts back by one so the
		// week still closes on Violet.
		const isGreenAnomaly = offset === 3 || offset === 4;
		const weekDay = offset <= 3 ? offset + 1 : offset;
		return { week, weekDay, isGreenAnomaly };
	}

	throw new RangeError(`Hand-day ${handDay} does not fall in any week`);
}

/**
 * The anniversary of `birthday` in the given year, as a calendar date.
 * Only interesting for Feb 29 birthdays, which have none in a common year.
 */
function anniversaryIn(
	year: number,
	birthday: CivilDate,
	leapDayBirthday: NonNullable<DateEngineOptions['leapDayBirthday']>
): CivilDate {
	const bornOnLeapDay = birthday.month === 2 && birthday.day === 29;
	if (!bornOnLeapDay || isLeapYear(year)) {
		return { year, month: birthday.month, day: birthday.day };
	}

	switch (leapDayBirthday) {
		case 'feb-28':
			return { year, month: 2, day: 28 };
		case 'mar-01':
			return { year, month: 3, day: 1 };
		default:
			throw new RangeError(
				`A February 29 birthday has no anniversary in ${year}. ` +
					`Which day stands in is undecided — pass leapDayBirthday: 'feb-28' or 'mar-01' to choose.`
			);
	}
}

/**
 * The calendar position of `target`, for someone born on `birthday`.
 *
 * Cycles are anchored to the anniversary, not to a rolling 365-day count: the
 * README says the cycle closes the day before your birthday, and a fixed count
 * would drift off the birthday by a day after every leap year.
 */
export function dateToPosition(
	birthday: CivilDate,
	target: CivilDate,
	options: DateEngineOptions = {}
): Position {
	const { extraDay = 'throw', leapDayBirthday = 'throw' } = options;

	if (compareCivil(target, birthday) < 0) {
		throw new RangeError(
			`${formatCivil(target)} precedes the birthday ${formatCivil(birthday)}; the calendar does not extend backwards`
		);
	}

	// Anniversary on or before the target opens the cycle the target sits in.
	let cycleStartYear = target.year;
	if (compareCivil(target, anniversaryIn(target.year, birthday, leapDayBirthday)) < 0) {
		cycleStartYear -= 1;
	}
	const cycleStart = anniversaryIn(cycleStartYear, birthday, leapDayBirthday);

	const yearCycle = cycleStartYear - birthday.year + 1;
	const dayOfYear = daysBetween(cycleStart, target) + 1;

	if (dayOfYear > DAYS_PER_CYCLE) {
		if (extraDay !== 'double-artificer') {
			throw new RangeError(
				`${formatCivil(target)} is day ${dayOfYear} of a cycle spanning February 29, and the ` +
					`structure has ${DAYS_PER_CYCLE} slots. The treatment is undecided — pass ` +
					`extraDay: 'double-artificer' to follow the Green week precedent.`
			);
		}
		return artificerPosition(yearCycle, dayOfYear);
	}

	if (dayOfYear === DAYS_PER_CYCLE) {
		return artificerPosition(yearCycle, dayOfYear);
	}

	const hand = Math.ceil(dayOfYear / DAYS_PER_HAND);
	const handDay = dayOfYear - DAYS_PER_HAND * (hand - 1);
	const handColor = COLORS[hand - 1];

	// The bracket days sit outside the seven weeks: the Hand opens on Red and
	// closes on Violet, with no week scope of their own.
	if (handDay === 1 || handDay === DAYS_PER_HAND) {
		const isOpen = handDay === 1;
		return {
			yearCycle,
			dayOfYear,
			isArtificer: false,
			hand,
			handDay,
			week: null,
			weekDay: null,
			dayColor: isOpen ? 'Red' : 'Violet',
			weekColor: null,
			handColor,
			arcana: { hand, position: isOpen ? 'open' : 'close' },
			isGreenAnomaly: false
		};
	}

	const { week, weekDay, isGreenAnomaly } = weekPosition(handDay);

	return {
		yearCycle,
		dayOfYear,
		isArtificer: false,
		hand,
		handDay,
		week,
		weekDay,
		dayColor: COLORS[weekDay - 1],
		weekColor: COLORS[week - 1],
		handColor,
		arcana: isGreenAnomaly ? { hand, position: 'center' } : null,
		isGreenAnomaly
	};
}

function artificerPosition(yearCycle: number, dayOfYear: number): Position {
	return {
		yearCycle,
		dayOfYear,
		isArtificer: true,
		hand: null,
		handDay: null,
		week: null,
		weekDay: null,
		dayColor: ARTIFICER_COLOR,
		weekColor: null,
		handColor: null,
		arcana: { hand: null, position: 'artificer' },
		isGreenAnomaly: false
	};
}

/**
 * Inverse of {@link dateToPosition}: the calendar date a given cycle-day falls
 * on. Computed directly rather than by searching forward from the birthday.
 */
export function positionToDate(
	birthday: CivilDate,
	position: { yearCycle: number; dayOfYear: number },
	options: DateEngineOptions = {}
): CivilDate {
	const { leapDayBirthday = 'throw' } = options;
	const { yearCycle, dayOfYear } = position;

	if (!Number.isInteger(yearCycle) || yearCycle < 1) {
		throw new RangeError(`yearCycle must be a positive integer, got ${yearCycle}`);
	}
	if (!Number.isInteger(dayOfYear) || dayOfYear < 1) {
		throw new RangeError(`dayOfYear must be a positive integer, got ${dayOfYear}`);
	}

	const cycleStart = anniversaryIn(birthday.year + yearCycle - 1, birthday, leapDayBirthday);
	return addDays(cycleStart, dayOfYear - 1);
}
