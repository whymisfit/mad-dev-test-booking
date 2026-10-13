import { type Dayjs, dayjs } from './dayjs';

export const ISO_DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'HH:mm';
export const ISO_DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const DATE_TIME_INPUT_FORMATS = [ISO_DATE_TIME_FORMAT, `${ISO_DATE_FORMAT} ${TIME_FORMAT}`];
const TIME_ANCHOR_DATE = '1970-01-01';

/**
 * Calendar date in `YYYY-MM-DD` format, for example `2026-10-12`.
 */
export type ISODateString = string;

export interface DateTimeParts {
    date: ISODateString;
    time: string;
}

/**
 * WHY: Dates and times here are zone-less wall-clock values, so they are parsed as UTC to keep
 * host DST transitions from shifting them. `customParseFormat` is not used because it reads
 * `new Date()` on every call, which Next.js rejects while prerendering Client Components.
 * Formatting the result back rejects overflowing values such as `2026-02-31` or `24:00`.
 */
const parseStrict = (value: string, formats: readonly string[]): Dayjs | null => {
    const parsed = dayjs.utc(value);

    if (!parsed.isValid() || !formats.some((format) => parsed.format(format) === value)) {
        return null;
    }

    return parsed;
};

const parseTime = (value: string): Dayjs | null =>
    parseStrict(`${TIME_ANCHOR_DATE} ${value}`, [`${ISO_DATE_FORMAT} ${TIME_FORMAT}`]);

export const parseDate = (value: string): Dayjs | null => parseStrict(value, [ISO_DATE_FORMAT]);

export const isDateString = (value: string): boolean => parseDate(value) !== null;

export const isTimeString = (value: string): boolean => parseTime(value) !== null;

export const parseTimeToMinutes = (time: string): number | null => {
    const parsed = parseTime(time);

    if (!parsed) {
        return null;
    }

    return parsed.hour() * 60 + parsed.minute();
};

export const formatMinutes = (minutes: number): string =>
    dayjs.utc(0).add(minutes, 'minute').format(TIME_FORMAT);

/**
 * Accepts `YYYY-MM-DD HH:mm:ss` or `YYYY-MM-DD HH:mm`.
 */
export const splitDateTime = (value: string): DateTimeParts | null => {
    const parsed = parseStrict(value, DATE_TIME_INPUT_FORMATS);

    if (!parsed) {
        return null;
    }

    return { date: parsed.format(ISO_DATE_FORMAT), time: parsed.format(TIME_FORMAT) };
};

export const toDateTimeString = (date: ISODateString, time: string): string =>
    dayjs.utc(`${date} ${time}`).format(ISO_DATE_TIME_FORMAT);

/**
 * Reads the calendar date from a local `Date` or any string dayjs can parse.
 */
export const toDateString = (value: Date | string): ISODateString | null => {
    const parsed = dayjs(value);

    if (!parsed.isValid()) {
        return null;
    }

    return parsed.format(ISO_DATE_FORMAT);
};

export const isWeekend = (date: ISODateString): boolean => {
    const parsed = parseDate(date);

    return parsed !== null && parsed.isoWeekday() >= 6;
};

export const addDays = (date: ISODateString, days: number): ISODateString => {
    const parsed = parseDate(date);

    if (!parsed) {
        return date;
    }

    return parsed.add(days, 'day').format(ISO_DATE_FORMAT);
};

export const nextWeekdayAfter = (date: ISODateString): ISODateString => {
    let cursor = addDays(date, 1);

    while (isWeekend(cursor)) {
        cursor = addDays(cursor, 1);
    }

    return cursor;
};
