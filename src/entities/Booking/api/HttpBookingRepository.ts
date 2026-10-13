import { AxiosInstance } from 'axios';

import type { Booking, BookingDraft } from '@/entities/Booking/model';
import type { ApiResponse } from '@/shared/api/ApiResponse';
import type { ISODateString } from '@/shared/lib/datetimes';

import { BookingRepository } from './bookingRepository';

export class HttpBookingRepository implements BookingRepository {
    constructor(private readonly httpClient: AxiosInstance) {}

    async list(from: ISODateString, to: ISODateString, signal?: AbortSignal): Promise<Booking[]> {
        const { data } = await this.httpClient.get<ApiResponse<Booking[]>>('/bookings', {
            params: { from, to },
            signal,
        });

        return data.data;
    }

    async create(draft: BookingDraft): Promise<Booking> {
        const { data } = await this.httpClient.post<ApiResponse<Booking>>('/bookings', draft);

        return data.data;
    }

    async update(id: string, draft: BookingDraft): Promise<Booking> {
        const { data } = await this.httpClient.patch<ApiResponse<Booking>>(
            `/bookings/${id}`,
            draft,
        );

        return data.data;
    }

    async delete(id: string): Promise<void> {
        await this.httpClient.delete<ApiResponse<null>>(`/bookings/${id}`);
    }
}
