/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Vercel画像最適化を無効化（402エラー対策）
    unoptimized: true,
    domains: [
      'upload.wikimedia.org',
      'tmssl.akamaized.net',
      'media.api-sports.io',
      'via.placeholder.com',
      'xpnextgtxaozdjqombiz.supabase.co',
    ],
  },
  // 一時的にTypeScriptのビルド時チェックを無効化
  typescript: {
    ignoreBuildErrors: true,
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
