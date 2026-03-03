/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',      // UploadThing
      },
      {
        protocol: 'https',
        hostname: 'livekit.io',
      },
    ],
  },
  // Silence the Turbopack warning — empty config tells Next.js "I know I'm using Turbopack"
  turbopack: {},
};

module.exports = nextConfig;