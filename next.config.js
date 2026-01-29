/** @type {import('next').NextConfig} */
/** @type {import('next').NextConfig} */
// const withPWA = require('next-pwa')({
//     dest: 'public',
//     register: true,
//     skipWaiting: true,
//     disable: process.env.NODE_ENV === 'development', // Disable in dev to avoid caching headaches, user can enable if needed
// });

const nextConfig = {
    reactStrictMode: true,

    // Production optimizations
    productionBrowserSourceMaps: false,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },

    // Optimize images
    images: {
        domains: ['localhost'],
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 60,
        unoptimized: true,
    },

    // Compression
    compress: true,

    // Webpack optimizations
    webpack: (config, { dev, isServer }) => {
        // Production optimizations
        if (!dev) {
            config.optimization = {
                ...config.optimization,
                minimize: true,
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        default: false,
                        vendors: false,
                        // Vendor chunk for node_modules
                        vendor: {
                            name: 'vendor',
                            chunks: 'all',
                            test: /node_modules/,
                            priority: 20,
                        },
                        // Common chunk for shared code
                        common: {
                            name: 'common',
                            minChunks: 2,
                            chunks: 'all',
                            priority: 10,
                            reuseExistingChunk: true,
                            enforce: true,
                        },
                    },
                },
            };
        }

        // Bundle analyzer (enable with ANALYZE=true env var)
        if (process.env.ANALYZE === 'true') {
            const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
            config.plugins.push(
                new BundleAnalyzerPlugin({
                    analyzerMode: 'static',
                    reportFilename: isServer
                        ? '../analyze/server.html'
                        : './analyze/client.html',
                    openAnalyzer: true,
                })
            );
        }

        return config;
    },

    // Headers for caching
    async headers() {
        return [
            {
                source: '/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/_next/image',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
    async rewrites() {
        const apiTarget = (process.env.API_PROXY_TARGET || 'http://localhost:5000').replace(/\/$/, '');
        return [
            {
                source: '/api/:path*',
                destination: `${apiTarget}/api/:path*`,
            },
            {
                source: '/uploads/:path*',
                destination: `${apiTarget}/uploads/:path*`,
            },
        ];
    },

    // Experimental features for performance
    experimental: {
        // optimizeCss: true, // Disabled to fix build error
        optimizePackageImports: [
            'react-icons',
            'lucide-react',
            '@googlemaps/js-api-loader',
        ],
    },

    // Output standalone for Docker deployment
    // output: 'standalone',
};

module.exports = nextConfig; // withPWA(nextConfig);
