"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Archive, Eye, Pencil, Plus, RotateCcw, Search } from "lucide-react";
import { useLanguage, usePageTitle } from "@/providers/LanguageProvider";
import { useAdminStore } from "@/providers/AdminStoreProvider";
import { useToast } from "@/providers/StoreProvider";
import { AdminShell, DataTable, StatusBadge } from "@/components/admin/AdminKit";
import { ConfirmDialog } from "@/components/ui/feedback";
import { EmptyState, Modal, TextInput } from "@/components/ui/core";
import { CatalogCard, ItemVisual } from "@/components/catalog/cards";
import type { OrgSlug } from "@/data/organizations";
import type { CatalogItem } from "@/data/items";

function ItemsInner() {
  const { t, pick } = useLanguage();
  const params = useParams<{ org: string }>();
  const org = params.org as OrgSlug;
  const { state, setItemStatus, saveItem } = useAdminStore();
  const { push } = useToast();
  const router = useRouter();
  const sp = useSearchParams();
  usePageTitle(t("admin.items"), "Items");

  const [search, setSearch] = useState("");
  const [type, setType] = useState(sp.get("type") ?? "");
  const [status, setStatus] = useState("");
  const [archiveTarget, setArchiveTarget] = useState<CatalogItem | null>(null);
  const [catFilter, setCatFilter] = useState("");
  const [previewItem, setPreviewItem] = useState<CatalogItem | null>(null);

  const rows = useMemo(
    () =>
      state.items.filter(
        (i) =>
          i.orgSlug === org &&
          (!type || i.type === type) &&
          (!status || i.status === status) &&
          (!catFilter || i.categorySlug === catFilter) &&
          (!search ||
            i.title.bn.toLowerCase().includes(search.toLowerCase()) ||
            i.title.en.toLowerCase().includes(search.toLowerCase())),
      ),
    [state.items, org, type, status, search, catFilter],
  );

  const addItem = () => {
    const id = `itm-${Date.now()}`;
    const item: CatalogItem = {
      id,
      slug: `new-item-${id.slice(-4)}`,
      orgSlug: org,
      title: { bn: "", en: "" },
      description: { bn: "", en: "" },
      type: "product",
      categorySlug: state.categories.find((c) => c.orgSlug === org)?.slug ?? "",
      variants: [],
      status: "draft",
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      featured: false,
      visual: "box",
      tint: "#EAF3FE",
      pack: "#075ED1",
      accent: "#FFC800",
    };
    saveItem(item);
    router.push(`/admin/${org}/items/${id}`);
  };

  return (
    <AdminShell org={org} title={t("admin.items")}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-40 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#66777D]" />
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.search")}
            className="pl-9"
            aria-label={t("admin.search")}
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label={t("catalog.type")}
          className="rounded-xl border border-[#E2E8EA] bg-white px-3 py-2.5 text-[13px] font-semibold"
        >
          <option value="">{t("catalog.allTypes")}</option>
          <option value="product">{t("catalog.product")}</option>
          <option value="service">{t("catalog.service")}</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label={t("admin.status")}
          className="rounded-xl border border-[#E2E8EA] bg-white px-3 py-2.5 text-[13px] font-semibold"
        >
          <option value="">{t("admin.allStatus")}</option>
          <option value="draft">{t("admin.draft")}</option>
          <option value="published">{t("admin.published")}</option>
          <option value="archived">{t("admin.archived")}</option>
        </select>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          aria-label={t("admin.category")}
          className="rounded-xl border border-[#E2E8EA] bg-white px-3 py-2.5 text-[13px] font-semibold"
        >
          <option value="">{t("catalog.allCategories")}</option>
          {state.categories
            .filter((c) => c.orgSlug === org)
            .map((c) => (
              <option key={c.slug} value={c.slug}>
                {pick(c.name)}
              </option>
            ))}
        </select>
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 rounded-xl bg-[#075ED1] px-4 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#0346A5]"
        >
          <Plus className="h-4 w-4" />
          {t("admin.add")}
        </button>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Search} title={t("admin.noItems")} description={t("admin.noItemsDesc")} />
      ) : (
        <DataTable
          head={[
            t("admin.image"),
            t("admin.colTitle"),
            t("admin.type"),
            t("admin.category"),
            t("admin.status"),
            t("admin.updated"),
            t("admin.actions"),
          ]}
        >
          {rows.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3">
                <ItemVisual item={item} className="h-10 w-10 rounded-lg" label={false} />
              </td>
              <td className="max-w-52 truncate px-4 py-3 font-semibold text-[#17242A]">{pick(item.title) || item.slug}</td>
              <td className="px-4 py-3 text-[#66777D]">
                {item.type === "product" ? t("catalog.product") : t("catalog.service")}
              </td>
              <td className="max-w-40 truncate px-4 py-3 text-[#66777D]">
                {pick(state.categories.find((c) => c.slug === item.categorySlug)?.name ?? { bn: "—", en: "—" })}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-4 py-3 text-[#66777D]">{item.updatedAt}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    aria-label={t("admin.preview")}
                    title={t("admin.preview")}
                    className="rounded-lg border border-[#E2E8EA] p-2 text-[#2D9819] transition hover:bg-[#EDF9E8]"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <Link
                    href={`/admin/${org}/items/${item.id}`}
                    aria-label={t("admin.edit")}
                    className="rounded-lg border border-[#E2E8EA] p-2 text-[#075ED1] transition hover:bg-[#EAF3FE]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                  {item.status === "archived" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setItemStatus(item.id, "draft");
                        push(t("admin.restoredItem"), "info");
                      }}
                      aria-label={t("admin.restore")}
                      className="rounded-lg border border-[#E2E8EA] p-2 text-[#2D9819] transition hover:bg-[#EDF9E8]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setArchiveTarget(item)}
                      aria-label={t("admin.archive")}
                      className="rounded-lg border border-[#E2E8EA] p-2 text-[#DC2626] transition hover:bg-[#DC2626]/10"
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      {/* Admin preview reuses the public card component (drafts included). */}
      <Modal open={Boolean(previewItem)} onClose={() => setPreviewItem(null)} label={t("admin.preview")} size="sm">
        {previewItem ? (
          <div className="p-5">
            <CatalogCard
              item={previewItem}
              orgName={org}
              categoryName={pick(
                state.categories.find((c) => c.slug === previewItem.categorySlug)?.name ?? { bn: "", en: "" },
              )}
            />
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(archiveTarget)}
        title={t("admin.archiveConfirmTitle")}
        body={t("admin.archiveConfirmBody")}
        confirmLabel={t("admin.confirm")}
        cancelLabel={t("admin.cancel")}
        onCancel={() => setArchiveTarget(null)}
        onConfirm={() => {
          if (archiveTarget) {
            setItemStatus(archiveTarget.id, "archived");
            push(t("admin.archivedItem"), "info");
          }
          setArchiveTarget(null);
        }}
      />
    </AdminShell>
  );
}

export default function AdminItemsPage() {
  return (
    <Suspense fallback={null}>
      <ItemsInner />
    </Suspense>
  );
}
