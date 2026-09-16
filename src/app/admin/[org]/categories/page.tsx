"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { useAdminStore } from "@/providers/AdminStoreProvider";
import { useToast } from "@/providers/StoreProvider";
import { AdminShell, DataTable, StatusBadge } from "@/components/admin/AdminKit";
import { Field, Modal, TextInput } from "@/components/ui/core";
import { ConfirmDialog } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";
import type { CatalogCategory } from "@/data/categories";
import type { OrgSlug } from "@/data/organizations";

export default function AdminCategoriesPage() {
  const { t, pick } = useLanguage();
  const params = useParams<{ org: string }>();
  const org = params.org as OrgSlug;
  const { state, saveCategory, deleteCategory } = useAdminStore();
  const { push } = useToast();
  usePageTitle(t("admin.categories"), "Categories");

  const [editing, setEditing] = useState<CatalogCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CatalogCategory | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const rows = state.categories
    .filter((c) => c.orgSlug === org)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const move = (cat: CatalogCategory, dir: -1 | 1) => {
    const target = rows[rows.indexOf(cat) + dir];
    if (!target) return;
    saveCategory({ ...cat, sortOrder: target.sortOrder });
    saveCategory({ ...target, sortOrder: cat.sortOrder });
  };

  const openNew = () =>
    setEditing({
      slug: "",
      orgSlug: org,
      name: { bn: "", en: "" },
      description: { bn: "", en: "" },
      sortOrder: rows.length + 1,
      active: true,
      icon: "package",
    });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const next: Record<string, string> = {};
    if (!editing.name.en.trim()) next.nameEn = t("admin.required");
    if (!editing.name.bn.trim()) next.nameBn = t("admin.required");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(editing.slug)) next.slug = t("admin.slugInvalid");
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    saveCategory(editing);
    push(t("admin.categorySaved"));
    setEditing(null);
  };

  return (
    <AdminShell org={org} title={t("admin.categories")}>
      <button
        type="button"
        onClick={openNew}
        className="mb-4 inline-flex items-center gap-2 rounded-xl bg-[#075ED1] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#0346A5]"
      >
        <Plus className="h-4 w-4" />
        {t("admin.addCategory")}
      </button>

      <DataTable
        head={[
          t("admin.name"),
          t("admin.catSlug"),
          t("admin.sortOrder"),
          t("admin.status"),
          t("admin.actions"),
        ]}
      >
        {rows.map((cat) => {
          const inUse = state.items.some((i) => i.categorySlug === cat.slug && i.orgSlug === org);
          return (
            <tr key={cat.slug}>
              <td className="px-4 py-3 font-semibold text-[#17242A]">{pick(cat.name)}</td>
              <td className="px-4 py-3 text-[#66777D]">{cat.slug}</td>
              <td className="px-4 py-3 text-[#66777D]">{cat.sortOrder}</td>
              <td className="px-4 py-3">
                <StatusBadge status={cat.active ? "active" : "inactive"} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => move(cat, -1)}
                    aria-label={t("admin.moveUp")}
                    className="rounded-lg border border-[#E2E8EA] p-2 text-[#66777D] transition hover:bg-[#F7F9FA]"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(cat, 1)}
                    aria-label={t("admin.moveDown")}
                    className="rounded-lg border border-[#E2E8EA] p-2 text-[#66777D] transition hover:bg-[#F7F9FA]"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing({ ...cat })}
                    aria-label={t("admin.edit")}
                    className="rounded-lg border border-[#E2E8EA] p-2 text-[#075ED1] transition hover:bg-[#EAF3FE]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={inUse}
                    title={inUse ? t("admin.deleteDisabled") : t("admin.deleteConfirmTitle")}
                    aria-label={inUse ? t("admin.deleteDisabled") : t("admin.deleteConfirmTitle")}
                    onClick={() => !inUse && setDeleteTarget(cat)}
                    className={cn(
                      "rounded-lg border border-[#E2E8EA] p-2 transition",
                      inUse ? "cursor-not-allowed text-[#66777D]/40" : "text-rose-600 hover:bg-rose-50"
                    )}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {inUse ? <p className="mt-1 text-[10.5px] text-[#66777D]">{t("admin.categoryUsed")}</p> : null}
              </td>
            </tr>
          );
        })}
      </DataTable>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} label={t("admin.editCategory")}>
        {editing ? (
          <form onSubmit={submit} noValidate className="space-y-4 p-5 sm:p-6">
            <h2 className="pr-8 text-[17px] font-bold text-[#17242A]">
              {editing.slug ? t("admin.editCategory") : t("admin.addCategory")}
            </h2>
            <Field label={`${t("admin.catName")} (বাংলা)`} htmlFor="cat-bn" required error={errors.nameBn}>
              <TextInput id="cat-bn" value={editing.name.bn} invalid={!!errors.nameBn} onChange={(e) => setEditing({ ...editing, name: { ...editing.name, bn: e.target.value } })} />
            </Field>
            <Field label={`${t("admin.catName")} (English)`} htmlFor="cat-en" required error={errors.nameEn}>
              <TextInput id="cat-en" value={editing.name.en} invalid={!!errors.nameEn} onChange={(e) => setEditing({ ...editing, name: { ...editing.name, en: e.target.value } })} />
            </Field>
            <Field label={t("admin.catSlug")} htmlFor="cat-slug" required error={errors.slug}>
              <TextInput id="cat-slug" value={editing.slug} invalid={!!errors.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value.toLowerCase() })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label={t("admin.sortOrder")} htmlFor="cat-sort">
                <TextInput id="cat-sort" type="number" value={String(editing.sortOrder)} onChange={(e) => setEditing({ ...editing, sortOrder: parseInt(e.target.value, 10) || 1 })} />
              </Field>
              <Field label={t("admin.status")} htmlFor="cat-active">
                <select
                  id="cat-active"
                  value={editing.active ? "1" : "0"}
                  onChange={(e) => setEditing({ ...editing, active: e.target.value === "1" })}
                  className="w-full rounded-xl border border-[#E2E8EA] bg-white px-3.5 py-2.5 text-[14px]"
                >
                  <option value="1">{t("admin.active")}</option>
                  <option value="0">{t("admin.inactive")}</option>
                </select>
              </Field>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="rounded-xl border border-[#E2E8EA] px-4 py-2.5 text-[13px] font-semibold text-[#17242A] hover:bg-[#F7F9FA]">
                {t("admin.cancel")}
              </button>
              <button type="submit" className="rounded-xl bg-[#075ED1] px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#0346A5]">
                {t("account.save")}
              </button>
            </div>
          </form>
        ) : null}
      </Modal>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t("admin.deleteConfirmTitle")}
        body={deleteTarget ? `${pick(deleteTarget.name)} (${deleteTarget.slug})` : undefined}
        confirmLabel={t("admin.deleteConfirmTitle")}
        cancelLabel={t("admin.cancel")}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteCategory(org, deleteTarget.slug);
            push(t("admin.categoryDeleted"), "info");
            setDeleteTarget(null);
          }
        }}
      />
    </AdminShell>
  );
}
