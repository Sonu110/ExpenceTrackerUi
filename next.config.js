/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

// For Capacitor mobile builds, enable static export by setting
// CAPACITOR=true in your environment before running `next build`.
if (process.env.CAPACITOR === 'true') {
  nextConfig.output = 'export';
}

module.exports = nextConfig;
