/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable experimental features
    experimental: {
      // Enable server components
      serverComponentsExternalPackages: ['marked', 'prismjs'],
    },
    
    // Webpack configuration
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
      // Handle markdown files
      config.module.rules.push({
        test: /\.md$/,
        use: 'raw-loader',
      });
      
      // Handle Prism.js languages
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^\.\/locale$/,
          contextRegExp: /moment$/,
        })
      );
  
      return config;
    },
  
    // Headers for security and performance
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
            {
              key: 'Referrer-Policy',
              value: 'strict-origin-when-cross-origin',
            },
          ],
        },
        {
          source: '/sw.js',
          headers: [
            {
              key: 'Content-Type',
              value: 'application/javascript; charset=utf-8',
            },
            {
              key: 'Cache-Control',
              value: 'no-cache, no-store, must-revalidate',
            },
          ],
        },
      ];
    },
  
    // Performance optimizations
    compiler: {
      // Remove console logs in production
      removeConsole: process.env.NODE_ENV === 'production',
    },
  
    // Image optimization
    images: {
      formats: ['image/webp', 'image/avif'],
      dangerouslyAllowSVG: true,
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
  
    // PWA configuration (if adding PWA features)
    async rewrites() {
      return [
        {
          source: '/manifest.json',
          destination: '/api/manifest',
        },
      ];
    },
  
    // Build output configuration
    output: 'standalone',
    
    // Environment variables
    env: {
      CUSTOM_KEY: process.env.CUSTOM_KEY,
    },
    
    // TypeScript configuration
    typescript: {
      // Dangerously allow production builds to successfully complete even if
      // your project has TypeScript type errors.
      ignoreBuildErrors: false,
    },
    
    // ESLint configuration
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: false,
    },
    
    // Internationalization (if needed)
    // i18n: {
    //   locales: ['en', 'es', 'fr'],
    //   defaultLocale: 'en',
    // },
    
    // Redirects and rewrites for better SEO
    async redirects() {
      return [
        // Add redirects here if needed
      ];
    },
  };
  
  module.exports = nextConfig;