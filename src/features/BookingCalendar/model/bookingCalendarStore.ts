'use client';

import { NotificationData, notifications } from '@mantine/notifications';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

import {
    BookingErrorCode,
    type BookingRepository,
    HttpBookingRepository,
} from '@/entities/Booking/api';
import {
    type Booking,
    type BookingDraft,
    BookingIssue,
    bookingIssueMessage,
    getMoscowNow,
    isBookingStarted,
    toBookingDraft,
} from '@/entities/Booking/model';
import { ApiError } from '@/shared/api/ApiError';
import { httpClient } from '@/shared/api/httpClient';
import type { ISODateString } from '@/shared/lib/datetimes';

import {
    type BookingEntry,
    type BookingFormSeed,
    CalendarView,
    entryFromBookButton,
    entryFromMonthDay,
    entryFromWeekSlot,
    formatCreatedMessage,
    getVisibleRange,
    shiftAnchorDate,
} from '../lib';

export type SubmitResult = 'created' | 'updated' | 'error';

export type BookingDialogState =
    | { type: 'closed' }
    | { type: 'unavailable'; seed: BookingFormSeed }
    | { type: 'form'; mode: 'create' | 'edit'; seed: BookingFormSeed };

interface BookingCalendarData {
    view: CalendarView;
    date: ISODateString;
    bookings: Booking[];
    loadStatus: 'loading' | 'ready' | 'error';
    loadError: string | null;
    dialog: BookingDialogState;
    submitStatus: 'idle' | 'submitting';
    submitError: string | null;
    deleteTarget: Booking | null;
}

interface BookingCalendarActions {
    setView: (view: CalendarView) => void;
    setDate: (date: ISODateString) => void;
    goToToday: () => void;
    shiftPeriod: (direction: 'back' | 'forward') => void;
    loadBookings: (mode?: 'replace' | 'refresh') => Promise<void>;
    openFromBookButton: () => void;
    openFromWeekSlot: (slotStart: string, slotEnd: string) => void;
    openFromMonthDay: (date: ISODateString) => void;
    openNextWorkingDayForm: () => void;
    openEdit: (booking: Booking) => void;
    closeDialog: () => void;
    submitDraft: (draft: BookingDraft) => Promise<SubmitResult>;
    requestDelete: (booking: Booking) => void;
    confirmDelete: () => Promise<void>;
    cancelDelete: () => void;
}

export type BookingCalendarState = BookingCalendarData & BookingCalendarActions;

const loadErrorMessage = (error: unknown): string => {
    if (error instanceof ApiError && error.message) {
        return error.message;
    }

    return "Couldn't load bookings.";
};

const saveErrorMessage = (error: unknown): string => {
    if (error instanceof ApiError && error.message) {
        return error.message;
    }

    return "Couldn't save the booking.";
};

/**
 * WHY: A module singleton is shared across requests during SSR.
 * Bookings are loaded from an effect after mount, never during render.
 */
export const createBookingCalendarStore = (
    repository: BookingRepository = new HttpBookingRepository(httpClient),
) => {
    /**
     * WHY: A slower list response for the previous range must not overwrite
     * bookings for the range the user is looking at now.
     */
    let previousListAbortController: AbortController | null = null;

    const showEntry = (
        set: (partial: Partial<BookingCalendarData>) => void,
        entry: BookingEntry | null,
    ) => {
        if (!entry) {
            return;
        }

        set({
            dialog:
                entry.type === 'unavailable'
                    ? { type: 'unavailable', seed: entry.seed }
                    : { type: 'form', mode: 'create', seed: entry.seed },
            deleteTarget: null,
            submitError: null,
            submitStatus: 'idle',
        });
    };

    const showSuccessNotice = (
        title: string,
        booking: BookingDraft,
        color: NotificationData['color'] = 'blue',
    ) => {
        notifications.show({
            title,
            message: formatCreatedMessage(booking),
            color,
        });
    };

    return createStore<BookingCalendarState>()((set, get) => ({
        view: CalendarView.Week,
        date: getMoscowNow().date,
        bookings: [],
        loadStatus: 'loading',
        loadError: null,
        dialog: { type: 'closed' },
        submitStatus: 'idle',
        submitError: null,
        deleteTarget: null,

        setView: (view) => {
            if (get().view === view) {
                return;
            }

            set({ view, bookings: [], loadStatus: 'loading', loadError: null });

            void get().loadBookings('refresh');
        },

        setDate: (date) => {
            if (get().date === date) {
                return;
            }

            set({ date, bookings: [], loadStatus: 'loading', loadError: null });

            void get().loadBookings('refresh');
        },

        goToToday: () => {
            get().setDate(getMoscowNow().date);
        },

        shiftPeriod: (direction) => {
            get().setDate(shiftAnchorDate(get().date, get().view, direction));
        },

        loadBookings: async (mode = 'replace') => {
            previousListAbortController?.abort();

            const controller = new AbortController();
            previousListAbortController = controller;

            const range = getVisibleRange(get().view, get().date);

            if (mode === 'replace') {
                set({ loadStatus: 'loading', loadError: null });
            }

            try {
                const bookings = await repository.list(range.from, range.to, controller.signal);

                if (controller.signal.aborted) {
                    return;
                }

                set({ bookings, loadStatus: 'ready', loadError: null });
            } catch (error) {
                if (controller.signal.aborted) {
                    return;
                }

                set({ loadStatus: 'error', loadError: loadErrorMessage(error) });
            }
        },

        openFromBookButton: () => {
            showEntry(set, entryFromBookButton(getMoscowNow()));
        },

        openFromWeekSlot: (slotStart, slotEnd) => {
            showEntry(set, entryFromWeekSlot(slotStart, slotEnd, getMoscowNow()));
        },

        openFromMonthDay: (date) => {
            showEntry(set, entryFromMonthDay(date, getMoscowNow()));
        },

        openNextWorkingDayForm: () => {
            const dialog = get().dialog;

            if (dialog.type !== 'unavailable') {
                return;
            }

            set({
                dialog: { type: 'form', mode: 'create', seed: dialog.seed },
                deleteTarget: null,
                submitError: null,
                submitStatus: 'idle',
            });
        },

        openEdit: (booking) => {
            if (isBookingStarted(booking, getMoscowNow())) {
                return;
            }

            set({
                dialog: {
                    type: 'form',
                    mode: 'edit',
                    seed: {
                        id: booking.id,
                        date: booking.date,
                        start: booking.start,
                        end: booking.end,
                        title: booking.title ?? '',
                    },
                },
                submitError: null,
                submitStatus: 'idle',
                deleteTarget: null,
            });
        },

        closeDialog: () => {
            if (get().submitStatus === 'submitting') {
                return;
            }

            set({ dialog: { type: 'closed' }, submitError: null });
        },

        submitDraft: async (draft) => {
            const dialog = get().dialog;

            if (dialog.type !== 'form') {
                return 'error';
            }

            const normalizedBookingDraft = toBookingDraft(draft);

            set({ submitStatus: 'submitting', submitError: null });

            try {
                if (dialog.mode === 'edit') {
                    if (!dialog.seed.id) {
                        throw new ApiError(
                            bookingIssueMessage(BookingIssue.NotFound),
                            404,
                            BookingErrorCode.NotFound,
                        );
                    }

                    await repository.update(dialog.seed.id, normalizedBookingDraft);

                    set({ dialog: { type: 'closed' }, submitStatus: 'idle', submitError: null });

                    showSuccessNotice('Meeting room updated', normalizedBookingDraft);

                    await get().loadBookings('refresh');

                    return 'updated';
                }

                await repository.create(normalizedBookingDraft);

                set({
                    dialog: { type: 'closed' },
                    submitStatus: 'idle',
                    submitError: null,
                });

                showSuccessNotice('Meeting room booked', normalizedBookingDraft, 'green');

                await get().loadBookings('refresh');

                return 'created';
            } catch (error) {
                set({ submitStatus: 'idle', submitError: saveErrorMessage(error) });

                await get().loadBookings('refresh');

                return 'error';
            }
        },

        requestDelete: (booking) => {
            if (isBookingStarted(booking, getMoscowNow())) {
                return;
            }

            set({
                deleteTarget: booking,
                dialog: { type: 'closed' },
                submitError: null,
                submitStatus: 'idle',
            });
        },

        confirmDelete: async () => {
            const target = get().deleteTarget;

            if (!target) {
                return;
            }

            set({ submitStatus: 'submitting', submitError: null });

            try {
                await repository.delete(target.id);

                set({ deleteTarget: null, submitStatus: 'idle', submitError: null });

                showSuccessNotice('Meeting room deleted', target, 'red');

                await get().loadBookings('refresh');
            } catch (error) {
                set({ submitStatus: 'idle', submitError: saveErrorMessage(error) });

                await get().loadBookings('refresh');
            }
        },

        cancelDelete: () => {
            if (get().submitStatus === 'submitting') {
                return;
            }

            set({ deleteTarget: null, submitError: null });
        },
    }));
};

export const bookingCalendarStore = createBookingCalendarStore();

export const useBookingCalendarStore = <Selected>(
    selector: (state: BookingCalendarState) => Selected,
): Selected => useStore(bookingCalendarStore, selector);
