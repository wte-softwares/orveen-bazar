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
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "54521", pathname: "/storage/v1/object/public/**" },
      ...(supabaseStorageHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseStorageHostname,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
    // Next 16 blocks image URLs that resolve to a private IP by default
    // (an SSRF hardening measure) — 127.0.0.1 is exactly that, so local
    // Supabase Storage needs this explicit opt-in. Safe here specifically
    // because it's gated to development: production talks to the hosted
    // project's real public hostname (the remotePattern above), never a
    // private IP, so this flag has no effect there.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
