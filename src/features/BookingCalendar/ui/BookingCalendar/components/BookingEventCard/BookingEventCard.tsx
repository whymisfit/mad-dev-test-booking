'use client';

import { Button, Group, HoverCard, Stack, Text, UnstyledButton } from '@mantine/core';
import type { ScheduleEventData, WeekViewProps } from '@mantine/schedule';

import { getMoscowNow, isBookingStarted } from '@/entities/Booking/model';

import { formatBookingWhen } from '../../../../lib';
import { useBookingCalendarStore } from '../../../../model';

type EventProps = Parameters<NonNullable<WeekViewProps['renderEvent']>>[1];

export const BookingEventCard = ({
    event,
    eventProps,
}: {
    event: ScheduleEventData;
    eventProps: EventProps;
}) => {
    const openEdit = useBookingCalendarStore((state) => state.openEdit);
    const requestDelete = useBookingCalendarStore((state) => state.requestDelete);
    const booking = useBookingCalendarStore((state) =>
        state.bookings.find((item) => item.id === event.id),
    );
    const { children, style, ...buttonProps } = eventProps;
    const eventStyle = { ...style, pointerEvents: 'auto' as const };

    if (!booking) {
        return (
            <UnstyledButton {...buttonProps} style={eventStyle} type="button">
                {children}
            </UnstyledButton>
        );
    }

    const started = isBookingStarted(booking, getMoscowNow());

    return (
        <HoverCard
            closeDelay={200}
            openDelay={80}
            position="bottom-start"
            shadow="md"
            withArrow
            withinPortal
        >
            <HoverCard.Target>
                <UnstyledButton {...buttonProps} style={eventStyle} type="button">
                    {children}
                </UnstyledButton>
            </HoverCard.Target>

            <HoverCard.Dropdown>
                <Stack gap="xs">
                    {booking.title && <Text fw={600}>{booking.title}</Text>}

                    <Text size="sm">
                        {formatBookingWhen(booking.date, booking.start, booking.end)}
                    </Text>

                    {started ? null : (
                        <Group gap="xs">
                            <Button
                                onClick={() => openEdit(booking)}
                                size="xs"
                                type="button"
                                variant="light"
                            >
                                Edit
                            </Button>

                            <Button
                                color="red"
                                onClick={() => requestDelete(booking)}
                                size="xs"
                                type="button"
                                variant="light"
                            >
                                Delete
                            </Button>
                        </Group>
                    )}
                </Stack>
            </HoverCard.Dropdown>
        </HoverCard>
    );
};
