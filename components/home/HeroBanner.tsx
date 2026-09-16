"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { publicAssetUrl } from "@/lib/storage/public-url";

export interface HeroBannerItem {
  id: string;
  image_path: string;
  alt_text: string;
  target_url: string | null;
}

/** The family homepage's hero carousel — real "approved banners" content, not a stock photo (see docs/ARCHITECTURE.md). */
export function HeroBanner({ banners }: { banners: HeroBannerItem[] }) {
  const [index, setIndex] = useState(0);

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
      height={500}
      priority
      className="aspect-[16/5] w-full rounded-2xl object-cover"
    />
  );

  return (
    <div className="relative mx-auto max-w-(--container-max) px-[5vw] pt-4">
      {banner.target_url ? <Link href={banner.target_url}>{image}</Link> : image}

      {banners.length > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous banner"
            onClick={() => setIndex((i) => (i - 1 + banners.length) % banners.length)}
            className="absolute top-1/2 left-[6vw] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-[var(--shadow-sm)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next banner"
            onClick={() => setIndex((i) => (i + 1) % banners.length)}
            className="absolute top-1/2 right-[6vw] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-[var(--shadow-sm)]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="mt-3 flex justify-center gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b.id}
                aria-label={`Go to banner ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-[var(--brand-primary)]" : "w-1.5 bg-[var(--border-strong)]"}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
