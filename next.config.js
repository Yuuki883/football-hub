/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'upload.wikimedia.org',
      'tmssl.akamaized.net',
      'media.api-sports.io',
      'via.placeholder.com',
      'xpnextgtxaozdjqombiz.supabase.co',
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // クライアントサイドでは以下のモジュールを使わない
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
