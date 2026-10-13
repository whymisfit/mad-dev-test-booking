import type { Booking, BookingDraft } from '@/entities/Booking/model';
import type { ISODateString } from '@/shared/lib/datetimes';

export interface BookingRepository {
    list(from: ISODateString, to: ISODateString, signal?: AbortSignal): Promise<Booking[]>;

    create(draft: BookingDraft): Promise<Booking>;

    update(id: string, draft: BookingDraft): Promise<Booking>;

    delete(id: string): Promise<void>;
}
