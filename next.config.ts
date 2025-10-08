import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.airalo.com",
      },
      {
        protocol: "https",
        hostname: "nigerianbanks.xyz",
      },
    ],
  },
};

export default nextConfig;
