import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@devops-academy/shared"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
