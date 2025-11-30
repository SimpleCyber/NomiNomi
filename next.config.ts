import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.tenor.com",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
      },
      {
        protocol: "https",
        hostname: "gateway.pinata.cloud",
      },
      {
        protocol: "https",
        hostname: "*.ipfs.w3s.link",
      },
      {
        protocol: "https",
        hostname: "images.pump.fun",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
    ],
  },
};

export default nextConfig;
