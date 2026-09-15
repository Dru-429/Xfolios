import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.microlink.io'
      },
      {
        protocol: 'https',
        hostname: 'iad.microlink.io'
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com'
      }
    ]
  }
};

export default nextConfig;
