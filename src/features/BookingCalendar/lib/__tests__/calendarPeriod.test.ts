import { describe, expect, it } from 'vitest';

import {
    CalendarView,
    formatBookingWhen,
    formatPeriodLabel,
    getVisibleRange,
    shiftAnchorDate,
} from '../calendarPeriod';

describe('calendarPeriod', () => {
    it('covers Monday to Friday of the anchor week', () => {
        expect(getVisibleRange(CalendarView.Week, '2026-10-14')).toEqual({
            from: '2026-10-12',
            to: '2026-10-16',
        });
        expect(getVisibleRange(CalendarView.Week, '2026-10-18')).toEqual({
            from: '2026-10-12',
            to: '2026-10-16',
        });
    });

    it('covers a six-week grid starting on the Monday before the 1st', () => {
        expect(getVisibleRange(CalendarView.Month, '2026-10-20')).toEqual({
            from: '2026-09-28',
            to: '2026-11-08',
        });
    });

    it('shifts by a week or by a month, clamping the day', () => {
        expect(shiftAnchorDate('2026-10-12', CalendarView.Week, 'forward')).toBe('2026-10-19');
        expect(shiftAnchorDate('2026-10-12', CalendarView.Week, 'back')).toBe('2026-10-05');
        expect(shiftAnchorDate('2026-01-31', CalendarView.Month, 'forward')).toBe('2026-02-28');
        expect(shiftAnchorDate('2026-01-15', CalendarView.Month, 'back')).toBe('2025-12-15');
    });

    it('formats period labels and booking dates', () => {
        expect(formatPeriodLabel(CalendarView.Week, '2026-10-14')).toBe('12 Oct – 16 Oct 2026');
        expect(formatPeriodLabel(CalendarView.Month, '2026-10-14')).toBe('October 2026');
        expect(formatBookingWhen('2026-10-12', '10:00', '11:00')).toBe('12 Oct 2026, 10:00–11:00');
    });

    it('fails fast on a malformed anchor', () => {
        expect(() => getVisibleRange(CalendarView.Week, '2026-10-12 00:00:00')).toThrow();
    });
});
