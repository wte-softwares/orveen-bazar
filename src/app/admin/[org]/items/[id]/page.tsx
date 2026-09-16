"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUp, Eye, Save, Trash2 } from "lucide-react";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { useAdminStore } from "@/providers/AdminStoreProvider";
import { useToast } from "@/providers/StoreProvider";
import { AdminShell, ImageUploader } from "@/components/admin/AdminKit";
import { ConfirmDialog, ErrorState } from "@/components/ui/feedback";
import { Field, Modal, TextArea, TextInput } from "@/components/ui/core";
import { CatalogCard } from "@/components/catalog/cards";
import type { CatalogItem, ItemVariant } from "@/data/items";
import type { OrgSlug } from "@/data/organizations";

const slugOk = (s: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);

function reorderVariants(list: ItemVariant[], from: number, to: number): ItemVariant[] {
  if (to < 0 || to >= list.length) return list;
  const copy = [...list];
  const [moved] = copy.splice(from, 1);
  copy.splice(to, 0, moved);
  return copy.map((v, i) => ({ ...v, sortOrder: i + 1 }));
}

export default function ItemEditorPage() {
  const { t, pick } = useLanguage();
  const params = useParams<{ org: string; id: string }>();
  const org = params.org as OrgSlug;
  const { state, saveItem, setEditorDirty } = useAdminStore();
  const { push } = useToast();
  const router = useRouter();
  const [previewOpen, setPreviewOpen] = useState(false);
  usePageTitle(t("admin.editorTitle"), "Item Editor");

  const existing = state.items.find((i) => i.id === params.id);
  const [form, setForm] = useState<CatalogItem | null>(existing ? { ...existing } : null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  useEffect(() => {
    if (!existing) return;
    const load = window.setTimeout(() => {
      setForm((previous) =>
        previous?.id === existing.id
          ? previous
          : {
              ...existing,
              title: { ...existing.title },
              description: { ...existing.description },
              variants: existing.variants.map((variant) => ({ ...variant })),
            },
      );
    }, 0);
    return () => window.clearTimeout(load);
  }, [existing]);

  const dirty = useMemo(
    () => Boolean(form && existing && JSON.stringify(form) !== JSON.stringify(existing)),
    [form, existing],
  );

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  /* Register unsaved state globally so the organization switcher can guard. */
  useEffect(() => {
    setEditorDirty(dirty);
    return () => setEditorDirty(false);
  }, [dirty, setEditorDirty]);

  if (!form) {
    return (
      <AdminShell org={org} title={t("admin.editorTitle")}>
        <ErrorState title={t("item.notFound")} description={t("item.notFoundDesc")} />
      </AdminShell>
    );
  }

  const set = <K extends keyof CatalogItem>(key: K, value: CatalogItem[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setErrors((prev) => ({ ...prev, [key as string]: "" }));
  };

  const setVariant = (index: number, patch: Partial<ItemVariant>) => {
    setForm((prev) => {
      if (!prev) return prev;
      const variants = prev.variants.map((v, i) => (i === index ? { ...v, ...patch } : v));
      return { ...prev, variants };
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.title.en.trim()) next.titleEn = t("admin.required");
    if (!form.title.bn.trim()) next.titleBn = t("admin.required");
    if (!slugOk(form.slug)) next.slug = t("admin.slugInvalid");
    if (!form.description.en.trim()) next.descEn = t("admin.required");
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      push(t("admin.saveError"), "error");
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      saveItem({ ...form, updatedAt: new Date().toISOString().slice(0, 10) });
      setSaving(false);
      push(t("admin.saveSuccess"));
    }, 500);
  };

  const back = () => {
    if (dirty) setLeaveOpen(true);
    else router.push(`/admin/${org}/items`);
  };

  return (
    <AdminShell org={org} title={existing?.title.en ? t("admin.editorTitle") : t("admin.newItem")}>
      <button
        type="button"
        onClick={back}
        className="mb-4 inline-flex items-center gap-2 text-[13px] font-semibold text-[#075ED1] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("admin.backAdmin")}
      </button>

      {dirty ? (
        <p className="mb-4 rounded-xl bg-[#FFC800]/15 px-4 py-2.5 text-[12.5px] font-semibold text-[#8A6400]">
          {t("admin.unsaved")}
        </p>
      ) : null}

      <form onSubmit={submit} noValidate className="space-y-5 rounded-2xl border border-[#E2E8EA] bg-white p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`${t("admin.colTitle")} (বাংলা)`} htmlFor="it-title-bn" required error={errors.titleBn}>
            <TextInput id="it-title-bn" value={form.title.bn} invalid={!!errors.titleBn} onChange={(e) => set("title", { ...form.title, bn: e.target.value })} />
          </Field>
          <Field label={`${t("admin.colTitle")} (English)`} htmlFor="it-title-en" required error={errors.titleEn}>
            <TextInput id="it-title-en" value={form.title.en} invalid={!!errors.titleEn} onChange={(e) => set("title", { ...form.title, en: e.target.value })} />
          </Field>
          <Field label={t("admin.slug")} htmlFor="it-slug" required error={errors.slug}>
            <TextInput id="it-slug" value={form.slug} invalid={!!errors.slug} onChange={(e) => set("slug", e.target.value.toLowerCase())} />
          </Field>
          <Field label={t("admin.category")} htmlFor="it-cat" required>
            <select
              id="it-cat"
              value={form.categorySlug}
              onChange={(e) => set("categorySlug", e.target.value)}
              className="w-full rounded-xl border border-[#E2E8EA] bg-white px-3.5 py-2.5 text-[14px]"
            >
              {state.categories
                .filter((c) => c.orgSlug === org)
                .map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name.en}
                  </option>
                ))}
            </select>
          </Field>
          <Field label={t("admin.type")} htmlFor="it-type">
            <select
              id="it-type"
              value={form.type}
              onChange={(e) => set("type", e.target.value as CatalogItem["type"])}
              className="w-full rounded-xl border border-[#E2E8EA] bg-white px-3.5 py-2.5 text-[14px]"
            >
              <option value="product">{t("catalog.product")}</option>
              <option value="service">{t("catalog.service")}</option>
            </select>
          </Field>
          <Field label={t("admin.publishStatus")} htmlFor="it-status">
            <select
              id="it-status"
              value={form.status}
              onChange={(e) => set("status", e.target.value as CatalogItem["status"])}
              className="w-full rounded-xl border border-[#E2E8EA] bg-white px-3.5 py-2.5 text-[14px]"
            >
              <option value="draft">{t("admin.draft")}</option>
              <option value="published">{t("admin.published")}</option>
              <option value="archived">{t("admin.archived")}</option>
            </select>
          </Field>
        </div>

        <Field label={`${t("admin.description")} (বাংলা)`} htmlFor="it-desc-bn">
          <TextArea id="it-desc-bn" value={form.description.bn} onChange={(e) => set("description", { ...form.description, bn: e.target.value })} />
        </Field>
        <Field label={`${t("admin.description")} (English)`} htmlFor="it-desc-en" required error={errors.descEn}>
          <TextArea id="it-desc-en" value={form.description.en} invalid={!!errors.descEn} onChange={(e) => set("description", { ...form.description, en: e.target.value })} />
        </Field>

        <ImageUploader
          label={t("admin.uploadImage")}
          hint={t("admin.uploadHint")}
          value={form.image}
          onChange={(url) => set("image", url)}
          onError={(kind) =>
            push(kind === "type" ? t("admin.invalidImageType") : t("admin.invalidImageSize"), "error")
          }
        />

        <fieldset>
          <legend className="mb-2 text-[13px] font-semibold text-[#17242A]">{t("admin.variants")}</legend>
          <ul className="space-y-2">
            {form.variants.map((v, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2">
                <TextInput
                  value={v.label}
                  placeholder={t("admin.variantLabel")}
                  aria-label={t("admin.variantLabel")}
                  className="max-w-40 flex-1"
                  onChange={(e) => setVariant(i, { label: e.target.value })}
                />
                <TextInput
                  value={v.value}
                  placeholder={t("admin.variantValue")}
                  aria-label={t("admin.variantValue")}
                  className="max-w-40 flex-1"
                  onChange={(e) => setVariant(i, { value: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "variants",
                      reorderVariants(form.variants, i, i - 1),
                    )
                  }
                  disabled={i === 0}
                  aria-label={t("admin.moveUp")}
                  className="rounded-lg border border-[#E2E8EA] p-2 text-[#66777D] transition hover:bg-[#F7F9FA] disabled:opacity-40"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => set("variants", reorderVariants(form.variants, i, i + 1))}
                  disabled={i === form.variants.length - 1}
                  aria-label={t("admin.moveDown")}
                  className="rounded-lg border border-[#E2E8EA] p-2 text-[#66777D] transition hover:bg-[#F7F9FA] disabled:opacity-40"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => set("variants", form.variants.filter((_, x) => x !== i))}
                  aria-label={t("admin.removeVariant")}
                  className="rounded-lg border border-[#E2E8EA] p-2 text-[#DC2626] transition hover:bg-[#DC2626]/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() =>
              set("variants", [
                ...form.variants,
                { id: `v-${Date.now()}`, label: "", value: "", sortOrder: form.variants.length + 1 },
              ])
            }
            className="mt-2 rounded-xl border border-[#E2E8EA] px-4 py-2 text-[12.5px] font-semibold text-[#075ED1] transition hover:bg-[#EAF3FE]"
          >
            {t("admin.addVariant")}
          </button>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#075ED1] px-5 py-2.5 text-[13.5px] font-bold text-white transition hover:bg-[#0346A5] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? t("auth.working") : t("account.save")}
          </button>
          {form.status === "published" ? (
            <Link
              href={`/brands/${org}/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-semibold text-[#66777D] hover:underline"
            >
              {t("admin.openSite")}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              title={t("admin.draftNotPublished")}
              className="text-[13px] font-semibold text-[#66777D]/70 hover:text-[#075ED1] hover:underline"
            >
              {t("admin.openSite")} ({t(`admin.${form.status}`)})
            </button>
          )}
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8EA] px-4 py-2.5 text-[13px] font-semibold text-[#2D9819] transition hover:bg-[#EDF9E8]"
          >
            <Eye className="h-4 w-4" />
            {t("admin.preview")}
          </button>
        </div>
      </form>

      {/* Preview reuses the public catalog card — no duplicated design logic. */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} label={t("admin.preview")} size="sm">
        <div className="p-5">
          <CatalogCard
            item={form}
            orgName={org}
            categoryName={
              pick(state.categories.find((c) => c.slug === form.categorySlug)?.name ?? { bn: "", en: "" }) as string
            }
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={leaveOpen}
        title={t("admin.unsaved")}
        body={t("admin.unsavedBody")}
        confirmLabel={t("admin.leave")}
        cancelLabel={t("admin.stay")}
        onCancel={() => setLeaveOpen(false)}
        onConfirm={() => router.push(`/admin/${org}/items`)}
        tone="primary"
      />
    </AdminShell>
  );
}
