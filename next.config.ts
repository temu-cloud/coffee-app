import type { NextConfig } from "next";
import path from "path";

const shimPath = path.resolve('./src/lib/es-toolkit-get-shim.js')

const nextConfig: NextConfig = {
  transpilePackages: ['recharts'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  // Turbopack alias (Next.js 16 dev server)
  turbopack: {
    resolveAlias: {
      'es-toolkit/compat/get': shimPath,
    },
  },
  // Webpack alias (next build)
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      'es-toolkit/compat/get': shimPath,
    }
    return config
  },
};

export default nextConfig;
