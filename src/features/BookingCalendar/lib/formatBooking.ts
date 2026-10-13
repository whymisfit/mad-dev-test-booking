import type { Booking, BookingDraft } from '@/entities/Booking/model';

import { formatBookingWhen } from './calendarPeriod';

export const formatCreatedMessage = (draft: BookingDraft): string => {
    const when = formatBookingWhen(draft.date, draft.start, draft.end);

    if (!draft.title) {
        return when;
    }

    return `${draft.title}. ${when}`;
};

export const formatDeleteQuestion = (booking: Booking): string => {
    const when = formatBookingWhen(booking.date, booking.start, booking.end);

    if (!booking.title) {
        return `Delete the booking on ${when}?`;
    }

    return `Delete the booking "${booking.title}" on ${when}?`;
};
