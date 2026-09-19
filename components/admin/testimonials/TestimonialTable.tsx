"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  PencilIcon,
  Trash2Icon,
  CheckCircle2Icon,
  ClockIcon,
  ArrowUpDownIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminTestimonialItem } from "@/lib/queries/testimonials";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

interface TestimonialTableProps {
  testimonials: AdminTestimonialItem[];
  onEdit: (testimonial: AdminTestimonialItem) => void;
  onDelete: (testimonial: AdminTestimonialItem) => void;
  onToggleActive: (testimonial: AdminTestimonialItem, newActive: boolean) => Promise<void>;
}

export function TestimonialTable({
  testimonials,
  onEdit,
  onDelete,
  onToggleActive,
}: TestimonialTableProps) {
  const t = useTranslations("admin");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (testimonial: AdminTestimonialItem, checked?: boolean) => {
    const nextState = typeof checked === "boolean" ? checked : !testimonial.is_active;
    setTogglingId(testimonial.id);
    try {
      await onToggleActive(testimonial, nextState);
    } finally {
      setTogglingId(null);
    }
  };

  if (testimonials.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">{t("noTestimonialsFound")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-xs overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[80px]">Avatar</TableHead>
            <TableHead className="min-w-[200px]">Customer / Location</TableHead>
            <TableHead className="min-w-[280px]">Quote (BN / EN)</TableHead>
            <TableHead className="w-[100px] text-center">
              <div className="flex items-center justify-center gap-1">
                <ArrowUpDownIcon className="size-3 text-muted-foreground" />
                <span>Order</span>
              </div>
            </TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[120px]">Created</TableHead>
            <TableHead className="w-[120px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {testimonials.map((item) => {
            const isToggling = togglingId === item.id;

            return (
              <TableRow key={item.id} className="transition-colors">
                {/* Avatar */}
                <TableCell>
                  <div className="relative size-12 overflow-hidden rounded-full border bg-muted/20 shadow-2xs">
                    <Image
                      src={item.avatar_path}
                      alt={item.name_en}
                      fill
                      sizes="48px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </TableCell>

                {/* Customer Details */}
                <TableCell>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm text-foreground">
                      {item.name_bn}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.name_en}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium mt-0.5">
                      📍 {item.city_bn} ({item.city_en})
                    </span>
                  </div>
                </TableCell>

                {/* Quote Details */}
                <TableCell>
                  <div className="flex flex-col gap-1 max-w-[400px]">
                    <p className="text-xs text-foreground line-clamp-2 italic">
                      &ldquo;{item.quote_bn}&rdquo;
                    </p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 italic">
                      &ldquo;{item.quote_en}&rdquo;
                    </p>
                  </div>
                </TableCell>

                {/* Sort Order */}
                <TableCell className="text-center">
                  <Badge variant="outline" className="font-mono text-xs px-2 py-0.5">
                    #{item.sort_order}
                  </Badge>
                </TableCell>

                {/* Active Switch */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.is_active}
                      onCheckedChange={(checked) => handleToggle(item, checked)}
                      disabled={isToggling}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      {item.is_active ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2Icon className="size-3" />
                          Active
                        </span>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-0.5">
                          <ClockIcon className="size-3" />
                          Off
                        </span>
                      )}
                    </span>
                  </div>
                </TableCell>

                {/* Created Date */}
                <TableCell className="text-xs text-muted-foreground">
                  {item.created_at
                    ? format(new Date(item.created_at), "dd MMM yyyy")
                    : "—"}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(item)}
                      title={t("editTestimonial")}
                    >
                      <PencilIcon className="size-3.5" />
                      <span className="sr-only">Edit</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDelete(item)}
                      className="text-muted-foreground hover:text-destructive"
                      title={t("deleteTestimonial")}
                    >
                      <Trash2Icon className="size-3.5" />
                      <span className="sr-only">Delete</span>
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
