"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";

export interface RevokeTarget {
  userId: string;
  email: string;
  roleName: string;
  organizationId?: string;
}

interface RevokeRoleDialogProps {
  target: RevokeTarget | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RevokeRoleDialog({
  target,
  onOpenChange,
  onSuccess,
}: RevokeRoleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!target) return null;

  async function handleConfirm() {
    if (!target) return;
    setLoading(true);
    setError(null);

    try {
      const url = target.organizationId
        ? `/api/v1/admin/users/${target.userId}?organizationId=${target.organizationId}`
        : `/api/v1/admin/users/${target.userId}`;

      const res = await fetch(url, { method: "DELETE" });
      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error?.message || "Failed to revoke role.");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to revoke access.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={Boolean(target)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive font-semibold">Revoke Access</DialogTitle>
          <DialogDescription>
            Are you sure you want to revoke{" "}
            <span className="font-semibold text-foreground">{target.roleName}</span> permissions from{" "}
            <span className="font-semibold text-foreground">{target.email}</span>?
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
            <AlertCircleIcon className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader2Icon className="size-4 animate-spin" />}
            Confirm Revoke
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
