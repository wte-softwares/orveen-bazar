"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pickLocalized } from "@/lib/site-config";
import { testimonialToLocalizedText, type TestimonialRow } from "@/lib/testimonials";

// Three fixed, hardcoded storefront banner photos — not editorial/admin
// content, just a stand-in backdrop for the auth pages' feedback panel, per
// the client's request to reuse public/banners here rather than the
// database-backed `banners` table (which serves the homepage hero instead).
const BACKGROUND_IMAGES = [
  "/banners/banner%20(1).jpeg",
  "/banners/banner%20(2).jpeg",
  "/banners/banner%20(3).jpeg",
];

const ROTATE_INTERVAL_MS = 5000;

/**
 * The feedback panel shared by the login and signup pages: a slideshow of
 * the three hardcoded banner photos (same rotation behaviour as the
 * homepage's HeroBanner), paired each time with a testimonial picked at
 * random from the database (supabase/migrations/20260101000018_testimonials.sql)
 * — the client asked for the quote to change with the image, not to be
 * locked to any particular one, so this doesn't try to keep index and quote
 * in sync beyond "both change on the same tick."
 */
export function AuthFeedbackPanel({ testimonials, className }: { testimonials: TestimonialRow[]; className?: string }) {
  const { locale } = useLocale();
  const [imageIndex, setImageIndex] = useState(0);
  const [testimonial, setTestimonial] = useState<TestimonialRow | null>(testimonials[0] ?? null);

  useEffect(() => {
    if (BACKGROUND_IMAGES.length < 2 && testimonials.length < 2) return;
    const id = setInterval(() => {
      setImageIndex((i) => (i + 1) % BACKGROUND_IMAGES.length);
      if (testimonials.length > 0) {
        setTestimonial(testimonials[Math.floor(Math.random() * testimonials.length)]);
      }
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [testimonials]);

  const localized = testimonial ? testimonialToLocalizedText(testimonial) : null;

  return (
    <div
      className={cn("relative hidden flex-col justify-end overflow-hidden p-8 text-white md:flex", className)}
      style={{
        backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.25)), url("${BACKGROUND_IMAGES[imageIndex]}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "background-image 700ms ease-in-out",
      }}
    >
      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 p-4">
        {BACKGROUND_IMAGES.map((src, i) => (
          <span key={src} className={cn("h-1.5 rounded-full transition-all", i === imageIndex ? "w-5 bg-white" : "w-1.5 bg-white/50")} />
        ))}
      </div>
      {localized ? (
        <>
          <Quote className="mb-4 size-8 text-white/60" aria-hidden="true" />
          <p className="text-lg font-semibold leading-snug">{pickLocalized(localized.quote, locale)}</p>
          <p className="mt-3 mb-6 text-sm text-white/80">
            {pickLocalized(localized.name, locale)} — {pickLocalized(localized.city, locale)}
          </p>
        </>
      ) : null}
    </div>
  );
}
