"use client";

import { useParams, usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { BRANDS, getBrandConfig } from "@/lib/site-config";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

const SECTION_BY_SEGMENT = {
  items: "navItems",
  categories: "navCategories",
  banners: "navBanners",
  settings: "navSettings",
  users: "navUsers",
  testimonials: "navTestimonials",
} as const;

/** Top bar shared by every admin screen: sidebar toggle, a live breadcrumb, and the theme/language controls. */
export function AdminHeader() {
  const pathname = usePathname();
  const params = useParams<{ org?: string }>();
  const t = useTranslations("admin");

  const isShared =
    pathname.startsWith("/admin/users") ||
    pathname.startsWith("/admin/banners") ||
    pathname.startsWith("/admin/testimonials");

  const org = params.org ?? BRANDS[0].slug;
  const brand = getBrandConfig(org) ?? BRANDS[0];

  const lastSegment = pathname.split("/").filter(Boolean).pop();
  const sectionKey = lastSegment && lastSegment in SECTION_BY_SEGMENT ? SECTION_BY_SEGMENT[lastSegment as keyof typeof SECTION_BY_SEGMENT] : "navOverview";

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex flex-1 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>{isShared ? t("sharedAppShort") : brand.name}</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t(sectionKey)}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2 px-4">
        <LanguageSwitcher compact />
        <ThemeToggle />
      </div>
    </header>
  );
}
