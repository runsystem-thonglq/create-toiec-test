/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    assetPrefix: "/toeic",
  },
  basePath: "/toeic",
  output: "standalone",
};

module.exports = nextConfig;
