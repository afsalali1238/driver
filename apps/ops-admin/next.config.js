/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.kasper.ae' },
      { protocol: 'https', hostname: '**.s3.**' },
    ],
  },
};

module.exports = nextConfig;