import { Alert, Button, Group, Stack, TextInput } from '@mantine/core';
import { DatePickerInput, DateValue, TimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';

import {
    bookingIssueMessage,
    getMoscowNow,
    toBookingDraft,
    validateBookingTime,
} from '@/entities/Booking/model';
import { ISODateString, toDateString } from '@/shared/lib/datetimes';

import type { BookingFormSeed } from '../../../../lib';
import { useBookingCalendarStore } from '../../../../model';

interface BookingFormValues {
    title: string;
    date: ISODateString;
    start: string;
    end: string;
}

interface BookingDraftFormProps {
    mode: 'create' | 'edit';
    seed: BookingFormSeed;
}

export const BookingDraftForm = ({ mode, seed }: BookingDraftFormProps) => {
    const submitDraft = useBookingCalendarStore((state) => state.submitDraft);
    const submitStatus = useBookingCalendarStore((state) => state.submitStatus);
    const submitError = useBookingCalendarStore((state) => state.submitError);
    const closeDialog = useBookingCalendarStore((state) => state.closeDialog);

    const form = useForm<BookingFormValues>({
        initialValues: {
            title: seed.title,
            date: seed.date,
            start: seed.start,
            end: seed.end,
        },
        validate: (values) => {
            const issue = validateBookingTime(toBookingDraft(values), getMoscowNow());

            if (!issue) {
                return {};
            }

            return { form: bookingIssueMessage(issue) };
        },
    });

    const dateValueToString = (value: DateValue): ISODateString =>
        (value && toDateString(value)) || '';

    return (
        <form
            onSubmit={form.onSubmit(async (values) => {
                await submitDraft(toBookingDraft(values));
            })}
        >
            <Stack gap="md">
                {form.errors.form ? <Alert color="red">{form.errors.form}</Alert> : null}

                {submitError ? <Alert color="red">{submitError}</Alert> : null}

                <TextInput description="Optional" label="Title" {...form.getInputProps('title')} />

                <DatePickerInput
                    label="Date"
                    onChange={(value) => form.setFieldValue('date', dateValueToString(value))}
                    value={form.values.date}
                    valueFormat="D MMM YYYY"
                />

                <TimePicker
                    format="24h"
                    hoursInputLabel="Start hour"
                    label="Start"
                    minutesInputLabel="Start minutes"
                    onChange={(value) => form.setFieldValue('start', value)}
                    value={form.values.start}
                    withDropdown
                />

                <TimePicker
                    format="24h"
                    hoursInputLabel="End hour"
                    label="End"
                    minutesInputLabel="End minutes"
                    onChange={(value) => form.setFieldValue('end', value)}
                    value={form.values.end}
                    withDropdown
                />

                <Group justify="flex-end">
                    <Button
                        disabled={submitStatus === 'submitting'}
                        onClick={closeDialog}
                        type="button"
                        variant="default"
                    >
                        Cancel
                    </Button>

                    <Button loading={submitStatus === 'submitting'} type="submit">
                        {mode === 'create' ? 'Book' : 'Save changes'}
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
