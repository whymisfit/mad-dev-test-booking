import {
    isDateString,
    type ISODateString,
    isTimeString,
    isWeekend,
    parseTimeToMinutes,
} from '@/shared/lib/datetimes';

import type { Booking, BookingDraft } from './booking';
import { BookingConstraints } from './bookingConstraints';
import { BookingIssue } from './bookingIssue';
import { isSlotInThePast, type MoscowNow } from './moscowTime';

export const normalizeBookingTitle = (title: string | undefined): string | undefined => {
    const trimmed = title?.trim();

    if (!trimmed) {
        return undefined;
    }

    return trimmed;
};

export const toBookingDraft = (input: {
    date: ISODateString;
    start: string;
    end: string;
    title?: string;
}): BookingDraft => {
    const title = normalizeBookingTitle(input.title);

    const bookingDraft: BookingDraft = {
        date: input.date,
        start: input.start,
        end: input.end,
    };

    if (!title) {
        bookingDraft.title = title;
    }

    return bookingDraft;
};

export const isBookingStarted = (
    booking: Pick<Booking, 'date' | 'start'>,
    now: MoscowNow,
): boolean => isSlotInThePast(booking.date, booking.start, now);

/**
 * Local rules only. Overlap is checked separately so the form does not trust a stale list.
 */
export const validateBookingTime = (draft: BookingDraft, now: MoscowNow): BookingIssue | null => {
    if (!isDateString(draft.date) || !isTimeString(draft.start) || !isTimeString(draft.end)) {
        return BookingIssue.InvalidValue;
    }

    if (isWeekend(draft.date)) {
        return BookingIssue.Weekend;
    }

    if (isSlotInThePast(draft.date, draft.start, now)) {
        return BookingIssue.Past;
    }

    const start = parseTimeToMinutes(draft.start);
    const end = parseTimeToMinutes(draft.end);

    if (start === null || end === null) {
        return BookingIssue.InvalidValue;
    }

    if (start < BookingConstraints.WorkStartMinutes || end > BookingConstraints.WorkEndMinutes) {
        return BookingIssue.OutsideWorkingHours;
    }

    if (start >= end) {
        return BookingIssue.InvalidRange;
    }

    const duration = end - start;

    if (duration < BookingConstraints.MinDurationMinutes) {
        return BookingIssue.TooShort;
    }

    if (duration > BookingConstraints.MaxDurationMinutes) {
        return BookingIssue.TooLong;
    }

    return null;
};

export const hasBookingConflict = (
    draft: BookingDraft,
    bookings: readonly Booking[],
    excludeId?: string,
): boolean => {
    const start = parseTimeToMinutes(draft.start);
    const end = parseTimeToMinutes(draft.end);

    if (start === null || end === null) {
        return false;
    }

    return bookings.some((booking) => {
        if (booking.id === excludeId || booking.date !== draft.date) {
            return false;
        }

        const bookingStart = parseTimeToMinutes(booking.start);
        const bookingEnd = parseTimeToMinutes(booking.end);

        if (bookingStart === null || bookingEnd === null) {
            return false;
        }

        return start < bookingEnd && bookingStart < end;
    });
};
