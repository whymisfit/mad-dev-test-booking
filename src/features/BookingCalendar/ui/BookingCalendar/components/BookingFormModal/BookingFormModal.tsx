'use client';

import { Button, Modal, Stack, Text } from '@mantine/core';

import { useBookingCalendarStore } from '../../../../model';
import { BookingDraftForm } from '../BookingDraftForm';

export const BookingFormModal = () => {
    const dialog = useBookingCalendarStore((state) => state.dialog);
    const closeDialog = useBookingCalendarStore((state) => state.closeDialog);
    const openNextWorkingDayForm = useBookingCalendarStore((state) => state.openNextWorkingDayForm);

    const title =
        dialog.type === 'unavailable'
            ? 'Booking unavailable'
            : dialog.type === 'form' && dialog.mode === 'edit'
              ? 'Edit booking'
              : 'Book a room';

    return (
        <Modal onClose={closeDialog} opened={dialog.type !== 'closed'} title={title}>
            {dialog.type === 'unavailable' ? (
                <Stack gap="md">
                    <Text>
                        You can&apos;t book a meeting room at this time. You can book the next
                        working day.
                    </Text>
                    <Button onClick={openNextWorkingDayForm} type="button">
                        Book for the next day
                    </Button>
                </Stack>
            ) : null}

            {dialog.type === 'form' ? (
                <BookingDraftForm
                    key={`${dialog.mode}-${dialog.seed.id ?? 'new'}-${dialog.seed.date}-${dialog.seed.start}-${dialog.seed.end}`}
                    mode={dialog.mode}
                    seed={dialog.seed}
                />
            ) : null}
        </Modal>
    );
};
