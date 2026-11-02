/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.kasper.ae' },
      { protocol: 'https', hostname: '**.s3.**' },
    ],
  },
};

module.exports = nextConfig;
