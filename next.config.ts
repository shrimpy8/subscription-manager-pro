import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingRoot: __dirname,
  experimental: {
    turbo: {
      root: __dirname,
    },
  },
};

export default nextConfig;
