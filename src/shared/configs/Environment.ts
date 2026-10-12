export const Environment = {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',

    isConsoleLoggingEnabled: process.env.NEXT_PUBLIC_IS_CONSOLE_LOGGING_ENABLED === '1',
};
