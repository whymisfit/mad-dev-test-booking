import {
    type Booking,
    type BookingDraft,
    BookingIssue,
    hasBookingConflict,
    isBookingStarted,
    type MoscowNow,
    toBookingDraft,
    validateBookingTime,
} from '@/entities/Booking/model';
import { splitDateTime } from '@/shared/lib/datetimes';

/**
 * Schedule drop datetimes are `YYYY-MM-DD HH:mm:ss`. A booking stays on one calendar day.
 */
export const bookingMoveDraft = (
    booking: Pick<Booking, 'title'>,
    start: string,
    end: string,
): BookingDraft | null => {
    const startParts = splitDateTime(start);
    const endParts = splitDateTime(end);

    if (!startParts || !endParts || startParts.date !== endParts.date) {
        return null;
    }

    return toBookingDraft({
        date: startParts.date,
        start: startParts.time,
        end: endParts.time,
        title: booking.title,
    });
};

export const isSameBookingSlot = (booking: Booking, draft: BookingDraft): boolean =>
    booking.date === draft.date && booking.start === draft.start && booking.end === draft.end;

/**
 * Client preview against the bookings currently on screen.
 * The API repeats this check against every stored booking.
 */
export const bookingMoveIssue = (
    booking: Booking,
    bookings: readonly Booking[],
    start: string,
    end: string,
    now: MoscowNow,
): BookingIssue | null => {
    if (isBookingStarted(booking, now)) {
        return BookingIssue.PastEdit;
    }

    const draft = bookingMoveDraft(booking, start, end);

    if (!draft) {
        return BookingIssue.InvalidValue;
    }

    const timeIssue = validateBookingTime(draft, now);

    if (timeIssue) {
        return timeIssue;
    }

    if (hasBookingConflict(draft, bookings, booking.id)) {
        return BookingIssue.Conflict;
    }

    return null;
};
