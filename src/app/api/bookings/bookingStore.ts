import {
    type Booking,
    type BookingDraft,
    BookingIssue,
    bookingIssueMessage,
    getMoscowNow,
    hasBookingConflict,
    isBookingStarted,
    type MoscowNow,
    toBookingDraft,
    validateBookingTime,
} from '@/entities/Booking/model';
import { isDateString, type ISODateString, isTimeString } from '@/shared/lib/datetimes';
import { BookingErrorCode } from '@/entities/Booking/api';

export interface BookingCommandSuccess {
    ok: true;
    booking: Booking;
}

export interface BookingCommandFailure {
    ok: false;
    status: number;
    code: BookingErrorCode;
    message: string;
}

export type BookingCommandResult = BookingCommandSuccess | BookingCommandFailure;

export interface BookingDeleteSuccess {
    ok: true;
}

export type BookingDeleteResult = BookingDeleteSuccess | BookingCommandFailure;

const bookings: Booking[] = [];

const failure = (
    status: number,
    code: BookingErrorCode,
    issue: BookingIssue,
): BookingCommandFailure => ({
    ok: false,
    status,
    code,
    message: bookingIssueMessage(issue),
});

const rejectDraft = (
    draft: BookingDraft,
    now: MoscowNow,
    excludeId?: string,
): BookingCommandFailure | null => {
    const issue = validateBookingTime(draft, now);

    if (issue) {
        return failure(400, BookingErrorCode.Validation, issue);
    }

    if (hasBookingConflict(draft, bookings, excludeId)) {
        return failure(409, BookingErrorCode.Conflict, BookingIssue.Conflict);
    }

    return null;
};

export const parseBookingDraft = (value: unknown): BookingDraft | null => {
    if (typeof value !== 'object' || value === null) {
        return null;
    }

    if (!('date' in value) || typeof value.date !== 'string' || !isDateString(value.date)) {
        return null;
    }

    if (!('start' in value) || typeof value.start !== 'string' || !isTimeString(value.start)) {
        return null;
    }

    if (!('end' in value) || typeof value.end !== 'string' || !isTimeString(value.end)) {
        return null;
    }

    if ('title' in value && value.title !== undefined && typeof value.title !== 'string') {
        return null;
    }

    const title = 'title' in value && typeof value.title === 'string' ? value.title : undefined;

    return toBookingDraft({
        date: value.date,
        start: value.start,
        end: value.end,
        title,
    });
};

export const listBookings = (from: ISODateString, to: ISODateString): Booking[] =>
    bookings
        .filter((booking) => booking.date >= from && booking.date <= to)
        .map((booking) => ({ ...booking }))
        .sort(
            (left, right) =>
                left.date.localeCompare(right.date) || left.start.localeCompare(right.start),
        );

/**
 * WHY: The check and the write stay in one synchronous call.
 * An await between them would let two requests both observe a free slot.
 */
export const createBooking = (
    draft: BookingDraft,
    now: MoscowNow = getMoscowNow(),
): BookingCommandResult => {
    const rejected = rejectDraft(draft, now);

    if (rejected) {
        return rejected;
    }

    const booking: Booking = {
        id: crypto.randomUUID(),
        ...draft,
    };

    bookings.push(booking);

    return { ok: true, booking: { ...booking } };
};

export const updateBooking = (
    id: string,
    draft: BookingDraft,
    now: MoscowNow = getMoscowNow(),
): BookingCommandResult => {
    const index = bookings.findIndex((booking) => booking.id === id);
    const current = bookings[index];

    if (!current) {
        return failure(404, BookingErrorCode.NotFound, BookingIssue.NotFound);
    }

    if (isBookingStarted(current, now)) {
        return failure(400, BookingErrorCode.Validation, BookingIssue.PastEdit);
    }

    const rejected = rejectDraft(draft, now, id);

    if (rejected) {
        return rejected;
    }

    const booking: Booking = {
        id,
        ...draft,
    };

    bookings[index] = booking;

    return { ok: true, booking: { ...booking } };
};

export const deleteBooking = (id: string, now: MoscowNow = getMoscowNow()): BookingDeleteResult => {
    const index = bookings.findIndex((booking) => booking.id === id);
    const current = bookings[index];

    if (!current) {
        return { ok: true };
    }

    if (isBookingStarted(current, now)) {
        return failure(400, BookingErrorCode.Validation, BookingIssue.PastDelete);
    }

    bookings.splice(index, 1);

    return { ok: true };
};
