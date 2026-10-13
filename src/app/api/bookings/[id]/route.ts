import { parseRequestJsonSafe } from '@/shared/lib/parseRequestJsonSafe';

import { deleteBooking, parseBookingDraft, updateBooking } from '../bookingStore';
import { bookingError, bookingJson, invalidBookingResponse } from '../responses';

interface BookingRouteContext {
    params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: BookingRouteContext) {
    const { id } = await context.params;

    const draft = parseBookingDraft(await parseRequestJsonSafe(request));

    if (!draft) {
        return invalidBookingResponse();
    }

    const result = updateBooking(id, draft);

    if (!result.ok) {
        return bookingError(result.status, result.code, result.message);
    }

    return bookingJson(result.booking, 200, 'Booking updated.');
}

export async function DELETE(_request: Request, context: BookingRouteContext) {
    const { id } = await context.params;

    const result = deleteBooking(id);

    if (!result.ok) {
        return bookingError(result.status, result.code, result.message);
    }

    return bookingJson(null, 200, 'Booking deleted.');
}
