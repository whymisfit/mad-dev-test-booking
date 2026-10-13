import { describe, expect, it } from 'vitest';

import type { Booking } from '@/entities/Booking/model';
import { BookingIssue } from '@/entities/Booking/model';

import { bookingMoveIssue, isSameBookingSlot } from '../bookingMove';

const now = { date: '2026-10-13', minutes: 9 * 60 };

const booking = (id: string, start: string, end: string, date = '2026-10-13'): Booking => ({
    id,
    date,
    start,
    end,
    title: 'Standup',
});

const at = (date: string, start: string, end: string): [string, string] => [
    `${date} ${start}:00`,
    `${date} ${end}:00`,
];

describe('bookingMoveIssue', () => {
    const visible = [booking('a', '10:00', '11:00'), booking('b', '14:00', '15:00', '2026-10-14')];

    it('allows a free slot among the bookings on screen and ignores the moved booking', () => {
        const moved = visible[0];

        expect(bookingMoveIssue(moved, visible, ...at('2026-10-14', '10:00', '11:00'), now)).toBeNull();
        expect(bookingMoveIssue(moved, visible, ...at('2026-10-13', '11:00', '12:00'), now)).toBeNull();
        expect(bookingMoveIssue(moved, visible, ...at('2026-10-13', '10:00', '11:00'), now)).toBeNull();
    });

    it('rejects a collision with another visible booking', () => {
        expect(bookingMoveIssue(visible[0], visible, ...at('2026-10-14', '14:30', '15:30'), now)).toBe(
            BookingIssue.Conflict,
        );
    });

    it('rejects weekends, the past, and hours outside the working day', () => {
        const moved = visible[0];

        expect(bookingMoveIssue(moved, visible, ...at('2026-10-17', '10:00', '11:00'), now)).toBe(
            BookingIssue.Weekend,
        );
        expect(bookingMoveIssue(moved, visible, ...at('2026-10-12', '10:00', '11:00'), now)).toBe(
            BookingIssue.Past,
        );
        expect(bookingMoveIssue(moved, visible, ...at('2026-10-13', '17:30', '19:00'), now)).toBe(
            BookingIssue.OutsideWorkingHours,
        );
    });

    it('rejects a booking that has already started', () => {
        const started = booking('c', '08:30', '09:30');

        expect(bookingMoveIssue(started, [started], ...at('2026-10-14', '10:00', '11:00'), now)).toBe(
            BookingIssue.PastEdit,
        );
    });
});

describe('isSameBookingSlot', () => {
    it('matches the original date and time', () => {
        const current = booking('a', '10:00', '11:00');

        expect(
            isSameBookingSlot(current, {
                date: '2026-10-13',
                start: '10:00',
                end: '11:00',
                title: 'Standup',
            }),
        ).toBe(true);
        expect(isSameBookingSlot(current, { date: '2026-10-14', start: '10:00', end: '11:00' })).toBe(
            false,
        );
    });
});
