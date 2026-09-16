"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import type { CatalogItem } from "@/data/items";
import type { CatalogCategory } from "@/data/categories";
import type { Organization } from "@/data/organizations";
import { useLanguage } from "@/providers/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useToast, useWishlist } from "@/providers/StoreProvider";
import { Badge, Modal } from "@/components/ui/core";
import { BrandLogo } from "@/components/brand/bits";
import { catalogConfig } from "@/lib/config";
import { LS_KEYS, cn, readLS, removeLS, writeLS } from "@/lib/utils";

export const PENDING_WISHLIST_KEY = LS_KEYS.pendingWishlist;

/* ------------------------------- Item visual ------------------------------- */

export function ItemVisual({
  item,
  className,
  label = true,
}: {
  item: CatalogItem;
  className?: string;
  label?: boolean;
}) {
  const { visual, tint, pack, accent } = item;
  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
      style={{ backgroundColor: tint }}
      role="img"
      aria-label={item.title.en}
    >
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt={item.title.en} className="h-full w-full object-cover" />
      ) : null}
      <svg viewBox="0 0 120 120" className={cn("h-full w-full", item.image && "hidden")} aria-hidden="true">
        <ellipse cx="60" cy="108" rx="30" ry="5" fill="#17242A" opacity="0.08" />
        {visual === "bottle" && (
          <g>
            <rect x="52" y="8" width="16" height="10" rx="2.5" fill={accent} />
            <rect x="54" y="17" width="12" height="9" fill={pack} opacity="0.85" />
            <path d="M44 34c0-6 6-8 8-10h16c2 2 8 4 8 10v66a8 8 0 0 1-8 8H52a8 8 0 0 1-8-8Z" fill={pack} />
            <path d="M44 40c4 3 28 3 32 0v-6c0-6-6-8-8-10H52c-2 2-8 4-8 10Z" fill="#FFFFFF" opacity="0.22" />
            {label && (
              <g>
                <rect x="48" y="52" width="24" height="30" rx="3" fill="#FFFFFF" />
                <rect x="51" y="57" width="18" height="3" rx="1.5" fill={accent} />
                <rect x="51" y="63" width="14" height="2" rx="1" fill="#66777D" opacity="0.6" />
                <rect x="51" y="68" width="16" height="2" rx="1" fill="#66777D" opacity="0.4" />
              </g>
            )}
          </g>
        )}
        {visual === "bag" && (
          <g>
            <path d="M34 30h52l6 72a6 6 0 0 1-6 6H34a6 6 0 0 1-6-6Z" fill={pack} />
            <rect x="32" y="22" width="56" height="11" rx="3" fill={accent} />
            <path d="M34 30h52l1.5 18c-10 4-45 4-55 0Z" fill="#FFFFFF" opacity="0.18" />
            {label && (
              <g>
                <rect x="40" y="56" width="40" height="34" rx="4" fill="#FFFFFF" />
                <rect x="45" y="62" width="30" height="4" rx="2" fill={accent} />
                <rect x="45" y="70" width="22" height="2.5" rx="1.25" fill="#66777D" opacity="0.6" />
                <rect x="45" y="76" width="26" height="2.5" rx="1.25" fill="#66777D" opacity="0.4" />
              </g>
            )}
          </g>
        )}
        {visual === "pouch" && (
          <g>
            <path d="M40 26l6-6 6 6 6-6 6 6 6-6 6 6 4 4v72a6 6 0 0 1-6 6H42a6 6 0 0 1-6-6V30Z" fill={pack} />
            <path d="M36 34c8 4 40 4 48 0" stroke="#FFFFFF" strokeWidth="3" opacity="0.25" fill="none" />
            {label && (
              <g>
                <rect x="44" y="50" width="32" height="36" rx="4" fill="#FFFFFF" />
                <rect x="48" y="56" width="24" height="4" rx="2" fill={accent} />
                <rect x="48" y="64" width="18" height="2.5" rx="1.25" fill="#66777D" opacity="0.6" />
                <rect x="48" y="70" width="20" height="2.5" rx="1.25" fill="#66777D" opacity="0.4" />
              </g>
            )}
          </g>
        )}
        {visual === "can" && (
          <g>
            <ellipse cx="60" cy="26" rx="19" ry="6" fill={accent} />
            <path d="M41 26v74a8 8 0 0 0 8 8h22a8 8 0 0 0 8-8V26" fill={pack} />
            <ellipse cx="60" cy="26" rx="12" ry="3.5" fill="#FFFFFF" opacity="0.35" />
            {label && (
              <g>
                <rect x="45" y="48" width="30" height="38" rx="4" fill="#FFFFFF" />
                <rect x="49" y="54" width="22" height="4" rx="2" fill={accent} />
                <rect x="49" y="62" width="16" height="2.5" rx="1.25" fill="#66777D" opacity="0.6" />
              </g>
            )}
          </g>
        )}
        {visual === "spray" && (
          <g>
            <path d="M50 12h14v8H50z" fill={accent} />
            <path d="M64 14h10v5H64z" fill={accent} />
            <path d="M52 20h12v10H52z" fill={pack} opacity="0.8" />
            <path d="M46 38a8 8 0 0 1 8-8h12a8 8 0 0 1 8 8v62a8 8 0 0 1-8 8H54a8 8 0 0 1-8-8Z" fill={pack} />
            {label && (
              <g>
                <rect x="49" y="52" width="22" height="32" rx="3" fill="#FFFFFF" />
                <rect x="52" y="57" width="16" height="3.5" rx="1.75" fill={accent} />
                <rect x="52" y="64" width="12" height="2" rx="1" fill="#66777D" opacity="0.6" />
              </g>
            )}
          </g>
        )}
        {visual === "box" && (
          <g>
            <path d="M30 38l30-12 30 12v58a6 6 0 0 1-6 6H36a6 6 0 0 1-6-6Z" fill={pack} />
            <path d="M30 38l30 12 30-12-30-12Z" fill={accent} />
            <path d="M60 50v52" stroke="#FFFFFF" strokeWidth="2" opacity="0.3" />
            {label && (
              <g>
                <rect x="40" y="60" width="40" height="28" rx="4" fill="#FFFFFF" />
                <rect x="45" y="65" width="30" height="4" rx="2" fill={accent} />
                <rect x="45" y="73" width="20" height="2.5" rx="1.25" fill="#66777D" opacity="0.6" />
              </g>
            )}
          </g>
        )}
        {visual === "coil" && (
          <g>
            <rect x="32" y="30" width="56" height="66" rx="8" fill={pack} />
            <circle cx="60" cy="63" r="19" fill="none" stroke="#FFFFFF" strokeWidth="4" opacity="0.85" />
            <circle cx="60" cy="63" r="11" fill="none" stroke="#FFFFFF" strokeWidth="3" opacity="0.6" />
            <circle cx="60" cy="63" r="4" fill="#FFFFFF" opacity="0.9" />
            <rect x="40" y="36" width="26" height="5" rx="2.5" fill="#FFFFFF" opacity="0.9" />
          </g>
        )}
        {visual === "jug" && (
          <g>
            <rect x="46" y="10" width="22" height="12" rx="3" fill={accent} />
            <path d="M38 32a10 10 0 0 1 10-10h24a10 10 0 0 1 10 10v68a8 8 0 0 1-8 8H46a8 8 0 0 1-8-8Z" fill={pack} />
            <path d="M82 44h6a8 8 0 0 1 8 8v22a8 8 0 0 1-8 8h-6" fill="none" stroke={pack} strokeWidth="7" />
            {label && (
              <g>
                <rect x="44" y="52" width="32" height="34" rx="4" fill="#FFFFFF" />
                <rect x="48" y="58" width="24" height="4" rx="2" fill={accent} />
                <rect x="48" y="66" width="18" height="2.5" rx="1.25" fill="#66777D" opacity="0.6" />
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
}

/* ----------------------------- Wishlist button ----------------------------- */

export function WishlistButton({
  itemId,
  className,
}: {
  itemId: string;
  className?: string;
}) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { has, toggle, add } = useWishlist();
  const { push } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [loginModal, setLoginModal] = useState(false);

  const saved = has(itemId);

  const onClick = () => {
    if (!user) {
      writeLS(PENDING_WISHLIST_KEY, itemId);
      setLoginModal(true);
      return;
    }
    const added = toggle(itemId);
    push(added ? t("wishlist.saved") : t("wishlist.removed"), added ? "success" : "info");
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        aria-label={saved ? t("wishlist.remove") : t("wishlist.title")}
        className={cn(
          "rounded-full border p-2 shadow-sm transition active:scale-90 focus-visible:outline-2 focus-visible:outline-[#075ED1]",
          saved
            ? "border-[#DC2626]/30 bg-[#DC2626] text-white"
            : "border-[#E2E8EA] bg-white text-[#66777D] hover:border-[#DC2626]/40 hover:text-[#DC2626]",
          className,
        )}
      >
        <Heart className={cn("h-4 w-4 transition", saved && "fill-current")} />
      </button>

      <Modal open={loginModal} onClose={() => setLoginModal(false)} label={t("wishlist.loginTitle")} size="sm">
        <div className="p-5 sm:p-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF3FE] text-[#075ED1]">
            <Heart className="h-5 w-5" />
          </span>
          <h2 className="mt-3 pr-8 text-[17px] font-bold text-[#17242A]">{t("wishlist.loginTitle")}</h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#66777D]">{t("wishlist.loginMessage")}</p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setLoginModal(false);
                router.push(`/login?next=${encodeURIComponent(pathname)}`);
              }}
              className="flex-1 rounded-xl bg-[#075ED1] px-4 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[#0346A5]"
            >
              {t("wishlist.login")}
            </button>
            <button
              type="button"
              onClick={() => setLoginModal(false)}
              className="flex-1 rounded-xl border border-[#E2E8EA] px-4 py-2.5 text-[13.5px] font-semibold text-[#17242A] transition hover:bg-[#F7F9FA]"
            >
              {t("wishlist.continueBrowsing")}
            </button>
          </div>
        </div>
      </Modal>
      {/* keep add available for post-login pending save */}
      {loginModal === false && saved === false && typeof add === "function" ? null : null}
    </>
  );
}

/** Called after successful login to save the item the guest intended to save. */
export function consumePendingWishlist(): string | null {
  const pending = readLS<string | null>(PENDING_WISHLIST_KEY, null);
  if (pending) removeLS(PENDING_WISHLIST_KEY);
  return pending;
}

/* -------------------------------- Catalog card ------------------------------- */

export function CatalogCard({
  item,
  orgName,
  categoryName,
}: {
  item: CatalogItem;
  orgName: string;
  categoryName: string;
}) {
  const { t, pick } = useLanguage();
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E2E8EA] bg-white transition hover:-translate-y-0.5 hover:border-[#075ED1]/30 hover:shadow-lg hover:shadow-[#0346A5]/8">
      <div className="relative">
        <Link
          href={`/brands/${item.orgSlug}/${item.slug}`}
          tabIndex={-1}
          aria-hidden="true"
          className="block overflow-hidden rounded-t-2xl"
        >
          <ItemVisual
            item={item}
            className="aspect-square w-full transition duration-300 group-hover:scale-[1.03]"
          />
        </Link>
        <span className="absolute left-2 top-2">
          <Badge tone={item.type === "product" ? "teal" : "green"}>
            {item.type === "product" ? t("item.typeProduct") : t("item.typeService")}
          </Badge>
        </span>
        <span className="absolute right-2 top-2">
          <WishlistButton itemId={item.id} />
        </span>
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
        <p className="text-[10.5px] font-bold uppercase tracking-wide text-[#66777D]">{orgName}</p>
        <h3 className="mt-0.5 line-clamp-2 min-h-[2.4em] text-[13.5px] font-semibold leading-snug text-[#17242A]">
          <Link
            href={`/brands/${item.orgSlug}/${item.slug}`}
            className="transition hover:text-[#075ED1]"
          >
            {pick(item.title)}
          </Link>
        </h3>
        <p className="mt-1 text-[11.5px] text-[#66777D]">{categoryName}</p>
        {catalogConfig.showPrice && item.priceText ? (
          <p className="mt-1 text-[12.5px] font-semibold text-[#17242A]">{item.priceText}</p>
        ) : null}
        <span className="mt-auto pt-2 text-[12px] font-semibold text-[#075ED1] opacity-0 transition group-hover:opacity-100">
          {t("wishlist.open")}
        </span>
      </div>
    </article>
  );
}

/* ------------------------------- Category card ------------------------------ */

export function CategoryCard({
  category,
  count,
}: {
  category: CatalogCategory;
  count: number;
}) {
  const { pick, language } = useLanguage();
  return (
    <Link
      href={`/catalog?brand=${category.orgSlug}&category=${category.slug}`}
      className="flex flex-col gap-1.5 rounded-2xl border border-[#E2E8EA] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#075ED1]/40 hover:shadow-md"
    >
      <span className="text-[13.5px] font-bold text-[#0346A5]">{pick(category.name)}</span>
      <span className="line-clamp-2 text-[11.5px] text-[#66777D]">{pick(category.description)}</span>
      <span className="mt-1 text-[11px] font-semibold text-[#2D9819]">
        {count.toLocaleString(language === "bn" ? "bn-BD" : "en-US")} items
      </span>
    </Link>
  );
}

/* --------------------------------- Brand card -------------------------------- */

export function BrandCard({ org, intro }: { org: Organization; intro: string }) {
  const { t } = useLanguage();
  return (
    <article className="flex flex-col rounded-3xl border border-[#E2E8EA] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0346A5]/8">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ backgroundColor: org.tint }}
      >
        <BrandLogo org={org} className="h-10 w-10" />
      </span>
      <h3 className="mt-4 text-[17px] font-black text-[#0346A5]">{org.name}</h3>
      <p className="mt-1 text-[12px] font-semibold" style={{ color: org.primary }}>
        {org.tagline.en}
      </p>
      <p className="mt-2.5 line-clamp-3 flex-1 text-[13px] leading-relaxed text-[#66777D]">{intro}</p>
      <Link
        href={`/brands/${org.slug}`}
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-bold text-white transition hover:brightness-110"
        style={{ backgroundColor: org.primary }}
      >
        {t("home.viewBrand")}
      </Link>
    </article>
  );
}
