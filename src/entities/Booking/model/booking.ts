import type { ISODateString } from '@/shared/lib/datetimes';

export interface Booking {
    id: string;
    date: ISODateString;
    start: string;
    end: string;
    title?: string;
}

export interface BookingDraft {
    date: ISODateString;
    start: string;
    end: string;
    title?: string;
}
