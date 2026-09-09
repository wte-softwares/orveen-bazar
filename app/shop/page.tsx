"use client";

import { Suspense } from "react";
import { ShopView } from "@/components/product/ShopView";
import { ProductGridSkeleton } from "@/components/ui/core";
import { usePageTitle } from "@/providers/LanguageProvider";
import { useLanguage } from "@/providers/LanguageProvider";

function ShopInner() {
  const { t } = useLanguage();
  usePageTitle(t("shop.heading"), "Shop");
  return <ShopView />;
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8"><ProductGridSkeleton /></div>}>
      <ShopInner />
    </Suspense>
  );
}
