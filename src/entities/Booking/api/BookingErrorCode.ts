export const BookingErrorCode = {
    Conflict: 'BOOKING_CONFLICT',
    Validation: 'BOOKING_VALIDATION',
    NotFound: 'BOOKING_NOT_FOUND',
} as const;

export type BookingErrorCode = (typeof BookingErrorCode)[keyof typeof BookingErrorCode];
