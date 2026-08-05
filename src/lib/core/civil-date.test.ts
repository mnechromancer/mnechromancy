import { describe, expect, it } from 'vitest';
import {
	type CivilDate,
	addDays,
	civilDateInZone,
	civilFromDays,
	compareCivil,
	daysBetween,
	daysFromCivil,
	formatCivil,
	isLeapYear
} from './civil-date';

describe('civil day numbering', () => {
	it('anchors on the Unix epoch', () => {
		expect(daysFromCivil({ year: 1970, month: 1, day: 1 })).toBe(0);
	});

	it('round-trips across a long span including leap days', () => {
		for (let days = -20000; days <= 20000; days += 7) {
			expect(daysFromCivil(civilFromDays(days))).toBe(days);
		}
	});

	it('counts leap days when spanning February', () => {
		// 2024 is a leap year, 2023 is not.
		expect(daysBetween({ year: 2024, month: 2, day: 1 }, { year: 2024, month: 3, day: 1 })).toBe(29);
		expect(daysBetween({ year: 2023, month: 2, day: 1 }, { year: 2023, month: 3, day: 1 })).toBe(28);
	});

	it('handles the century rules', () => {
		expect(isLeapYear(2000)).toBe(true); // divisible by 400
		expect(isLeapYear(1900)).toBe(false); // divisible by 100, not 400
		expect(isLeapYear(2024)).toBe(true);
		expect(isLeapYear(2023)).toBe(false);
		expect(daysBetween({ year: 1900, month: 2, day: 28 }, { year: 1900, month: 3, day: 1 })).toBe(1);
		expect(daysBetween({ year: 2000, month: 2, day: 28 }, { year: 2000, month: 3, day: 1 })).toBe(2);
	});

	it('orders dates', () => {
		const earlier: CivilDate = { year: 2024, month: 3, day: 9 };
		const later: CivilDate = { year: 2024, month: 3, day: 10 };
		expect(compareCivil(earlier, later)).toBeLessThan(0);
		expect(compareCivil(later, earlier)).toBeGreaterThan(0);
		expect(compareCivil(earlier, { ...earlier })).toBe(0);
	});

	it('formats as ISO calendar dates', () => {
		expect(formatCivil({ year: 1990, month: 9, day: 20 })).toBe('1990-09-20');
	});
});

describe('resolving an instant to a calendar date', () => {
	it('uses the zone, not the host offset', () => {
		// 2024-03-10T04:30Z is still March 9th in Los Angeles.
		const instant = new Date('2024-03-10T04:30:00Z');
		expect(formatCivil(civilDateInZone(instant, 'America/Los_Angeles'))).toBe('2024-03-09');
		expect(formatCivil(civilDateInZone(instant, 'UTC'))).toBe('2024-03-10');
		expect(formatCivil(civilDateInZone(instant, 'Asia/Tokyo'))).toBe('2024-03-10');
	});

	it('treats a 23-hour DST day as one calendar day', () => {
		// US spring-forward 2024: 2024-03-10 loses an hour in Los Angeles.
		// Dawn and Dusk on that day must resolve to the same date, and the day
		// after must be exactly one day later — the off-by-one that instant
		// subtraction produces and calendar-day counting cannot.
		const zone = 'America/Los_Angeles';
		const dawn = civilDateInZone(new Date('2024-03-10T14:00:00Z'), zone); // 06:00 local
		const dusk = civilDateInZone(new Date('2024-03-11T06:00:00Z'), zone); // 23:00 local

		expect(formatCivil(dawn)).toBe('2024-03-10');
		expect(formatCivil(dusk)).toBe('2024-03-10');
		expect(daysBetween(dawn, dusk)).toBe(0);

		const nextDawn = civilDateInZone(new Date('2024-03-11T13:00:00Z'), zone); // 06:00 local
		expect(daysBetween(dawn, nextDawn)).toBe(1);
	});

	it('treats a 25-hour DST day as one calendar day', () => {
		// Autumn fall-back 2024 in Los Angeles.
		const zone = 'America/Los_Angeles';
		const dawn = civilDateInZone(new Date('2024-11-03T13:00:00Z'), zone); // 06:00 local
		const dusk = civilDateInZone(new Date('2024-11-04T07:00:00Z'), zone); // 23:00 local
		expect(formatCivil(dawn)).toBe('2024-11-03');
		expect(formatCivil(dusk)).toBe('2024-11-03');
		expect(daysBetween(dawn, dusk)).toBe(0);
	});
});

describe('day arithmetic', () => {
	it('crosses month and year boundaries', () => {
		expect(formatCivil(addDays({ year: 2023, month: 12, day: 31 }, 1))).toBe('2024-01-01');
		expect(formatCivil(addDays({ year: 2024, month: 2, day: 28 }, 1))).toBe('2024-02-29');
		expect(formatCivil(addDays({ year: 2023, month: 2, day: 28 }, 1))).toBe('2023-03-01');
	});

	it('goes backwards', () => {
		expect(formatCivil(addDays({ year: 2024, month: 1, day: 1 }, -1))).toBe('2023-12-31');
	});
});
