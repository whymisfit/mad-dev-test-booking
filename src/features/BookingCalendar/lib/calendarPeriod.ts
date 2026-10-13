import { ISO_DATE_FORMAT, type ISODateString, parseDate } from '@/shared/lib/datetimes';
import type { Dayjs } from '@/shared/lib/dayjs';
import { BookingDateRequireError } from '@/features/BookingCalendar/lib/BookingDateRequireError';

export const CalendarView = {
    Week: 'week',
    Month: 'month',
} as const;

export type CalendarView = (typeof CalendarView)[keyof typeof CalendarView];

export interface DateRange {
    from: ISODateString;
    to: ISODateString;
}

const DAY_MONTH_FORMAT = 'D MMM';
const LONG_DATE_FORMAT = 'D MMM YYYY';
const MONTH_FORMAT = 'MMMM YYYY';

const withRequireDate = (date: ISODateString): Dayjs => {
    const parsed = parseDate(date);

    if (!parsed) {
        throw new BookingDateRequireError(date);
    }

    return parsed;
};

export const getVisibleRange = (view: CalendarView, anchor: ISODateString): DateRange => {
    const day = withRequireDate(anchor);

    if (view === CalendarView.Week) {
        const monday = day.startOf('isoWeek');

        return {
            from: monday.format(ISO_DATE_FORMAT),
            to: monday.add(4, 'day').format(ISO_DATE_FORMAT),
        };
    }

    const gridStart = day.startOf('month').startOf('isoWeek');

    return {
        from: gridStart.format(ISO_DATE_FORMAT),
        to: gridStart.add(41, 'day').format(ISO_DATE_FORMAT),
    };
};

export const shiftAnchorDate = (
    date: ISODateString,
    view: CalendarView,
    direction: 'back' | 'forward',
): ISODateString => {
    const day = withRequireDate(date);

    const valueMove = direction === 'back' ? -1 : 1;

    const unit = view === CalendarView.Week ? 'week' : 'month';

    return day.add(valueMove, unit).format(ISO_DATE_FORMAT);
};

export const formatPeriodLabel = (view: CalendarView, anchor: ISODateString): string => {
    const day = withRequireDate(anchor);

    if (view === CalendarView.Month) {
        return day.format(MONTH_FORMAT);
    }

    const monday = day.startOf('isoWeek');
    const friday = monday.add(4, 'day');

    return `${monday.format(DAY_MONTH_FORMAT)} – ${friday.format(LONG_DATE_FORMAT)}`;
};

export const formatBookingWhen = (date: ISODateString, start: string, end: string): string =>
    `${withRequireDate(date).format(LONG_DATE_FORMAT)}, ${start}–${end}`;
