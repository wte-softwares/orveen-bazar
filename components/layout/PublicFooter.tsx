"use client";

import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useComingSoon } from "@/components/common/ComingSoon";

const BRAND_LINKS = [
  { slug: "orveen-bazar", name: "Orveen Bazaar" },
  { slug: "reliable-multi-products", name: "Reliable Multi Products" },
  { slug: "eco-fast-bd", name: "Eco Fast BD" },
];

/**
 * Ported from the client's design. Links to screens that don't exist yet
 * (FAQ, return/delivery policy, privacy, terms, contact, social) open the
 * shared "coming soon" dialog instead of 404ing — see AGENTS.md.
 */
export function PublicFooter() {
  const { trigger } = useComingSoon();

  return (
    <footer className="bg-[var(--color-neutral-900)] text-white/80">
      <div className="mx-auto grid max-w-(--container-max) gap-8 px-[5vw] py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-heading text-lg font-bold text-white">Orveen Bazaar</p>
          <p className="mt-2 text-sm leading-relaxed">
            Committed to delivering safe, trustworthy, and quality products for your family.
          </p>
          <div className="mt-4 flex gap-3">
            {["Facebook", "Instagram", "YouTube"].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => trigger(label)}
                aria-label={`${label} (coming soon)`}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold transition hover:bg-white/20"
              >
                {label.slice(0, 2).toUpperCase()}
              </button>
            ))}
            <button
              type="button"
              onClick={() => trigger("WhatsApp")}
              aria-label="WhatsApp (coming soon)"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Brands</p>
          <ul className="mt-3 space-y-2 text-sm">
            {BRAND_LINKS.map((brand) => (
              <li key={brand.slug}>
                <Link href={`/brands/${brand.slug}`} className="hover:text-white">
                  {brand.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Customer support</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <button type="button" onClick={() => trigger("FAQ")} className="hover:text-white">
                FAQ
              </button>
            </li>
            <li>
              <button type="button" onClick={() => trigger("Return policy")} className="hover:text-white">
                Return policy
              </button>
            </li>
            <li>
              <button type="button" onClick={() => trigger("Delivery information")} className="hover:text-white">
                Delivery information
              </button>
            </li>
            <li>
              <button type="button" onClick={() => trigger("Contact page")} className="hover:text-white">
                Contact us
              </button>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">Contact</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> Barishal, Khulna &amp; Faridpur divisions — all of Bangladesh
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" /> +880 1335 189426 (WhatsApp)
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" /> orveenbazzar@gmail.com
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-[5vw] py-4">
        <div className="mx-auto flex max-w-(--container-max) flex-wrap items-center justify-between gap-2 text-xs text-white/60">
          <p>© {new Date().getFullYear()} Orveen Bazaar. All rights reserved.</p>
          <div className="flex gap-4">
            <button type="button" onClick={() => trigger("Privacy policy")} className="hover:text-white">
              Privacy policy
            </button>
            <button type="button" onClick={() => trigger("Terms of use")} className="hover:text-white">
              Terms of use
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
