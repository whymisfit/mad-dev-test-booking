import { ISO_DATE_FORMAT, type ISODateString, parseTimeToMinutes } from '@/shared/lib/datetimes';
import { dayjs } from '@/shared/lib/dayjs';

export interface MoscowNow {
    date: ISODateString;
    minutes: number;
}

export const getMoscowNow = (instant: Date = new Date()): MoscowNow => {
    const moscow = dayjs(instant).tz('Europe/Moscow');

    return {
        date: moscow.format(ISO_DATE_FORMAT),
        minutes: moscow.hour() * 60 + moscow.minute(),
    };
};

export const isSlotInThePast = (date: ISODateString, start: string, now: MoscowNow): boolean => {
    if (date < now.date) {
        return true;
    }

    if (date > now.date) {
        return false;
    }

    const minutes = parseTimeToMinutes(start);

    if (minutes === null) {
        return false;
    }

    return minutes < now.minutes;
};
