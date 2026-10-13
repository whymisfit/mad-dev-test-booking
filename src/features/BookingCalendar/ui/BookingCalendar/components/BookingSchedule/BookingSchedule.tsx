'use client';
import { formatMinutes, isWeekend, splitDateTime, toDateString, toDateTimeString } from '@/shared/lib/datetimes';
import {
    DayOfWeek,
    type MonthViewProps,
    Schedule,
    ScheduleEventData,
    ScheduleHeader,
    type WeekViewProps
} from '@mantine/schedule';
import { useEffect, useState } from 'react';

import { BookingConstraints, getMoscowNow, isSlotInThePast } from '@/entities/Booking/model';

import { CalendarView, formatPeriodLabel } from '../../../../lib';
import { useBookingCalendarStore } from '../../../../model';
import { BookingEventCard } from '../BookingEventCard';

/**
 * WHY: Schedule reads a zone-less string in the host zone, so the Moscow wall clock is passed
 * as-is to draw the indicator at Moscow time.
 */
const getMoscowCurrentTime = () => {
    const now = getMoscowNow();

    return toDateTimeString(now.date, formatMinutes(now.minutes));
};

const renderEvent: NonNullable<WeekViewProps['renderEvent']> = (event, eventProps) => (
    <BookingEventCard event={event} eventProps={eventProps} />
);

const isCalendarView = (view: string): view is CalendarView =>
    view === CalendarView.Week || view === CalendarView.Month;

export const BookingSchedule = () => {
    const view = useBookingCalendarStore((state) => state.view);
    const date = useBookingCalendarStore((state) => state.date);
    const bookings = useBookingCalendarStore((state) => state.bookings);
    const setView = useBookingCalendarStore((state) => state.setView);
    const setDate = useBookingCalendarStore((state) => state.setDate);
    const goToToday = useBookingCalendarStore((state) => state.goToToday);
    const shiftPeriod = useBookingCalendarStore((state) => state.shiftPeriod);
    const openFromWeekSlot = useBookingCalendarStore((state) => state.openFromWeekSlot);
    const openFromMonthDay = useBookingCalendarStore((state) => state.openFromMonthDay);
    const [clockTick, setClockTick] = useState(0);
    const [isCalendarReady, setIsCalendarReady] = useState(false);

    useEffect(() => {
        const showCalendar = () => {
            setIsCalendarReady(true);
        };

        showCalendar();
    }, []);

    useEffect(() => {
        const refreshPastSlots = () => {
            setClockTick((tick) => tick + 1);
        };

        const timer = window.setInterval(refreshPastSlots, 60_000);

        return () => {
            window.clearInterval(timer);
        };
    }, []);

    const events: ScheduleEventData[] = bookings.map((booking) => ({
        id: booking.id,
        title: booking.title ?? `${booking.start}–${booking.end}`,
        start: toDateTimeString(booking.date, booking.start),
        end: toDateTimeString(booking.date, booking.end),
        color: 'blue' as const,
    }));

    /**
     * WHY: Schedule forwards shared click props to every view, and WeekView spreads
     * unknown handlers onto a DOM node. Keep each handler on the view that implements it.
     */
    const monthViewProps: Partial<MonthViewProps> = {
        consistentWeeks: true,
        firstDayOfWeek: 1 satisfies DayOfWeek,
        getDayProps: (day) => {
            void clockTick;
            const dayDate = toDateString(day);
            const now = getMoscowNow();

            if (!dayDate || dayDate < now.date || isWeekend(dayDate)) {
                return { style: { cursor: 'not-allowed' }, 'aria-disabled': true };
            }

            return {};
        },
        onDayClick: (day) => {
            const dayDate = toDateString(day);

            if (dayDate) {
                openFromMonthDay(dayDate);
            }
        },
        renderEvent,
        withHeader: false,
        withOutsideDays: true,
    };

    const weekViewProps: Partial<WeekViewProps> = {
        endTime: `${BookingConstraints.WorkEnd}:00`,
        firstDayOfWeek: 1,
        getCurrentTime: getMoscowCurrentTime,
        getTimeSlotProps: ({ start }) => {
            void clockTick;
            const slot = splitDateTime(start);

            if (
                !slot ||
                isWeekend(slot.date) ||
                isSlotInThePast(slot.date, slot.time, getMoscowNow())
            ) {
                return { style: { cursor: 'not-allowed' }, 'aria-disabled': true };
            }

            return {};
        },
        intervalMinutes: 30,
        onTimeSlotClick: ({ slotStart, slotEnd }) => openFromWeekSlot(slotStart, slotEnd),
        renderEvent,
        startTime: `${BookingConstraints.WorkStart}:00`,
        withAllDaySlots: false,
        withHeader: false,
        withWeekendDays: false,
    };

    return (
        <>
            <ScheduleHeader>
                <ScheduleHeader.Previous onClick={() => shiftPeriod('back')} />

                <ScheduleHeader.Control interactive={false} miw={180}>
                    {formatPeriodLabel(view, date)}
                </ScheduleHeader.Control>

                <ScheduleHeader.Next onClick={() => shiftPeriod('forward')} />

                <ScheduleHeader.Today onClick={goToToday} />

                <div style={{ marginInlineStart: 'auto' }}>
                    <ScheduleHeader.ViewSelect
                        onChange={(next) => {
                            if (isCalendarView(next)) {
                                setView(next);
                            }
                        }}
                        value={view}
                        views={[CalendarView.Week, CalendarView.Month]}
                    />
                </div>
            </ScheduleHeader>

            {isCalendarReady ? (
                <Schedule
                    date={date}
                    events={events}
                    layout="default"
                    monthViewProps={monthViewProps}
                    onDateChange={(next) => {
                        const nextDate = toDateString(next);

                        if (nextDate) {
                            setDate(nextDate);
                        }
                    }}
                    onViewChange={(next) => {
                        if (isCalendarView(next)) {
                            setView(next);
                        }
                    }}
                    view={view}
                    weekViewProps={weekViewProps}
                />
            ) : null}
        </>
    );
};
