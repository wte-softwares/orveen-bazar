"use client";

import Image from "next/image";
import { useParams, useRouter, usePathname } from "next/navigation";
import { ChevronsUpDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BRANDS, getBrandConfig } from "@/lib/site-config";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

/**
 * Swaps shadcn's sidebar-07 "team switcher" for a brand switcher across the
 * platform's three fixed organizations (see AGENTS.md — these are static
 * config, not user-created teams). Switching brands re-targets the current
 * `/admin/[org]/**` route to the new org's slug instead of just changing
 * some in-memory selection, so every org-scoped page (items, categories,
 * banners, settings) stays consistent with what's shown in the URL.
 */
export function OrgSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ org?: string }>();
  const t = useTranslations("admin");

  const currentSlug = params.org ?? BRANDS[0].slug;
  const activeBrand = getBrandConfig(currentSlug) ?? BRANDS[0];

  function switchTo(slug: string) {
    if (slug === currentSlug) return;
    const nextPath = params.org ? pathname.replace(`/${params.org}/`, `/${slug}/`) : `/admin/${slug}/items`;
    router.push(nextPath);
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground" />
            }
          >
            {/*
              `shrink-0` is load-bearing: SidebarMenuButton's own base
              classes give every descendant `<svg>` `shrink-0` automatically
              (so shadcn's lucide-icon team-switcher demo never needed this),
              but a `<div>`-wrapped `<Image>` like this brand logo isn't a
              raw svg and doesn't get that rule — without shrink-0, the flex
              row's default shrink behavior squashes this box down to
              near-nothing once the sidebar collapses to icon width.
            */}
            <div className="flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
              <Image src={activeBrand.logoSrc} alt="" width={28} height={28} className="size-6 object-contain" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-medium">{activeBrand.name}</span>
              <span className="truncate text-xs text-muted-foreground">{t("orgSwitcherLabel")}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--anchor-width)" align="start" side="bottom" sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">{t("orgSwitcherLabel")}</DropdownMenuLabel>
              {BRANDS.map((brand) => (
                <DropdownMenuItem key={brand.slug} onClick={() => switchTo(brand.slug)} className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center overflow-hidden rounded-md border bg-white">
                    <Image src={brand.logoSrc} alt="" width={20} height={20} className="size-5 object-contain" />
                  </div>
                  {brand.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
