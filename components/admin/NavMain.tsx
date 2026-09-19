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
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BRANDS } from "@/lib/site-config";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

/**
 * Flat (non-collapsible) nav — every item here maps 1:1 to a real screen
 * from the brief's admin screen map (see AGENTS.md / docs/ARCHITECTURE.md).
 * Deliberately no "Orders"/"Inventory"/"Analytics" entries: those would
 * imply features this platform never has (cart, stock, sales reporting).
 */
export function NavMain({ isPlatformAdmin = true }: { isPlatformAdmin?: boolean }) {
  const pathname = usePathname();
  const params = useParams<{ org?: string }>();
  const t = useTranslations("admin");
  const org = params.org ?? BRANDS[0].slug;

  const platformItems = [
    { title: t("navOverview"), url: "/admin", icon: LayoutDashboardIcon },
    { title: t("navItems"), url: `/admin/${org}/items`, icon: PackageIcon },
    { title: t("navCategories"), url: `/admin/${org}/categories`, icon: TagsIcon },
    { title: t("navBanners"), url: `/admin/${org}/banners`, icon: GalleryHorizontalIcon },
    { title: t("navSettings"), url: `/admin/${org}/settings`, icon: Settings2Icon },
  ];

  const adminItems = [{ title: t("navUsers"), url: "/admin/users", icon: UsersIcon }];

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>{t("platformGroup")}</SidebarGroupLabel>
        <SidebarMenu>
          {platformItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={pathname === item.url}
                render={<Link href={item.url} />}
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
                  isActive={pathname === item.url}
                  render={<Link href={item.url} />}
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
