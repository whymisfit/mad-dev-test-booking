import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/schedule/styles.css';

import {
    ColorSchemeScript,
    type MantineColorScheme,
    mantineHtmlProps,
    MantineProvider,
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import type { Metadata } from 'next';

import { MainLayout } from '@/layouts/MainLayout/ui';

export const metadata: Metadata = {
    title: 'Booking app',
    description: 'Application for booking conversation room',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    const defaultMantineTheme: MantineColorScheme = 'light';

    return (
        <html lang="en" {...mantineHtmlProps}>
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <ColorSchemeScript defaultColorScheme={defaultMantineTheme} />
            </head>

            <body>
                <MantineProvider defaultColorScheme={defaultMantineTheme}>
                    <Notifications position="top-right" />
                    <MainLayout>{children}</MainLayout>
                </MantineProvider>
            </body>
        </html>
    );
}
