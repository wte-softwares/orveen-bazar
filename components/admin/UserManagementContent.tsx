"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import {
  UsersIcon,
  ShieldCheckIcon,
  StoreIcon,
  ClockIcon,
  SearchIcon,
  UserPlusIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { UserTable, type AdminUserItem } from "./UserTable";
import { InviteUserDialog, type OrganizationOption } from "./InviteUserDialog";
import { RevokeRoleDialog, type RevokeTarget } from "./RevokeRoleDialog";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

const emptySubscribe = () => () => {};

interface UserManagementContentProps {
  initialUsers: AdminUserItem[];
  organizations: OrganizationOption[];
  currentUserId?: string;
}

export function UserManagementContent({
  initialUsers,
  organizations,
  currentUserId,
}: UserManagementContentProps) {
  const t = useTranslations("admin");
  const [users, setUsers] = useState<AdminUserItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "staff" | "invited">("all");
  const [orgFilter, setOrgFilter] = useState<string>("all");

  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [prefilledEmail, setPrefilledEmail] = useState<string>("");
  const [revokeTarget, setRevokeTarget] = useState<RevokeTarget | null>(null);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function refreshUsers() {
    try {
      const res = await fetch("/api/v1/admin/users");
      const json = await res.json();
      if (res.ok && json.data?.users) {
        setUsers(json.data.users);
      }
    } catch {
      // Background refresh failure is non-fatal
    }
  }

  const handleResendInvite = async (userId: string) => {
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/resend-invite`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to resend invite.");
      }
      setNotification({
        type: "success",
        message: `Invitation email resent to ${json.data?.email || "user"}.`,
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: unknown) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to resend invite.",
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleOpenAssignRole = (email: string) => {
    setPrefilledEmail(email);
    setInviteDialogOpen(true);
  };

  const handleOpenInviteNew = () => {
    setPrefilledEmail("");
    setInviteDialogOpen(true);
  };

  // Metrics
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.isPlatformAdmin).length;
    const staff = users.filter((u) => u.memberships.length > 0).length;
    const pending = users.filter((u) => u.status === "invited").length;
    return { total, admins, staff, pending };
  }, [users]);

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesEmail = u.email.toLowerCase().includes(query);
        const matchesName = u.displayName?.toLowerCase().includes(query);
        if (!matchesEmail && !matchesName) return false;
      }

      // Role filter
      if (roleFilter === "admin" && !u.isPlatformAdmin) return false;
      if (roleFilter === "staff" && u.memberships.length === 0) return false;
      if (roleFilter === "invited" && u.status !== "invited") return false;

      // Org filter
      if (orgFilter !== "all") {
        const matchesOrg = u.memberships.some(
          (m) => m.organizationId === orgFilter || m.organizationSlug === orgFilter,
        );
        if (!matchesOrg) return false;
      }

      return true;
    });
  }, [users, searchQuery, roleFilter, orgFilter]);

  return (
    <div
      data-slot="user-management"
      data-hydrated={mounted ? "true" : "false"}
      className="flex flex-1 flex-col gap-6"
    >
      {/* Top Heading & Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("usersHeading")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("usersSubtitle")}</p>
        </div>
        <Button onClick={handleOpenInviteNew} className="gap-2">
          <UserPlusIcon className="size-4" />
          {t("inviteUser")}
        </Button>
      </div>

      {/* Notification Toast/Banner */}
      {notification && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3 text-sm animate-in fade-in-0 duration-150 ${
            notification.type === "success"
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-destructive/15 text-destructive"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2Icon className="size-4 shrink-0" />
          ) : (
            <AlertCircleIcon className="size-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="rounded-xl shadow-xs">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UsersIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{t("totalUsers")}</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-xs">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <ShieldCheckIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{t("platformAdminsCount")}</p>
              <p className="text-2xl font-bold">{stats.admins}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-xs">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <StoreIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{t("staffCount")}</p>
              <p className="text-2xl font-bold">{stats.staff}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-xs">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ClockIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{t("pendingInvites")}</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder={t("searchUsersPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <NativeSelect
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "all" | "admin" | "staff" | "invited")}
            className="h-9"
          >
            <NativeSelectOption value="all">{t("filterRoleAll")}</NativeSelectOption>
            <NativeSelectOption value="admin">{t("filterRoleAdmin")}</NativeSelectOption>
            <NativeSelectOption value="staff">{t("filterRoleStaff")}</NativeSelectOption>
            <NativeSelectOption value="invited">{t("filterRoleInvited")}</NativeSelectOption>
          </NativeSelect>

          {/* Org Filter */}
          <NativeSelect
            value={orgFilter}
            onChange={(e) => setOrgFilter(e.target.value)}
            className="h-9"
          >
            <NativeSelectOption value="all">{t("filterOrgAll")}</NativeSelectOption>
            {organizations.map((org) => (
              <NativeSelectOption key={org.id} value={org.id}>
                {org.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>

      {/* User Table */}
      <UserTable
        users={filteredUsers}
        currentUserId={currentUserId}
        onAssignRole={handleOpenAssignRole}
        onRevokeRole={(target) => setRevokeTarget(target)}
        onResendInvite={handleResendInvite}
      />

      {/* Modals */}
      <InviteUserDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        organizations={organizations}
        prefilledEmail={prefilledEmail}
        onSuccess={refreshUsers}
      />

      <RevokeRoleDialog
        target={revokeTarget}
        onOpenChange={(open) => {
          if (!open) setRevokeTarget(null);
        }}
        onSuccess={refreshUsers}
      />
    </div>
  );
}
