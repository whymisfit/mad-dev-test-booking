import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    cacheComponents: true,
    partialPrefetching: true,
    experimental: {
        optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
    },
};

export default nextConfig;
