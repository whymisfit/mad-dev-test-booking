import { ISODateString } from '@/shared/lib/datetimes';

export class BookingDateRequireError extends Error {
    constructor(date: ISODateString) {
        super();

        this.message = `calendarPeriod: expected a YYYY-MM-DD date, got "${date}"`;
        this.name = 'BookingDateRequire';
    }
}
