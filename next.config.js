/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Ensure NEXTAUTH_SECRET is always available at build time
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? 'build-time-placeholder-secret',
  },
}

module.exports = nextConfig
