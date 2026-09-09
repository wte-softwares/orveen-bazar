"use client";

import Link from "next/link";
import { Heart, Menu, ShoppingCart, UserRound } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useCart, useUI, useWishlist } from "@/providers/StoreProvider";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
import { formatNumber } from "@/lib/utils";

function IconButton({
  href,
  label,
  badge,
  onClick,
  children,
}: {
  href?: string;
  label: string;
  badge?: number;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const inner = (
    <>
      <span className="relative inline-flex">
        {children}
        {badge !== undefined && badge > 0 ? (
          <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2E9E44] px-1 text-[10px] font-bold text-white">
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
      </span>
      <span className="hidden text-[11px] font-medium lg:block">{label}</span>
    </>
  );
  const cls =
    "relative flex flex-col items-center gap-0.5 rounded-xl px-2.5 py-1.5 text-[#16339B] transition hover:bg-[#E8F0FE] focus-visible:outline-2 focus-visible:outline-[#1D4ED8]";
  if (href) {
    return (
      <Link href={href} aria-label={label} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={label} className={cls}>
      {inner}
    </button>
  );
}

export function Header() {
  const { t, language, toggleLanguage } = useLanguage();
  const { count } = useCart();
  const { ids } = useWishlist();
  const { setCartOpen, setMenuOpen } = useUI();

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E8EA] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-3 py-2.5 sm:gap-4 sm:px-4 lg:px-8">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label={t("header.menu")}
          className="shrink-0 rounded-xl border border-[#E2E8EA] p-2 text-[#16339B] transition hover:bg-[#E8F0FE] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Logo compact iconOnlyOnMobile />

        <SearchBar className="mx-auto hidden w-full max-w-2xl md:block" />

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={toggleLanguage}
            aria-label={t("common.language")}
            className="rounded-xl border border-[#E2E8EA] px-2 py-1.5 text-[11px] font-bold text-[#1D4ED8] transition hover:bg-[#E8F0FE] md:hidden"
          >
            {language === "bn" ? "EN" : "বাং"}
          </button>
          <IconButton href="/account" label={t("header.account")}>
            <UserRound className="h-5 w-5" />
          </IconButton>
          <IconButton href="/wishlist" label={t("header.wishlist")} badge={ids.length}>
            <Heart className="h-5 w-5" />
          </IconButton>
          <IconButton
            label={t("header.cart")}
            badge={language === "bn" ? Number(formatNumber(count, "en")) : count}
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
          </IconButton>
        </div>
      </div>

      <div className="border-t border-[#E2E8EA]/70 px-3 py-2 sm:px-4 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
