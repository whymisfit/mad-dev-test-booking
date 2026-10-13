import { BookingConstraints } from './bookingConstraints';

export const BookingIssue = {
    InvalidValue: 'invalid-value',
    Past: 'past',
    Weekend: 'weekend',
    OutsideWorkingHours: 'outside-working-hours',
    InvalidRange: 'invalid-range',
    TooShort: 'too-short',
    TooLong: 'too-long',
    Conflict: 'conflict',
    NotFound: 'not-found',
    PastEdit: 'past-edit',
    PastDelete: 'past-delete',
} as const;

export type BookingIssue = (typeof BookingIssue)[keyof typeof BookingIssue];

export const bookingIssueMessage = (issue: BookingIssue): string => {
    switch (issue) {
        case BookingIssue.InvalidValue:
            return 'Enter a valid date and time.';
        case BookingIssue.Past:
            return "You can't book a meeting room in the past.";
        case BookingIssue.Weekend:
            return 'Bookings are not available on weekends.';
        case BookingIssue.OutsideWorkingHours:
            return `Bookings are available from ${BookingConstraints.WorkStart} to ${BookingConstraints.WorkEnd}.`;
        case BookingIssue.InvalidRange:
            return 'End time must be after the start time.';
        case BookingIssue.TooShort:
            return `A booking must be at least ${BookingConstraints.MinDurationMinutes} minutes.`;
        case BookingIssue.TooLong:
            return `A booking cannot be longer than ${BookingConstraints.MaxDurationMinutes / 60} hours.`;
        case BookingIssue.Conflict:
            return 'This time is already booked.';
        case BookingIssue.NotFound:
            return 'This booking has already been deleted.';
        case BookingIssue.PastEdit:
            return "You can't edit a booking in the past.";
        case BookingIssue.PastDelete:
            return "You can't delete a booking in the past.";
    }
};
