import type { Metadata } from "next";
import { Geist_Mono, Baloo_Da_2, Anek_Bangla } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
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
 *
 * Dark/light mode isn't configured here — it's admin-only (see
 * lib/theme/AdminThemeProvider.tsx). That provider DOES toggle a `dark`
 * class on this `<html>` element (a global class is unavoidable — Base UI's
 * portal-based components, e.g. dropdown menus, mount outside whatever
 * subtree rendered them, so a class scoped to an inner wrapper never
 * reaches them), but only for as long as `AdminThemeProvider` is mounted,
 * which only happens inside `app/admin/layout.tsx` — leaving the admin
 * section unmounts it and removes the class, so the storefront (which
 * reuses some of the same shadcn primitives) never sees it.
 * `suppressHydrationWarning` is needed because the admin-only provider can
 * update this element's class after hydration when a saved theme is applied.
 *
 * LocaleProvider lives here (not in a nested layout) because the language
 * switcher now appears on three independent surfaces — the public site, the
 * standalone auth pages, and the admin dashboard — that share no other
 * common layout ancestor.
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${headingFont.variable} ${bodyFont.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-body">
        <LocaleProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
