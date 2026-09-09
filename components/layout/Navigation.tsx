"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", key: "nav.home" },
  { href: "/shop", key: "nav.shop" },
  { href: "/offers", key: "nav.offers" },
  { href: "/dealer", key: "nav.dealer" },
  { href: "/corporate", key: "nav.corporate" },
  { href: "/about", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
] as const;

export function DesktopNavigation() {
  const { t, pick } = useLanguage();
  const pathname = usePathname();
  const [megaOpen, setMegaOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setMegaOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => setMegaOpen(false), [pathname]);

  const groups: { key: string; label: string }[] = [
    { key: "food", label: t("categories.food") },
    { key: "household", label: t("categories.household") },
    { key: "beverages", label: t("categories.beverages") },
    { key: "future", label: t("categories.future") },
  ];

  return (
    <nav aria-label="Main" className="hidden border-b border-[#E2E8EA] bg-white lg:block">
      <div ref={wrapRef} className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <ul className="flex items-center gap-1">
          <li className="relative">
            <button
              type="button"
              onClick={() => setMegaOpen((v) => !v)}
              aria-expanded={megaOpen}
              aria-haspopup="true"
              className={cn(
                "flex items-center gap-2 rounded-t-lg px-3.5 py-3 text-[13.5px] font-semibold transition",
                megaOpen || pathname.startsWith("/category")
                  ? "bg-[#1D4ED8] text-white"
                  : "text-[#16339B] hover:bg-[#E8F0FE]",
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              {t("header.categories")}
              <ChevronDown className={cn("h-3.5 w-3.5 transition", megaOpen && "rotate-180")} />
            </button>
          </li>
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block rounded-t-lg px-3.5 py-3 text-[13.5px] font-semibold transition",
                    active
                      ? "border-b-2 border-[#2E9E44] text-[#1D4ED8]"
                      : "text-[#17242A] hover:bg-[#E8F0FE] hover:text-[#1D4ED8]",
                  )}
                >
                  {t(link.key)}
                </Link>
              </li>
            );
          })}
        </ul>

        {megaOpen ? (
          <div className="anim-fade absolute left-0 right-0 top-full z-40 border border-[#E2E8EA] bg-white shadow-xl shadow-[#16339B]/10">
            <div className="grid grid-cols-4 gap-6 p-6">
              {groups.map((group) => (
                <div key={group.key}>
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#66777D]">
                    {group.label}
                  </p>
                  <ul className="space-y-1.5">
                    {categories
                      .filter((c) => c.group === group.key)
                      .map((cat) => (
                        <li key={cat.slug}>
                          <Link
                            href={`/category/${cat.slug}`}
                            className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[13px] text-[#17242A] transition hover:bg-[#E8F0FE] hover:text-[#1D4ED8]"
                          >
                            <span className="truncate">{pick(cat.name)}</span>
                            {cat.comingSoon ? (
                              <span className="shrink-0 rounded-full bg-[#FFC800]/15 px-2 py-0.5 text-[10px] font-semibold text-[#8A6400]">
                                {t("categories.comingSoon")}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
