import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { marketingImages } from "@/lib/images";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { StoreProvider } from "@/providers/StoreProvider";
import { TopBar } from "@/components/layout/TopBar";
import { Header } from "@/components/layout/Header";
import { DesktopNavigation } from "@/components/layout/Navigation";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { QuickView } from "@/components/product/QuickView";
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
    default: "ORVEEN BAZZAR | নিত্যপ্রয়োজনীয় ও FMCG পণ্যের অনলাইন শপ",
    template: "%s | ORVEEN BAZZAR",
  },
  description:
    "ORVEEN BAZZAR.COM — RELIABLE MULTI PRODUCTS পরিচালিত বাংলাদেশভিত্তিক FMCG ও নিত্যপ্রয়োজনীয় পণ্যের অনলাইন শপ। FMCG & daily essentials online shop from Bangladesh by RELIABLE MULTI PRODUCTS.",
  keywords: [
    "ORVEEN BAZZAR",
    "RELIABLE MULTI PRODUCTS",
    "ECO FAST BD",
    "FMCG Bangladesh",
    "সয়াবিন তেল",
    "চাল",
    "ডিটারজেন্ট",
    "online grocery Bangladesh",
  ],
  alternates: {
    canonical: "/",
    languages: { bn: "/", en: "/" },
  },
  openGraph: {
    type: "website",
    siteName: "ORVEEN BAZZAR.COM",
    title: "ORVEEN BAZZAR | নিত্যপ্রয়োজনীয় ও FMCG পণ্যের অনলাইন শপ",
    description:
      "Reliable Quality • Trusted Service • Prosperous Future — FMCG & daily essentials online shop from Bangladesh.",
    url: "https://www.orveenbazzar.com",
    locale: "bn_BD",
    alternateLocale: ["en_US"],
    images: [
      {
        url: marketingImages.heroStaples.src,
        width: marketingImages.heroStaples.width,
        height: marketingImages.heroStaples.height,
        alt: "ORVEEN BAZZAR — everyday grocery staples",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ORVEEN BAZZAR | FMCG & Daily Essentials Online Shop",
    description: "Reliable Quality • Trusted Service • Prosperous Future",
    images: [marketingImages.heroStaples.src],
  },
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
      <body className="bg-[#F5F8FE] text-[#17242A] antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LanguageProvider>
          <StoreProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[90] focus:rounded-xl focus:bg-[#1D4ED8] focus:px-4 focus:py-2 focus:text-white"
            >
              Skip to content
            </a>
            <TopBar />
            <Header />
            <DesktopNavigation />
            <main id="main-content">{children}</main>
            <Footer />
            <MobileNavigation />
            <CartDrawer />
            <QuickView />
            <ToastViewport />
            <WhatsAppButton />
          </StoreProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
