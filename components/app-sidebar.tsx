"use client";

import type { ComponentProps } from "react";
import { OrgSwitcher } from "@/components/admin/OrgSwitcher";
import { NavMain } from "@/components/admin/NavMain";
import { NavUser, type AdminUser } from "@/components/admin/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

/** Adapted from shadcn's sidebar-07 block — see components/admin/{OrgSwitcher,NavMain,NavUser}.tsx for what replaced the block's sample data. */
export function AppSidebar({
  user,
  isPlatformAdmin = false,
  ...props
}: ComponentProps<typeof Sidebar> & { user: AdminUser; isPlatformAdmin?: boolean }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain isPlatformAdmin={isPlatformAdmin} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
