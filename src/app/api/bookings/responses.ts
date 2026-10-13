import { BookingErrorCode } from '@/entities/Booking/api';
import { type ApiResponse, ApiResponseCode } from '@/shared/api/ApiResponse';

const noStoreHeaders = { 'cache-control': 'no-store' };

export const bookingError = (status: number, code: BookingErrorCode, message: string): Response =>
    Response.json({ code, message, data: null } satisfies ApiResponse<null>, {
        status,
        headers: noStoreHeaders,
    });

export const bookingJson = <TData>(data: TData, status: number, message: string): Response =>
    Response.json({ code: ApiResponseCode.Success, message, data } satisfies ApiResponse<TData>, {
        status,
        headers: noStoreHeaders,
    });

export const invalidBookingResponse = (): Response =>
    bookingError(400, BookingErrorCode.Validation, 'Enter a valid date and time.');
