/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // regeneratorRuntime polyfill
    config.resolve.alias = {
      ...config.resolve.alias,
      'regenerator-runtime': require.resolve('regenerator-runtime'),
    };
    
    return config;
  },
};

module.exports = nextConfig; 