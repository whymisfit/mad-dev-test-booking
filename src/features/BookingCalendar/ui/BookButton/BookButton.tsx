'use client';

import { Button } from '@mantine/core';

import { PlusIcon } from '@/shared/icons/PlusIcon';

import { useBookingCalendarStore } from '../../model';

export const BookButton = () => {
    const openFromBookButton = useBookingCalendarStore((state) => state.openFromBookButton);

    return (
        <Button leftSection={<PlusIcon />} onClick={openFromBookButton} type="button">
            Book
        </Button>
    );
};
