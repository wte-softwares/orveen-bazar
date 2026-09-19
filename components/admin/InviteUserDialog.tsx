import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { ShieldCheckIcon, StoreIcon, Loader2Icon, AlertCircleIcon, CheckCircle2Icon } from "lucide-react";

export interface OrganizationOption {
  id: string;
  slug: string;
  name: string;
}

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizations: OrganizationOption[];
  prefilledEmail?: string;
  onSuccess: () => void;
}

interface InviteUserFormProps {
  organizations: OrganizationOption[];
  prefilledEmail?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function InviteUserForm({
  organizations,
  prefilledEmail = "",
  onSuccess,
  onCancel,
}: InviteUserFormProps) {
  const [email, setEmail] = useState(prefilledEmail);
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"staff" | "platform_admin">("staff");
  const [organizationId, setOrganizationId] = useState(organizations[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);
    setLoading(true);

    try {
      const payload = {
        email: email.trim().toLowerCase(),
        displayName: displayName.trim() || undefined,
        role,
        organizationId: role === "staff" ? organizationId : undefined,
        grantPlatformAdmin: role === "platform_admin",
      };

      const res = await fetch("/api/v1/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error?.message || "Failed to assign role or invite user.");
      }

      const isInvited = body.data?.status === "invited";
      const message = isInvited
        ? `Invitation sent to ${email} with assigned role!`
        : `Successfully granted role to ${email}!`;

      setSuccessNotice(message);
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
          <AlertCircleIcon className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successNotice && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/15 p-3 text-sm text-emerald-600 dark:text-emerald-400">
          <CheckCircle2Icon className="size-4 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
        <FieldGroup className="gap-3">
          <Field>
            <FieldLabel htmlFor="invite-email">Email Address</FieldLabel>
            <Input
              id="invite-email"
              type="email"
              required
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={Boolean(prefilledEmail) || loading}
            />
          </Field>

          {!prefilledEmail && (
            <Field>
              <FieldLabel htmlFor="invite-display-name">Full Name (Optional)</FieldLabel>
              <Input
                id="invite-display-name"
                type="text"
                placeholder="e.g. Tanvir Ahmed"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={loading}
              />
            </Field>
          )}

          <Field>
            <FieldLabel htmlFor="role-select">Role Type</FieldLabel>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setRole("staff")}
                className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                  role === "staff"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2 font-medium text-sm">
                  <StoreIcon className="size-4 text-primary" />
                  Brand Staff
                </div>
                <span className="text-xs text-muted-foreground">
                  Scoped access to manage items and banners for a single brand.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole("platform_admin")}
                className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                  role === "platform_admin"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2 font-medium text-sm">
                  <ShieldCheckIcon className="size-4 text-primary" />
                  Platform Admin
                </div>
                <span className="text-xs text-muted-foreground">
                  Full access across all brands, catalog items, and team management.
                </span>
              </button>
            </div>
          </Field>

          {role === "staff" && (
            <Field>
              <FieldLabel htmlFor="brand-select">Assigned Brand Organization</FieldLabel>
              <NativeSelect
                id="brand-select"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                disabled={loading}
                className="w-full"
              >
                {organizations.map((org) => (
                  <NativeSelectOption key={org.id} value={org.id}>
                    {org.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          )}
        </FieldGroup>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2Icon className="size-4 animate-spin" />}
            {prefilledEmail ? "Grant Role" : "Send Invite & Assign"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function InviteUserDialog({
  open,
  onOpenChange,
  organizations,
  prefilledEmail = "",
  onSuccess,
}: InviteUserDialogProps) {
  const handleSuccess = () => {
    onSuccess();
    setTimeout(() => {
      onOpenChange(false);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {prefilledEmail ? "Assign Additional Role" : "Invite User & Assign Role"}
          </DialogTitle>
          <DialogDescription>
            {prefilledEmail
              ? `Grant new permissions or brand access to ${prefilledEmail}.`
              : "Invite a new team member by email or grant admin access to an existing account."}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <InviteUserForm
            key={prefilledEmail || "new"}
            organizations={organizations}
            prefilledEmail={prefilledEmail}
            onSuccess={handleSuccess}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
