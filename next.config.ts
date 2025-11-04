/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.twilio.com',
      },
      {
        protocol: 'https',
        hostname: '*.twilio.com',
      },
    ],
  },
}

module.exports = nextConfig