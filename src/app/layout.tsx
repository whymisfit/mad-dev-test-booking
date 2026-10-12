import type { Metadata } from 'next';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';

export const metadata: Metadata = {
    title: 'Booking app',
    description: 'Application for booking conversation room',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <ColorSchemeScript />
            </head>

            <body>
                <MantineProvider>{children}</MantineProvider>
            </body>
        </html>
    );
}
