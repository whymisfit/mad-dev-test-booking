import { describe, expect, it } from 'vitest';

import {
    addDays,
    formatMinutes,
    isDateString,
    isTimeString,
    parseTimeToMinutes,
    splitDateTime,
    toDateString,
    toDateTimeString,
} from '../datetimes';

describe('datetimes', () => {
    it('accepts only real dates and 24h clock times', () => {
        expect(isDateString('2026-10-12')).toBe(true);
        expect(isDateString('2026-02-31')).toBe(false);
        expect(isDateString('2026-10-12 10:00:00')).toBe(false);
        expect(isTimeString('09:30')).toBe(true);
        expect(isTimeString('9:30')).toBe(false);
        expect(isTimeString('24:00')).toBe(false);
        expect(isTimeString('09:30:00')).toBe(false);
    });

    it('converts between clock times and minutes', () => {
        expect(parseTimeToMinutes('17:45')).toBe(17 * 60 + 45);
        expect(parseTimeToMinutes('nope')).toBeNull();
        expect(formatMinutes(9 * 60 + 5)).toBe('09:05');
    });

    it('splits and joins schedule date-times', () => {
        expect(splitDateTime('2026-10-12 10:30:00')).toEqual({ date: '2026-10-12', time: '10:30' });
        expect(splitDateTime('2026-10-12 10:30')).toEqual({ date: '2026-10-12', time: '10:30' });
        expect(splitDateTime('2026-10-12')).toBeNull();
        expect(toDateTimeString('2026-10-12', '10:30')).toBe('2026-10-12 10:30:00');
    });

    it('reads the calendar date from strings and local dates', () => {
        expect(toDateString('2026-10-12 00:00:00')).toBe('2026-10-12');
        expect(toDateString(new Date(2026, 9, 12, 23, 59))).toBe('2026-10-12');
        expect(toDateString('nope')).toBeNull();
    });

    it('adds days across month and year boundaries', () => {
        expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
        expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
        expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    });
});
