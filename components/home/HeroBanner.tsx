"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { publicAssetUrl } from "@/lib/storage/public-url";
import { Container } from "@/components/layout/Container";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

export interface HeroBannerItem {
  id: string;
  image_path: string;
  alt_text: string;
  target_url: string | null;
}

/** The family homepage's hero carousel — real "approved banners" content, not a stock photo (see docs/ARCHITECTURE.md). */
export function HeroBanner({ banners }: { banners: HeroBannerItem[] }) {
  const [index, setIndex] = useState(0);
  const t = useTranslations("hero");

  useEffect(() => {
    if (banners.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(id);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[index];
  const image = (
    <Image
      key={banner.id}
      src={publicAssetUrl(banner.image_path)}
      alt={banner.alt_text}
      width={1600}
      height={600}
      priority
      className="aspect-[16/9] w-full object-cover md:aspect-[16/6]"
    />
  );

  return (
    <Container className="pt-4">
      <div className="relative overflow-hidden rounded-2xl">
        {banner.target_url ? <Link href={banner.target_url} className="block">{image}</Link> : image}

        {banners.length > 1 ? (
          <>
          <button
            type="button"
            aria-label={t("previousBanner")}
            onClick={() => setIndex((i) => (i - 1 + banners.length) % banners.length)}
            className="absolute top-1/2 left-3 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-[var(--shadow-sm)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={t("nextBanner")}
            onClick={() => setIndex((i) => (i + 1) % banners.length)}
            className="absolute top-1/2 right-3 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-[var(--shadow-sm)]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute right-0 bottom-3 left-0 z-10 flex justify-center gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b.id}
                aria-label={`${t("goToBanner")} ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full shadow-sm transition-all ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/65 hover:bg-white"}`}
              />
            ))}
          </div>
          </>
        ) : null}
      </div>
    </Container>
  );
}
