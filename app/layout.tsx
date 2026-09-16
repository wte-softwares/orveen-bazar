import type { Metadata } from "next";
import { Geist_Mono, Baloo_Da_2, Anek_Bangla } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

// The client's design system pairs a Bengali-script display face for
// headings with a Bengali-script text face for body copy — both are real
// Google Fonts families (the "Da 2" / "Bangla" variants specifically carry
// Bengali glyph coverage, unlike the base "Baloo 2"/"Anek" families).
const headingFont = Baloo_Da_2({
  variable: "--font-heading",
  subsets: ["latin", "bengali"],
  weight: ["500", "600", "700", "800"],
});

const bodyFont = Anek_Bangla({
  variable: "--font-body",
  subsets: ["latin", "bengali"],
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
      className={`${headingFont.variable} ${bodyFont.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-body">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
