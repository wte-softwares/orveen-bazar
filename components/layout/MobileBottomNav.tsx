"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutGrid,
  ShoppingCart,
  UserRound,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useComingSoon } from "@/components/common/ComingSoon";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

/**
 * Mobile bottom navigation bar matching modern native app UI/UX:
 * Fixed at the bottom of the viewport on mobile screens (< sm).
 * Includes Home, Catalog, Cart (coming soon), and Account/Login.
 * Active item displays an indicator pill container with subtle primary tint.
 */
export function MobileBottomNav() {
  const pathname = usePathname();
  const { trigger } = useComingSoon();
  const t = useTranslations("header");
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/v1/auth/session")
      .then((response) => {
        if (!cancelled) setIsSignedIn(response.ok);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // Determine active states
  const isHome = pathname === "/";
  const isCatalog = pathname.startsWith("/catalog") || pathname.startsWith("/brands");
  const isAccount = pathname.startsWith("/account") || pathname.startsWith("/login");

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 block sm:hidden bg-[var(--bg-surface)] border-t border-[var(--border-default)] shadow-[0_-2px_12px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
      <nav aria-label="Mobile bottom navigation" className="flex h-16 items-center justify-around px-2">
        {/* 1. Home */}
        <Link
          href="/"
          className={cn(
            "group flex flex-1 flex-col items-center justify-center py-1 transition-colors",
            isHome ? "text-[var(--brand-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          <div
            className={cn(
              "flex h-8 w-14 items-center justify-center rounded-2xl transition-all duration-200",
              isHome ? "bg-[var(--color-primary-100)] text-[var(--brand-primary)]" : "bg-transparent"
            )}
          >
            <Home className={cn("size-5", isHome && "stroke-[2.5px]")} />
          </div>
          <span className={cn("mt-0.5 text-[11px] leading-tight font-medium", isHome && "font-bold text-[var(--brand-primary)]")}>
            {t("navHome")}
          </span>
        </Link>

        {/* 2. Catalog */}
        <Link
          href="/catalog"
          className={cn(
            "group flex flex-1 flex-col items-center justify-center py-1 transition-colors",
            isCatalog ? "text-[var(--brand-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          <div
            className={cn(
              "flex h-8 w-14 items-center justify-center rounded-2xl transition-all duration-200",
              isCatalog ? "bg-[var(--color-primary-100)] text-[var(--brand-primary)]" : "bg-transparent"
            )}
          >
            <LayoutGrid className={cn("size-5", isCatalog && "stroke-[2.5px]")} />
          </div>
          <span className={cn("mt-0.5 text-[11px] leading-tight font-medium", isCatalog && "font-bold text-[var(--brand-primary)]")}>
            {t("navCatalog")}
          </span>
        </Link>

        {/* 3. Cart (Display-only / coming soon dialog as per AGENTS.md) */}
        <button
          type="button"
          onClick={() => trigger("Cart")}
          className="group flex flex-1 flex-col items-center justify-center py-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <div className="flex h-8 w-14 items-center justify-center rounded-2xl bg-transparent">
            <ShoppingCart className="size-5" />
          </div>
          <span className="mt-0.5 text-[11px] leading-tight font-medium">
            {t("cart")}
          </span>
        </button>

        {/* 4. Account / Login */}
        <Link
          href={isSignedIn ? "/account" : "/login"}
          className={cn(
            "group flex flex-1 flex-col items-center justify-center py-1 transition-colors",
            isAccount ? "text-[var(--brand-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          <div
            className={cn(
              "flex h-8 w-14 items-center justify-center rounded-2xl transition-all duration-200",
              isAccount ? "bg-[var(--color-primary-100)] text-[var(--brand-primary)]" : "bg-transparent"
            )}
          >
            {isSignedIn ? (
              <UserRound className={cn("size-5", isAccount && "stroke-[2.5px]")} />
            ) : (
              <LogIn className={cn("size-5", isAccount && "stroke-[2.5px]")} />
            )}
          </div>
          <span className={cn("mt-0.5 text-[11px] leading-tight font-medium", isAccount && "font-bold text-[var(--brand-primary)]")}>
            {isSignedIn ? t("account") : t("login")}
          </span>
        </Link>
      </nav>
    </div>
  );
}
