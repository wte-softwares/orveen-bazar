import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Default metadata for the whole app. Individual route groups (public site,
// admin) override `title`/`description` via their own `generateMetadata` or
// static `metadata` exports as pages are built out in later phases.
export const metadata: Metadata = {
  title: {
    default: "ORVEEN BAZAR",
    template: "%s · ORVEEN BAZAR",
  },
  description:
    "Catalog platform for ORVEEN BAZAR, ECO FAST BD and RELIABLE MULTI PRODUCTS.",
};

/**
 * Root layout. Deliberately thin: it only sets up fonts, global CSS, and the
 * cross-cutting shadcn TooltipProvider. The public site and admin area each
 * get their own nested layout (header/footer vs. dashboard shell) under
 * `app/(public)/layout.tsx` and `app/admin/layout.tsx` respectively, so this
 * file never grows a bunch of route-specific chrome over time.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
