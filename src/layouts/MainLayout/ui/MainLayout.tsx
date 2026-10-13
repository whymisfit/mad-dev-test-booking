import { Box, Stack } from '@mantine/core';
import type { ReactNode } from 'react';

import { Header } from '@/widgets/Header/ui';

interface MainLayoutProps {
    children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => (
    <Stack gap="md" mih="100dvh" p="md">
        <Header />

        <Box component="main">{children}</Box>
    </Stack>
);
