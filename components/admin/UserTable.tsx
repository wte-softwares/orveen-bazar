"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  ShieldCheckIcon,
  StoreIcon,
  MailIcon,
  UserPlusIcon,
  Trash2Icon,
  ClockIcon,
  CheckCircle2Icon,
  Loader2Icon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RevokeTarget } from "./RevokeRoleDialog";

export interface AdminUserItem {
  id: string;
  email: string;
  displayName: string | null;
  isPlatformAdmin: boolean;
  status: "active" | "invited";
  invitedAt: string | null;
  lastSignInAt: string | null;
  createdAt: string;
  memberships: Array<{
    id: string;
    organizationId: string;
    organizationSlug: string;
    organizationName: string;
    role: "staff";
    createdAt: string;
  }>;
}

interface UserTableProps {
  users: AdminUserItem[];
  currentUserId?: string;
  onAssignRole: (email: string) => void;
  onRevokeRole: (target: RevokeTarget) => void;
  onResendInvite: (userId: string) => Promise<void>;
}

export function UserTable({
  users,
  currentUserId,
  onAssignRole,
  onRevokeRole,
  onResendInvite,
}: UserTableProps) {
  const [resendingId, setResendingId] = useState<string | null>(null);

  const handleResend = async (userId: string) => {
    setResendingId(userId);
    try {
      await onResendInvite(userId);
    } finally {
      setResendingId(null);
    }
  };

  if (users.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">No users match the search and filter criteria.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-xs overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[280px]">User</TableHead>
            <TableHead className="min-w-[240px]">Assigned Roles</TableHead>
            <TableHead className="w-[140px]">Status</TableHead>
            <TableHead className="w-[140px]">Joined / Invited</TableHead>
            <TableHead className="w-[140px]">Last Active</TableHead>
            <TableHead className="w-[180px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            const initials = (user.displayName || user.email)
              .slice(0, 2)
              .toUpperCase();

            return (
              <TableRow key={user.id} className="transition-colors">
                {/* User Info */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-xs">
                      {initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm truncate">
                          {user.displayName || user.email.split("@")[0]}
                        </span>
                        {isSelf && (
                          <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>
                  </div>
                </TableCell>

                {/* Assigned Roles */}
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {user.isPlatformAdmin && (
                      <Badge
                        variant="default"
                        className="bg-purple-600 hover:bg-purple-700 text-white gap-1 pr-1"
                      >
                        <ShieldCheckIcon className="size-3" />
                        Platform Admin
                        {!isSelf && (
                          <button
                            type="button"
                            title="Revoke Platform Admin"
                            onClick={() =>
                              onRevokeRole({
                                userId: user.id,
                                email: user.email,
                                roleName: "Platform Admin",
                              })
                            }
                            className="ml-1 rounded-full p-0.5 hover:bg-black/20"
                          >
                            <Trash2Icon className="size-2.5" />
                          </button>
                        )}
                      </Badge>
                    )}

                    {user.memberships.map((membership) => (
                      <Badge
                        key={membership.id}
                        variant="secondary"
                        className="gap-1 border border-border/80 pr-1"
                      >
                        <StoreIcon className="size-3 text-muted-foreground" />
                        Staff: {membership.organizationName}
                        <button
                          type="button"
                          title={`Revoke access to ${membership.organizationName}`}
                          onClick={() =>
                            onRevokeRole({
                              userId: user.id,
                              email: user.email,
                              roleName: `Staff (${membership.organizationName})`,
                              organizationId: membership.organizationId,
                            })
                          }
                          className="ml-1 rounded-full p-0.5 hover:bg-muted"
                        >
                          <Trash2Icon className="size-2.5 text-muted-foreground hover:text-destructive" />
                        </button>
                      </Badge>
                    ))}

                    {!user.isPlatformAdmin && user.memberships.length === 0 && (
                      <span className="text-xs text-muted-foreground italic">No roles assigned</span>
                    )}
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell>
                  {user.status === "active" ? (
                    <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1">
                      <CheckCircle2Icon className="size-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1">
                      <ClockIcon className="size-3" />
                      Invite Pending
                    </Badge>
                  )}
                </TableCell>

                {/* Joined / Invited Date */}
                <TableCell className="text-xs text-muted-foreground">
                  {user.invitedAt
                    ? `Invited ${format(new Date(user.invitedAt), "dd MMM yyyy")}`
                    : format(new Date(user.createdAt), "dd MMM yyyy")}
                </TableCell>

                {/* Last Active */}
                <TableCell className="text-xs text-muted-foreground">
                  {user.lastSignInAt
                    ? format(new Date(user.lastSignInAt), "dd MMM yyyy, p")
                    : "Never signed in"}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {user.status === "invited" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={resendingId === user.id}
                        onClick={() => handleResend(user.id)}
                        className="h-8 gap-1 text-xs"
                      >
                        {resendingId === user.id ? (
                          <Loader2Icon className="size-3.5 animate-spin" />
                        ) : (
                          <MailIcon className="size-3.5" />
                        )}
                        Resend
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onAssignRole(user.email)}
                      className="h-8 gap-1 text-xs"
                    >
                      <UserPlusIcon className="size-3.5" />
                      Add Role
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
