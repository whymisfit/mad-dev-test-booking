export const BookingConstraints = {
    WorkStart: '09:00',
    WorkEnd: '18:00',
    WorkStartMinutes: 9 * 60,
    WorkEndMinutes: 18 * 60,
    MinDurationMinutes: 30,
    MaxDurationMinutes: 2 * 60,
} as const;
