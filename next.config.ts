import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
