/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    assetPrefix: "/toeic",
  },
  output: "standalone",
};

module.exports = nextConfig;
