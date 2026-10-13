'use client';

import { Button, Group, HoverCard, Popover, Stack, Text, UnstyledButton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import type { ScheduleEventData, WeekViewProps } from '@mantine/schedule';
import { useState } from 'react';

import { getMoscowNow, isBookingStarted } from '@/entities/Booking/model';

import { formatBookingWhen } from '../../../../lib';
import { useBookingCalendarStore } from '../../../../model';

type EventProps = Parameters<NonNullable<WeekViewProps['renderEvent']>>[1];

interface BookingEventCardProps {
    event: ScheduleEventData;
    eventProps: EventProps;
}

const isModActive = (mod: unknown, key: string): boolean => {
    if (Array.isArray(mod)) {
        return mod.some((item) => isModActive(item, key));
    }

    if (!mod || typeof mod !== 'object') {
        return false;
    }

    return Boolean((mod as Record<string, unknown>)[key]);
};

export const BookingEventCard = ({ event, eventProps }: BookingEventCardProps) => {
    const openEdit = useBookingCalendarStore((state) => state.openEdit);
    const requestDelete = useBookingCalendarStore((state) => state.requestDelete);
    const booking = useBookingCalendarStore((state) =>
        state.bookings.find((item) => item.id === event.id),
    );
    const [opened, setOpened] = useState(false);

    /**
     * WHY: HoverCard's touch event opens and closes on the same tap, so a press
     * cannot reach the actions. Devices without hover open the card on press instead.
     */
    const opensOnPress = useMediaQuery('(hover: none)', false, {
        getInitialValueInEffect: false,
    });

    const { children, style, onClick, ...buttonProps } = eventProps;

    const mod = 'mod' in eventProps ? eventProps.mod : undefined;
    const anyDragging = isModActive(mod, 'any-dragging');
    const dragging = isModActive(mod, 'dragging');

    /**
     * WHY: Schedule drops land on the slot under the pointer. An event with pointer events
     * would hide that slot, so every card lets the drag through once a move has started.
     */
    const eventStyle = {
        ...style,
        cursor: dragging ? 'grabbing' : buttonProps.draggable ? 'grab' : style?.cursor,
        pointerEvents: anyDragging ? ('none' as const) : ('auto' as const),
    };

    const handleTargetClick: NonNullable<typeof onClick> = (clickEvent) => {
        onClick?.(clickEvent);

        if (!opensOnPress || anyDragging) {
            return;
        }

        setOpened((current) => !current);
    };

    if (!booking) {
        return (
            <UnstyledButton
                {...buttonProps}
                onClick={handleTargetClick}
                style={eventStyle}
                type="button"
            >
                {children}
            </UnstyledButton>
        );
    }

    const started = isBookingStarted(booking, getMoscowNow());
    const hiddenWhileDragging = anyDragging
        ? { pointerEvents: 'none' as const, visibility: 'hidden' as const }
        : undefined;

    const target = (
        <UnstyledButton
            {...buttonProps}
            onClick={handleTargetClick}
            style={eventStyle}
            type="button"
        >
            {children}
        </UnstyledButton>
    );

    const details = (
        <Stack gap="xs">
            {booking.title && <Text fw={600}>{booking.title}</Text>}

            <Text size="sm">{formatBookingWhen(booking.date, booking.start, booking.end)}</Text>

            {started ? null : (
                <Group gap="xs">
                    <Button
                        onClick={() => {
                            setOpened(false);
                            openEdit(booking);
                        }}
                        size="xs"
                        type="button"
                        variant="light"
                    >
                        Edit
                    </Button>

                    <Button
                        color="red"
                        onClick={() => {
                            setOpened(false);
                            requestDelete(booking);
                        }}
                        size="xs"
                        type="button"
                        variant="light"
                    >
                        Delete
                    </Button>
                </Group>
            )}
        </Stack>
    );

    if (opensOnPress) {
        return (
            <Popover
                onChange={setOpened}
                opened={opened}
                position="bottom-start"
                shadow="md"
                withArrow
                withinPortal
            >
                <Popover.Target>{target}</Popover.Target>
                <Popover.Dropdown style={hiddenWhileDragging}>{details}</Popover.Dropdown>
            </Popover>
        );
    }

    return (
        <HoverCard
            closeDelay={200}
            events={{ focus: !anyDragging, hover: !anyDragging, touch: false }}
            openDelay={80}
            position="bottom-start"
            shadow="md"
            withArrow
            withinPortal
        >
            <HoverCard.Target>{target}</HoverCard.Target>
            <HoverCard.Dropdown style={hiddenWhileDragging}>{details}</HoverCard.Dropdown>
        </HoverCard>
    );
};
