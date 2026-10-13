'use client';

import { Alert, Button, Group, Modal, Stack, Text } from '@mantine/core';

import { formatDeleteQuestion } from '../../../../lib';
import { useBookingCalendarStore } from '../../../../model';

export const DeleteBookingModal = () => {
    const deleteTarget = useBookingCalendarStore((state) => state.deleteTarget);
    const submitStatus = useBookingCalendarStore((state) => state.submitStatus);
    const submitError = useBookingCalendarStore((state) => state.submitError);
    const confirmDelete = useBookingCalendarStore((state) => state.confirmDelete);
    const cancelDelete = useBookingCalendarStore((state) => state.cancelDelete);

    return (
        <Modal onClose={cancelDelete} opened={Boolean(deleteTarget)} title="Delete this booking?">
            <Stack gap="md">
                {submitError ? <Alert color="red">{submitError}</Alert> : null}
                <Text>{deleteTarget ? formatDeleteQuestion(deleteTarget) : ''}</Text>
                <Group justify="flex-end">
                    <Button
                        disabled={submitStatus === 'submitting'}
                        onClick={cancelDelete}
                        type="button"
                        variant="default"
                    >
                        Cancel
                    </Button>
                    <Button
                        color="red"
                        loading={submitStatus === 'submitting'}
                        onClick={() => {
                            void confirmDelete();
                        }}
                        type="button"
                    >
                        Delete
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
};
