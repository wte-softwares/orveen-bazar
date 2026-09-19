"use client";

import Image from "next/image";
import { useParams, useRouter, usePathname } from "next/navigation";
import { ChevronsUpDownIcon, LayersIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
 * Application switcher across the platform's three brand organizations
 * and the platform-wide Shared Application (Users, Banners, Testimonials).
 */
export function OrgSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ org?: string }>();
  const t = useTranslations("admin");

  const isShared =
    pathname.startsWith("/admin/users") ||
    pathname.startsWith("/admin/banners") ||
    pathname.startsWith("/admin/testimonials");

  const currentSlug = params.org ?? BRANDS[0].slug;
  const activeBrand = getBrandConfig(currentSlug) ?? BRANDS[0];

  function switchToBrand(slug: string) {
    if (!isShared && slug === currentSlug) return;
    const nextPath = params.org ? pathname.replace(`/${params.org}/`, `/${slug}/`) : `/admin/${slug}/items`;
    router.push(nextPath);
  }

  function switchToShared() {
    if (isShared) return;
    router.push("/admin/banners");
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
            {isShared ? (
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
                <LayersIcon className="size-4.5" />
              </div>
            ) : (
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
                <Image src={activeBrand.logoSrc} alt="" width={28} height={28} className="size-6 object-contain" />
              </div>
            )}
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-medium">
                {isShared ? t("sharedApp") : activeBrand.name}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {isShared ? t("sharedAppDescription") : t("orgSwitcherLabel")}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-(--anchor-width)" align="start" side="bottom" sideOffset={4}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">{t("orgSwitcherLabel")}</DropdownMenuLabel>
              {BRANDS.map((brand) => (
                <DropdownMenuItem key={brand.slug} onClick={() => switchToBrand(brand.slug)} className="gap-2 p-2 cursor-pointer">
                  <div className="flex size-6 items-center justify-center overflow-hidden rounded-md border bg-white">
                    <Image src={brand.logoSrc} alt="" width={20} height={20} className="size-5 object-contain" />
                  </div>
                  <span className="font-medium text-sm">{brand.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">{t("platformGroup")}</DropdownMenuLabel>
              <DropdownMenuItem onClick={switchToShared} className="gap-2 p-2 cursor-pointer">
                <div className="flex size-6 items-center justify-center overflow-hidden rounded-md border bg-primary/10 text-primary">
                  <LayersIcon className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{t("sharedApp")}</span>
                  <span className="text-[11px] text-muted-foreground">{t("sharedAppDescription")}</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
