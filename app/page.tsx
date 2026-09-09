"use client";

import {
  HeroSection,
  TrustBar,
  CategoryShowcase,
  FeaturedProducts,
  WhyChooseUs,
  AboutPreview,
  DealerCTA,
  PromoBanner,
  Newsletter,
} from "@/components/home/sections";
import { usePageTitle } from "@/providers/LanguageProvider";

export default function HomePage() {
  usePageTitle(
    "ORVEEN BAZZAR | নিত্যপ্রয়োজনীয় ও FMCG পণ্যের অনলাইন শপ",
    "ORVEEN BAZZAR | FMCG & Daily Essentials Online Shop",
  );

  return (
    <>
      <HeroSection />
      <TrustBar />
      <CategoryShowcase />
      <FeaturedProducts />
      <PromoBanner />
      <WhyChooseUs />
      <AboutPreview />
      <DealerCTA />
      <Newsletter />
    </>
  );
}
