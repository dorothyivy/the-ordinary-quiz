/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['theordinary.com'],
    unoptimized: true,
  },
};

module.exports = nextConfig;
