"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { publicAssetUrl } from "@/lib/storage/public-url";
import { Container } from "@/components/layout/Container";
import { useTranslations } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

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

  return (
    <Container className="pt-4">
      <div className="relative overflow-hidden rounded-2xl aspect-[16/9] md:aspect-[16/6]">
        {banners.map((item, i) => {
          const isCurrent = i === index;
          const slideImage = (
            <Image
              src={publicAssetUrl(item.image_path)}
              alt={item.alt_text}
              width={1600}
              height={600}
              priority={i === 0}
              className="h-full w-full object-cover"
            />
          );

          return (
            <div
              key={item.id}
              className={cn(
                "absolute inset-0 h-full w-full transition-opacity duration-700 ease-in-out",
                isCurrent ? "opacity-100 z-0 pointer-events-auto" : "opacity-0 -z-10 pointer-events-none"
              )}
            >
              {item.target_url ? (
                <Link href={item.target_url} className="block h-full w-full">
                  {slideImage}
                </Link>
              ) : (
                slideImage
              )}
            </div>
          );
        })}

        {banners.length > 1 ? (
          <>
          <button
            type="button"
            aria-label={t("previousBanner")}
            onClick={() => setIndex((i) => (i - 1 + banners.length) % banners.length)}
            className="absolute top-1/2 left-3 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-[var(--shadow-sm)] transition hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={t("nextBanner")}
            onClick={() => setIndex((i) => (i + 1) % banners.length)}
            className="absolute top-1/2 right-3 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-[var(--shadow-sm)] transition hover:bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute right-0 bottom-3 left-0 z-10 flex justify-center gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b.id}
                aria-label={`${t("goToBanner")} ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full shadow-sm transition-all duration-300 ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/65 hover:bg-white"}`}
              />
            ))}
          </div>
          </>
        ) : null}
      </div>
    </Container>
  );
}
