import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { StoreProvider } from "@/providers/StoreProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { AdminStoreProvider } from "@/providers/AdminStoreProvider";
import { SiteShell } from "@/components/layout/SiteShell";
import { ToastViewport } from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const hind = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.orveenbazzar.com"),
  title: {
    default: "ORVEEN BAZZAR | নিত্যপ্রয়োজনীয় ও FMCG পণ্যের অনলাইন ক্যাটালগ",
    template: "%s | ORVEEN BAZZAR",
  },
  description:
    "ORVEEN BAZZAR.COM — RELIABLE MULTI PRODUCTS পরিচালিত বাংলাদেশভিত্তিক FMCG ক্যাটালগ প্ল্যাটফর্ম। ORVEEN, ECO FAST BD ও RELIABLE ব্র্যান্ডের পণ্য ও সেবার পরিচিতি।",
  keywords: [
    "ORVEEN BAZZAR",
    "RELIABLE MULTI PRODUCTS",
    "ECO FAST BD",
    "FMCG Bangladesh",
    "product catalog",
  ],
  alternates: { canonical: "/", languages: { bn: "/", en: "/" } },
  openGraph: {
    type: "website",
    siteName: "ORVEEN BAZZAR.COM",
    title: "ORVEEN BAZZAR | FMCG & Daily Essentials Catalog",
    description: "Reliable Quality • Trusted Service • Prosperous Future",
    url: "https://www.orveenbazzar.com",
    locale: "bn_BD",
    alternateLocale: ["en_US"],
  },
  twitter: { card: "summary", title: "ORVEEN BAZZAR", description: "Trusted FMCG catalog platform" },
  robots: { index: true, follow: true },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "RELIABLE MULTI PRODUCTS",
  alternateName: ["ORVEEN BAZZAR.COM", "ECO FAST BD"],
  url: "https://www.orveenbazzar.com",
  email: "orveenbazzar@gmail.com",
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+8801335189426",
      contactType: "customer service",
      availableLanguage: ["bn", "en"],
    },
  ],
  slogan: "Reliable Quality • Trusted Service • Prosperous Future",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn" className={`${inter.variable} ${hind.variable}`} suppressHydrationWarning>
      <body className="bg-[#F7F9FA] text-[#17242A] antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LanguageProvider>
          <AuthProvider>
            <StoreProvider>
              <AdminStoreProvider>
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[90] focus:rounded-xl focus:bg-[#075ED1] focus:px-4 focus:py-2 focus:text-white"
                >
                  Skip to content
                </a>
                <SiteShell>{children}</SiteShell>
                <ToastViewport />
              </AdminStoreProvider>
            </StoreProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
