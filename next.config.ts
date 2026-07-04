import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.vercel-storage.com" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Allow next-auth v4 with App Router
  },
};

export default nextConfig;
