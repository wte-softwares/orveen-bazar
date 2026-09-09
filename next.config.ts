import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Prefer modern formats; Next negotiates per request via the Accept header.
    formats: ["image/avif", "image/webp"],
    // Allowed `quality` values for <Image quality=…>; keeps the optimiser cache bounded.
    qualities: [50, 65, 75, 90],
    // Cache optimised responses for a day at the edge.
    minimumCacheTTL: 60 * 60 * 24,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
};

export default nextConfig;
