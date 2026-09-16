"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Image as ImageIcon,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  Settings,
  SquareStack,
  Users,
  X,
} from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useAdminStore } from "@/providers/AdminStoreProvider";
import { useToast } from "@/providers/StoreProvider";
import { organizations, type OrgSlug } from "@/data/organizations";
import { Logo } from "@/components/layout/Logo";
import { Badge, inputClass } from "@/components/ui/core";
import { ConfirmDialog, ErrorState } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";

/* ------------------------------ Access helpers ------------------------------ */

export function useAdminAccess(org?: string) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff";
  const allowedOrgs: OrgSlug[] = isAdmin
    ? organizations.map((o) => o.slug)
    : isStaff && Array.isArray(user?.orgs)
      ? user.orgs
      : [];
  const canAccessAdmin = Boolean(user) && (isAdmin || isStaff);
  const orgAllowed = !org || allowedOrgs.includes(org as OrgSlug);
  return { user, isAdmin, isStaff, allowedOrgs, canAccessAdmin, orgAllowed };
}

/* --------------------------- Organization switcher --------------------------- */

export function OrganizationSwitcher({ value }: { value?: OrgSlug }) {
  const { t } = useLanguage();
  const { selectedOrg, setSelectedOrg, editorDirty, setEditorDirty } = useAdminStore();
  const { allowedOrgs } = useAdminAccess(value);
  const router = useRouter();
  const pathname = usePathname();
  const current = value ?? selectedOrg;
  const [pending, setPending] = useState<OrgSlug | null>(null);

  const goTo = (next: OrgSlug) => {
    setSelectedOrg(next);
    setEditorDirty(false);
    const section = pathname.split("/")[3]; // items | categories | banners | settings
    if (value && section) router.push(`/admin/${next}/${section}`);
    else if (value) router.push(`/admin/${next}/items`);
    else router.push("/admin");
  };

  return (
    <label className="flex items-center gap-2 text-[12.5px] font-semibold text-[#66777D]">
      <span className="hidden sm:block">{t("admin.organization")}</span>
      <select
        value={pending ?? current}
        aria-label={t("admin.switchOrg")}
        onChange={(e) => {
          const next = e.target.value as OrgSlug;
          /* Unsaved editor changes must be confirmed before switching org. */
          if (editorDirty && next !== current) setPending(next);
          else goTo(next);
        }}
        className="rounded-xl border border-[#E2E8EA] bg-white px-3 py-2 text-[13px] font-semibold text-[#17242A] focus:border-[#075ED1] focus:outline-none"
      >
        {organizations
          .filter((o) => allowedOrgs.includes(o.slug))
          .map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.name}
            </option>
          ))}
      </select>
      <ConfirmDialog
        open={Boolean(pending)}
        title={t("admin.unsaved")}
        body={t("admin.unsavedBody")}
        confirmLabel={t("admin.leave")}
        cancelLabel={t("admin.stay")}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (pending) goTo(pending);
          setPending(null);
        }}
        tone="primary"
      />
    </label>
  );
}

/* --------------------------------- Admin shell ------------------------------- */

export function AdminShell({
  org,
  title,
  children,
}: {
  org?: OrgSlug;
  title: string;
  children: ReactNode;
}) {
  const { t } = useLanguage();
  const { user, canAccessAdmin, orgAllowed, isAdmin, allowedOrgs } = useAdminAccess(org);
  const { logout } = useAuth();
  const { push } = useToast();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }
  const current = org ?? "orveen";

  const signOut = () => {
    logout();
    push(t("auth.signedOut"), "info");
  };

  if (!canAccessAdmin || !orgAllowed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <ErrorState
          title={t("admin.accessDenied")}
          description={t("admin.accessDeniedDesc")}
        />
        <div className="mt-4 flex justify-center gap-2">
          <Link
            href="/login?next=/admin"
            className="rounded-xl bg-[#075ED1] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0346A5]"
          >
            {t("auth.loginTitle")}
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-[#E2E8EA] bg-white px-5 py-2.5 text-sm font-semibold text-[#17242A] transition hover:bg-[#F7F9FA]"
          >
            {t("errors.backHome")}
          </Link>
        </div>
      </div>
    );
  }

  const links = [
    { href: "/admin", label: t("admin.dashboard"), icon: LayoutDashboard, exact: true },
    { href: `/admin/${current}/items`, label: t("admin.items"), icon: Package },
    { href: `/admin/${current}/categories`, label: t("admin.categories"), icon: LayoutGrid },
    { href: `/admin/${current}/banners`, label: t("admin.banners"), icon: SquareStack },
    { href: `/admin/${current}/settings`, label: t("admin.settings"), icon: Settings },
    ...(isAdmin ? [{ href: "/admin/users", label: t("admin.users"), icon: Users }] : []),
  ];

  const nav = (
    <ul className="space-y-1">
      {links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold transition",
                active ? "bg-[#075ED1] text-white" : "text-[#17242A] hover:bg-[#EAF3FE]",
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:px-8 lg:py-8">
      <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-40 rounded-2xl border border-[#E2E8EA] bg-white p-3">
            {nav}
            <div className="mt-3 border-t border-[#E2E8EA] pt-3">
              <Link
                href="/"
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13.5px] font-semibold text-[#66777D] transition hover:bg-[#F7F9FA]"
              >
                <LogOut className="h-4 w-4" />
                {t("admin.openSite")}
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-[13.5px] font-semibold text-[#DC2626] transition hover:bg-[#DC2626]/10"
              >
                <LogOut className="h-4 w-4" />
                {t("account.signOut")}
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label={t("common.menu")}
                className="rounded-xl border border-[#E2E8EA] p-2 text-[#0346A5] lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-[20px] font-black text-[#0346A5] sm:text-[24px]">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <OrganizationSwitcher value={org} />
              <Badge tone="teal">{user?.role}</Badge>
            </div>
          </div>
          {children}
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="anim-fade absolute inset-0 bg-[#0346A5]/50" onClick={() => setOpen(false)} aria-hidden="true" />
          <div role="dialog" aria-modal="true" aria-label={t("admin.title")} className="anim-slide-right absolute left-0 top-0 h-full w-[80vw] max-w-xs bg-white p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <Logo compact />
              <button type="button" onClick={() => setOpen(false)} aria-label={t("common.close")} className="rounded-full border border-[#E2E8EA] p-2 text-[#66777D]">
                <X className="h-4 w-4" />
              </button>
            </div>
            {nav}
            <div className="mt-3 border-t border-[#E2E8EA] pt-3">
              <button
                type="button"
                onClick={signOut}
                className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-[13.5px] font-semibold text-[#DC2626] transition hover:bg-[#DC2626]/10"
              >
                <LogOut className="h-4 w-4" />
                {t("account.signOut")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {/* keep allowedOrgs referenced for staff scoping clarity */}
      <span className="sr-only">{allowedOrgs.join(",")}</span>
    </div>
  );
}

/* --------------------------------- Data table -------------------------------- */

export function DataTable({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#E2E8EA] bg-white">
      <table className="w-full min-w-[640px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-[#E2E8EA] bg-[#F7F9FA]">
            {head.map((h) => (
              <th key={h} className="px-4 py-3 text-[11.5px] font-bold uppercase tracking-wider text-[#66777D]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8EA]">{children}</tbody>
      </table>
    </div>
  );
}

export function StatusBadge({ status }: { status: "draft" | "published" | "archived" | "active" | "inactive" }) {
  const { t } = useLanguage();
  const map: Record<string, { label: string; tone: "teal" | "green" | "amber" | "red" | "muted" }> = {
    draft: { label: t("admin.draft"), tone: "amber" },
    published: { label: t("admin.published"), tone: "green" },
    archived: { label: t("admin.archived"), tone: "muted" },
    active: { label: t("admin.active"), tone: "green" },
    inactive: { label: t("admin.inactive"), tone: "red" },
  };
  const entry = map[status];
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}

/* -------------------------------- Image uploader ------------------------------ */

export function ImageUploader({
  value,
  onChange,
  onError,
  label,
  hint,
}: {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  onError: (message: string) => void;
  label: string;
  hint: string;
}) {
  const { t } = useLanguage();
  const tImageUrl = () => t("admin.imageUrl");
  const [prevValue, setPrevValue] = useState(value);
  const [preview, setPreview] = useState<string | undefined>(value);
  if (prevValue !== value) {
    setPrevValue(value);
    setPreview(value);
  }

  const handle = (file: File | undefined) => {
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      onError("type");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      onError("size");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      setPreview(url);
      onChange(url);
    };
    reader.readAsDataURL(file);
  };

  const [url, setUrl] = useState("");

  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-semibold text-[#17242A]">{label}</span>
      {/* Option A: image URL field. javascript: URLs are rejected (link safety). */}
      <div className="mb-2 flex max-w-sm gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={tImageUrl()}
          aria-label={tImageUrl()}
          className={cn(inputClass, "py-2 text-[12.5px]")}
        />
        <button
          type="button"
          onClick={() => {
            const trimmed = url.trim();
            if (!trimmed) return;
            if (/^javascript:/i.test(trimmed) || !/^(https?:\/\/|\/)/i.test(trimmed)) {
              onError("url");
              return;
            }
            setPreview(trimmed);
            onChange(trimmed);
          }}
          className="shrink-0 rounded-xl border border-[#E2E8EA] px-3 py-2 text-[12px] font-semibold text-[#075ED1] transition hover:bg-[#EAF3FE]"
        >
          OK
        </button>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E2E8EA] bg-[#F7F9FA] text-[#66777D]">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-5 w-5" />
          )}
        </span>
        <span className="min-w-0">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#E2E8EA] bg-white px-4 py-2 text-[12.5px] font-semibold text-[#075ED1] transition hover:bg-[#EAF3FE]">
            <ImageIcon className="h-4 w-4" />
            {label}
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="sr-only"
              onChange={(e) => handle(e.target.files?.[0])}
            />
          </label>
          <span className="mt-1 block text-[11px] text-[#66777D]">{hint}</span>
        </span>
      </div>
    </div>
  );
}

export { inputClass };
