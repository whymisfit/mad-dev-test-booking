'use client';

import { Alert, Box, Button, LoadingOverlay, Stack, Text } from '@mantine/core';
import { useEffect } from 'react';

import { useBookingCalendarStore } from '../../model';
import classes from './BookingCalendar.module.css';
import { BookingFormModal, BookingSchedule, DeleteBookingModal } from './components';

export const BookingCalendar = () => {
    const loadStatus = useBookingCalendarStore((state) => state.loadStatus);
    const loadError = useBookingCalendarStore((state) => state.loadError);
    const loadBookings = useBookingCalendarStore((state) => state.loadBookings);

    useEffect(() => {
        const loadVisibleBookings = () => {
            void loadBookings();
        };

        loadVisibleBookings();
    }, [loadBookings]);

    return (
        <Stack gap="md">
            {loadStatus === 'error' && (
                <Alert color="red" title="Couldn't load bookings">
                    <Stack align="flex-start" gap="sm">
                        <Text>{loadError}</Text>

                        <Button
                            onClick={() => {
                                void loadBookings('replace');
                            }}
                            type="button"
                            variant="light"
                        >
                            Retry
                        </Button>
                    </Stack>
                </Alert>
            )}

            <Box className={classes.schedule}>
                <LoadingOverlay visible={loadStatus === 'loading'} />

                <BookingSchedule />
            </Box>

            <BookingFormModal />

            <DeleteBookingModal />
        </Stack>
    );
};
