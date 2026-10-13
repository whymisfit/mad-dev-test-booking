import { describe, expect, it } from 'vitest';

import { isWeekend, nextWeekdayAfter } from '@/shared/lib/datetimes';

import type { Booking } from '../model/booking';
import { BookingIssue } from '../model/bookingIssue';
import { getMoscowNow } from '../model/moscowTime';
import { hasBookingConflict, validateBookingTime } from '../model/validateBooking';

const morning = { date: '2026-10-12', minutes: 8 * 60 };
const midMorning = { date: '2026-10-12', minutes: 10 * 60 };

const createBookingDraft = (start: string, end: string, date = '2026-10-12') => ({
    date,
    start,
    end,
});

const createBooking = (id: string, start: string, end: string, date = '2026-10-12'): Booking => ({
    id,
    date,
    start,
    end,
});

describe('moscow time', () => {
    it('reads the wall clock in Moscow, not the host zone', () => {
        expect(getMoscowNow(new Date('2026-10-12T07:07:00.000Z'))).toEqual({
            date: '2026-10-12',
            minutes: 10 * 60 + 7,
        });
    });

    it('treats Saturday and Sunday as weekends and skips them', () => {
        expect(isWeekend('2026-10-10')).toBe(true);
        expect(isWeekend('2026-10-11')).toBe(true);
        expect(isWeekend('2026-10-12')).toBe(false);
        expect(nextWeekdayAfter('2026-10-16')).toBe('2026-10-19');
        expect(nextWeekdayAfter('2026-10-10')).toBe('2026-10-12');
    });
});

describe('validateBookingTime', () => {
    it('accepts a slot inside working hours, including the 18:00 end', () => {
        expect(validateBookingTime(createBookingDraft('09:00', '09:30'), morning)).toBeNull();
        expect(validateBookingTime(createBookingDraft('17:30', '18:00'), morning)).toBeNull();
        expect(validateBookingTime(createBookingDraft('09:00', '11:00'), morning)).toBeNull();
    });

    it('rejects weekends, the past, hours outside 09:00-18:00, and bad durations', () => {
        expect(
            validateBookingTime(createBookingDraft('10:00', '11:00', '2026-10-17'), morning),
        ).toBe(BookingIssue.Weekend);
        expect(
            validateBookingTime(createBookingDraft('10:00', '11:00', '2026-10-11'), morning),
        ).toBe(BookingIssue.Weekend);
        expect(
            validateBookingTime(createBookingDraft('10:00', '11:00', '2026-10-09'), morning),
        ).toBe(BookingIssue.Past);
        expect(validateBookingTime(createBookingDraft('09:59', '10:30'), midMorning)).toBe(
            BookingIssue.Past,
        );
        expect(validateBookingTime(createBookingDraft('10:00', '11:00'), midMorning)).toBeNull();
        expect(validateBookingTime(createBookingDraft('08:30', '09:30'), morning)).toBe(
            BookingIssue.OutsideWorkingHours,
        );
        expect(validateBookingTime(createBookingDraft('17:30', '18:30'), morning)).toBe(
            BookingIssue.OutsideWorkingHours,
        );
        expect(validateBookingTime(createBookingDraft('11:00', '11:00'), morning)).toBe(
            BookingIssue.InvalidRange,
        );
        expect(validateBookingTime(createBookingDraft('12:00', '11:00'), morning)).toBe(
            BookingIssue.InvalidRange,
        );
        expect(validateBookingTime(createBookingDraft('10:00', '10:20'), morning)).toBe(
            BookingIssue.TooShort,
        );
        expect(validateBookingTime(createBookingDraft('10:00', '12:01'), morning)).toBe(
            BookingIssue.TooLong,
        );
        expect(
            validateBookingTime(createBookingDraft('10:00', '11:00', '2026-02-31'), morning),
        ).toBe(BookingIssue.InvalidValue);
    });

    it('uses the injected clock for today', () => {
        const later = { date: '2026-10-12', minutes: 15 * 60 };

        expect(validateBookingTime(createBookingDraft('14:00', '15:00'), later)).toBe(
            BookingIssue.Past,
        );
        expect(validateBookingTime(createBookingDraft('15:00', '16:00'), later)).toBeNull();
    });
});

describe('hasBookingConflict', () => {
    const existing = [
        createBooking('a', '10:00', '11:00'),
        createBooking('b', '14:00', '15:00', '2026-10-13'),
    ];

    it('allows a touching boundary and a booking on another day', () => {
        expect(hasBookingConflict(createBookingDraft('11:00', '12:00'), existing)).toBe(false);
        expect(hasBookingConflict(createBookingDraft('09:00', '10:00'), existing)).toBe(false);
        expect(
            hasBookingConflict(createBookingDraft('10:00', '11:00', '2026-10-13'), existing),
        ).toBe(false);
    });

    it('rejects an overlap and ignores the booking being edited', () => {
        expect(hasBookingConflict(createBookingDraft('10:30', '11:30'), existing)).toBe(true);
        expect(hasBookingConflict(createBookingDraft('10:00', '11:00'), existing, 'a')).toBe(false);
        expect(hasBookingConflict(createBookingDraft('10:30', '11:30'), existing, 'a')).toBe(false);
        expect(
            hasBookingConflict(
                createBookingDraft('10:30', '11:30'),
                [...existing, createBooking('c', '11:00', '12:00')],
                'a',
            ),
        ).toBe(true);
    });
});
