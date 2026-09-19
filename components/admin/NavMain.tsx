"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  LayoutDashboardIcon,
  PackageIcon,
  TagsIcon,
  GalleryHorizontalIcon,
  Settings2Icon,
  UsersIcon,
  MessageSquareQuoteIcon,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { BRANDS } from "@/lib/site-config";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

/**
 * Flat (non-collapsible) nav.
 * When the active application is "Shared", renders:
 *   - Banners (/admin/banners)
 *   - Testimonials / Feedback (/admin/testimonials)
 *   - Users (/admin/users, platform admin only)
 * When the active application is a specific brand, renders:
 *   - Overview (/admin)
 *   - Items (/admin/[org]/items)
 *   - Categories (/admin/[org]/categories)
 *   - Brand info (/admin/[org]/settings)
 */
export function NavMain({ isPlatformAdmin = true }: { isPlatformAdmin?: boolean }) {
  const pathname = usePathname();
  const params = useParams<{ org?: string }>();
  const t = useTranslations("admin");
  const { setOpenMobile } = useSidebar();
  const org = params.org ?? BRANDS[0].slug;

  const isShared =
    pathname.startsWith("/admin/users") ||
    pathname.startsWith("/admin/banners") ||
    pathname.startsWith("/admin/testimonials");

  if (isShared) {
    const sharedItems = [
      { title: t("navBanners"), url: "/admin/banners", icon: GalleryHorizontalIcon },
      { title: t("navTestimonials"), url: "/admin/testimonials", icon: MessageSquareQuoteIcon },
    ];

    const adminItems = [{ title: t("navUsers"), url: "/admin/users", icon: UsersIcon }];

    return (
      <>
        <SidebarGroup>
          <SidebarGroupLabel>{t("sharedApp")}</SidebarGroupLabel>
          <SidebarMenu>
            {sharedItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={pathname === item.url || pathname.startsWith(`${item.url}/`)}
                  render={<Link href={item.url} onClick={() => setOpenMobile(false)} />}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {isPlatformAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>{t("adminGroup")}</SidebarGroupLabel>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={pathname === item.url || pathname.startsWith(`${item.url}/`)}
                    render={<Link href={item.url} onClick={() => setOpenMobile(false)} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </>
    );
  }

  // Brand navigation — Banners and Users are removed from here!
  const brandItems = [
    { title: t("navOverview"), url: "/admin", icon: LayoutDashboardIcon },
    { title: t("navItems"), url: `/admin/${org}/items`, icon: PackageIcon },
    { title: t("navCategories"), url: `/admin/${org}/categories`, icon: TagsIcon },
    { title: t("navSettings"), url: `/admin/${org}/settings`, icon: Settings2Icon },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("orgSwitcherLabel")}</SidebarGroupLabel>
      <SidebarMenu>
        {brandItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              tooltip={item.title}
              isActive={pathname === item.url || (item.url !== "/admin" && pathname.startsWith(`${item.url}/`))}
              render={<Link href={item.url} onClick={() => setOpenMobile(false)} />}
            >
              <item.icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
