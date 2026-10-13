import {
    BookingConstraints,
    isSlotInThePast,
    type MoscowNow,
    validateBookingTime,
} from '@/entities/Booking/model';
import {
    formatMinutes,
    isDateString,
    type ISODateString,
    isWeekend,
    nextWeekdayAfter,
    splitDateTime,
} from '@/shared/lib/datetimes';

export interface BookingFormSeed {
    id?: string;
    date: ISODateString;
    start: string;
    end: string;
    title: string;
}

export type BookingEntry =
    { type: 'form'; seed: BookingFormSeed } | { type: 'unavailable'; seed: BookingFormSeed };

const morningSeed = (date: ISODateString): BookingFormSeed => ({
    date,
    start: BookingConstraints.WorkStart,
    end: formatMinutes(BookingConstraints.WorkStartMinutes + 60),
    title: '',
});

const unavailableAfter = (date: ISODateString): BookingEntry => ({
    type: 'unavailable',
    seed: morningSeed(nextWeekdayAfter(date)),
});

export const entryFromBookButton = (now: MoscowNow): BookingEntry => {
    if (isWeekend(now.date)) {
        return unavailableAfter(now.date);
    }

    if (now.minutes < BookingConstraints.WorkStartMinutes) {
        return { type: 'form', seed: morningSeed(now.date) };
    }

    if (BookingConstraints.WorkEndMinutes - now.minutes < BookingConstraints.MinDurationMinutes) {
        return unavailableAfter(now.date);
    }

    return {
        type: 'form',
        seed: {
            date: now.date,
            start: formatMinutes(now.minutes),
            end: formatMinutes(Math.min(now.minutes + 60, BookingConstraints.WorkEndMinutes)),
            title: '',
        },
    };
};

export const entryFromMonthDay = (date: ISODateString, now: MoscowNow): BookingEntry | null => {
    if (!isDateString(date) || date < now.date || isWeekend(date)) {
        return null;
    }

    const endMinutes = now.minutes + BookingConstraints.MinDurationMinutes;

    if (endMinutes >= 24 * 60) {
        return unavailableAfter(date);
    }

    const start = formatMinutes(now.minutes);
    const end = formatMinutes(endMinutes);
    const issue = validateBookingTime({ date, start, end }, now);

    if (issue) {
        return unavailableAfter(date);
    }

    return {
        type: 'form',
        seed: { date, start, end, title: '' },
    };
};

export const entryFromWeekSlot = (
    slotStart: string,
    slotEnd: string,
    now: MoscowNow,
): BookingEntry | null => {
    const start = splitDateTime(slotStart);
    const end = splitDateTime(slotEnd);

    if (!start || !end || start.date !== end.date) {
        return null;
    }

    if (isWeekend(start.date) || isSlotInThePast(start.date, start.time, now)) {
        return null;
    }

    return {
        type: 'form',
        seed: {
            date: start.date,
            start: start.time,
            end: end.time,
            title: '',
        },
    };
};
