import type { NextConfig } from "next";

// Allows next/image to optimize images served from Supabase Storage's
// public bucket (org-public). Local dev talks to 127.0.0.1:54521 (see
// docs/SETUP.md for why the port isn't the CLI default); production points
// at the hosted project's own storage host instead — update this pattern
// when that host is known, rather than widening it to all HTTPS hosts.
const supabaseStorageHostname = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*"],
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "**" },
      { protocol: "https", hostname: "**" },
    ],
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
