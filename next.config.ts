import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['*.trycloudflare.com', '172.16.0.55'],
};

export default nextConfig;
