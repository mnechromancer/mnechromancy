/**
 * Calendar dates, not instants.
 *
 * The calendar counts days, never elapsed time. A Dawn check-in at 6am and a
 * Dusk check-in at 11pm are the same calendar day even though seventeen hours
 * and possibly a DST transition separate them, and a day that runs 23 or 25
 * hours is still one day.
 *
 * Subtracting two `Date` objects answers a question about elapsed milliseconds,
 * which is a different question and gives a different answer twice a year.
 * So the engine works exclusively on `CivilDate`, and instants are converted at
 * the edge — exactly once, here.
 */

export interface CivilDate {
	/** Proleptic Gregorian year. */
	year: number;
	/** 1-12. Not zero-based, unlike `Date`. */
	month: number;
	/** 1-31. */
	day: number;
}

/**
 * Days since 1970-01-01, from a civil date.
 *
 * Howard Hinnant's `days_from_civil`, which is exact over the full proleptic
 * Gregorian range and needs no leap-year special-casing at the call site.
 */
export function daysFromCivil({ year, month, day }: CivilDate): number {
	const y = year - (month <= 2 ? 1 : 0);
	const era = Math.floor(y / 400);
	const yoe = y - era * 400; // [0, 399]
	const doy = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1; // [0, 365]
	const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy; // [0, 146096]
	return era * 146097 + doe - 719468;
}

/** Inverse of {@link daysFromCivil}. */
export function civilFromDays(days: number): CivilDate {
	const z = days + 719468;
	const era = Math.floor(z / 146097);
	const doe = z - era * 146097; // [0, 146096]
	const yoe = Math.floor(
		(doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365
	); // [0, 399]
	const y = yoe + era * 400;
	const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100)); // [0, 365]
	const mp = Math.floor((5 * doy + 2) / 153); // [0, 11]
	const day = doy - Math.floor((153 * mp + 2) / 5) + 1; // [1, 31]
	const month = mp + (mp < 10 ? 3 : -9); // [1, 12]
	return { year: y + (month <= 2 ? 1 : 0), month, day };
}

/** Signed count of calendar days from `from` to `to`. */
export function daysBetween(from: CivilDate, to: CivilDate): number {
	return daysFromCivil(to) - daysFromCivil(from);
}

/** `from` shifted by a whole number of calendar days. */
export function addDays(from: CivilDate, days: number): CivilDate {
	return civilFromDays(daysFromCivil(from) + days);
}

/** Negative if a is earlier, positive if later, 0 if the same day. */
export function compareCivil(a: CivilDate, b: CivilDate): number {
	return daysFromCivil(a) - daysFromCivil(b);
}

export function isLeapYear(year: number): boolean {
	return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * The calendar date an instant falls on, in a given IANA time zone.
 *
 * This is the only boundary where an instant becomes a date. Takes the instant
 * as an argument rather than reading the clock, so it stays pure and testable —
 * callers pass `new Date()`.
 */
export function civilDateInZone(instant: Date, timeZone: string): CivilDate {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		era: 'short'
	}).formatToParts(instant);

	const lookup = (type: string) => parts.find((p) => p.type === type)?.value;
	const year = Number(lookup('year'));
	const month = Number(lookup('month'));
	const day = Number(lookup('day'));

	if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
		throw new RangeError(`Could not resolve a calendar date in time zone "${timeZone}"`);
	}

	// Intl reports years BC as positive with era "BC"; the proleptic Gregorian
	// numbering this module uses puts 1 BC at year 0. Irrelevant for birthdays
	// but cheap to keep the conversion total rather than quietly wrong.
	const isBc = lookup('era') === 'BC';
	return { year: isBc ? 1 - year : year, month, day };
}

export function formatCivil({ year, month, day }: CivilDate): string {
	const pad = (n: number, width: number) => String(Math.abs(n)).padStart(width, '0');
	const sign = year < 0 ? '-' : '';
	return `${sign}${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
}
