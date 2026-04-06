/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tell Next.js App Router to treat Playwright packages as native Node.js
  // externals — do not attempt to bundle them through webpack
  experimental: {
    serverComponentsExternalPackages: [
      "playwright",
      "playwright-core",
      "playwright-extra",
      "puppeteer",
      "puppeteer-extra-plugin-stealth",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

module.exports = nextConfig;
