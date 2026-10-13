import { BookingErrorCode } from '@/entities/Booking/api';
import { isDateString } from '@/shared/lib/datetimes';
import { parseRequestJsonSafe } from '@/shared/lib/parseRequestJsonSafe';

import { createBooking, listBookings, parseBookingDraft } from './bookingStore';
import { bookingError, bookingJson, invalidBookingResponse } from './responses';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');

    if (!from || !to || !isDateString(from) || !isDateString(to) || from > to) {
        return bookingError(400, BookingErrorCode.Validation, 'Enter a valid date range.');
    }

    return bookingJson(listBookings(from, to), 200, 'Bookings loaded.');
}

export async function POST(request: Request) {
    const draft = parseBookingDraft(await parseRequestJsonSafe(request));

    if (!draft) {
        return invalidBookingResponse();
    }

    const result = createBooking(draft);

    if (!result.ok) {
        return bookingError(result.status, result.code, result.message);
    }

    return bookingJson(result.booking, 201, 'Booking created.');
}
