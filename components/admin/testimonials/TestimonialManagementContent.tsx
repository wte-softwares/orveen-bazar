"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import {
  MessageSquareQuoteIcon,
  CheckCircle2Icon,
  ClockIcon,
  SearchIcon,
  PlusIcon,
  AlertCircleIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { AdminTestimonialItem } from "@/lib/queries/testimonials";
import { TestimonialTable } from "./TestimonialTable";
import { TestimonialDialog } from "./TestimonialDialog";
import { DeleteTestimonialDialog } from "./DeleteTestimonialDialog";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

const emptySubscribe = () => () => {};

interface TestimonialManagementContentProps {
  initialTestimonials: AdminTestimonialItem[];
}

export function TestimonialManagementContent({
  initialTestimonials,
}: TestimonialManagementContentProps) {
  const t = useTranslations("admin");
  const [testimonials, setTestimonials] = useState<AdminTestimonialItem[]>(initialTestimonials);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminTestimonialItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<AdminTestimonialItem | null>(null);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function refreshTestimonials() {
    try {
      const res = await fetch("/api/v1/admin/testimonials");
      const json = await res.json();
      if (res.ok && json.data) {
        setTestimonials(json.data);
      }
    } catch {
      // background refresh error non-fatal
    }
  }

  const handleOpenCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: AdminTestimonialItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleToggleActive = async (item: AdminTestimonialItem, newActive: boolean) => {
    try {
      const res = await fetch(`/api/v1/admin/testimonials/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActive }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || "Failed to update testimonial status.");
      }

      setTestimonials((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, is_active: newActive } : it))
      );

      setNotification({
        type: "success",
        message: newActive ? "Testimonial activated!" : "Testimonial deactivated!",
      });
      setTimeout(() => setNotification(null), 3500);
    } catch (err: unknown) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to toggle status.",
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const total = testimonials.length;
    const active = testimonials.filter((t) => t.is_active).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [testimonials]);

  // Filtered
  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName =
          item.name_bn.toLowerCase().includes(query) ||
          item.name_en.toLowerCase().includes(query);
        const matchesCity =
          item.city_bn.toLowerCase().includes(query) ||
          item.city_en.toLowerCase().includes(query);
        const matchesQuote =
          item.quote_bn.toLowerCase().includes(query) ||
          item.quote_en.toLowerCase().includes(query);
        if (!matchesName && !matchesCity && !matchesQuote) return false;
      }

      // Status
      if (statusFilter === "active" && !item.is_active) return false;
      if (statusFilter === "inactive" && item.is_active) return false;

      return true;
    });
  }, [testimonials, searchQuery, statusFilter]);

  return (
    <div
      data-slot="testimonial-management"
      data-hydrated={mounted ? "true" : "false"}
      className="flex flex-1 flex-col gap-6"
    >
      {/* Header & Primary Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("testimonialsHeading")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("testimonialsSubtitle")}
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <PlusIcon className="size-4" />
          {t("addTestimonial")}
        </Button>
      </div>

      {/* Notification Toast */}
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
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 max-w-2xl">
        <Card className="rounded-xl shadow-xs">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MessageSquareQuoteIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{t("filterActiveAllTestimonials")}</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-xs">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2Icon className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{t("filterActiveOnlyTestimonials")}</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-xs">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <ClockIcon className="size-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{t("filterInactiveOnlyTestimonials")}</p>
              <p className="text-2xl font-bold">{stats.inactive}</p>
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
            placeholder={t("searchTestimonialsPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <NativeSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
            className="h-9"
          >
            <NativeSelectOption value="all">{t("filterActiveAllTestimonials")}</NativeSelectOption>
            <NativeSelectOption value="active">{t("filterActiveOnlyTestimonials")}</NativeSelectOption>
            <NativeSelectOption value="inactive">{t("filterInactiveOnlyTestimonials")}</NativeSelectOption>
          </NativeSelect>
        </div>
      </div>

      {/* Table */}
      <TestimonialTable
        testimonials={filteredTestimonials}
        onEdit={handleOpenEdit}
        onDelete={(item) => setDeletingItem(item)}
        onToggleActive={handleToggleActive}
      />

      {/* Modals */}
      <TestimonialDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        testimonial={editingItem}
        onSuccess={refreshTestimonials}
      />

      <DeleteTestimonialDialog
        testimonial={deletingItem}
        onOpenChange={(open) => {
          if (!open) setDeletingItem(null);
        }}
        onSuccess={refreshTestimonials}
      />
    </div>
  );
}
