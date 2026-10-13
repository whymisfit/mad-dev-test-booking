import { Box, Group, Title } from '@mantine/core';

import { BookButton } from '@/features/BookingCalendar/ui';

export const Header = () => (
    <Box component="header">
        <Group align="center" justify="space-between" wrap="wrap">
            <Title order={1} size="h3">
                Booking app
            </Title>

            <BookButton />
        </Group>
    </Box>
);
