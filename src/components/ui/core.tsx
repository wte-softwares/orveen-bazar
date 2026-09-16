"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  type ReactNode,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
} from "react";
import { ChevronRight, Minus, Plus, Star, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/providers/LanguageProvider";

/* --------------------------------- Modal --------------------------------- */

export function Modal({
  open,
  onClose,
  label,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="anim-fade absolute inset-0 bg-[#0346A5]/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          "anim-slide-up relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl outline-none sm:rounded-2xl",
          size === "sm" && "sm:max-w-sm",
          size === "md" && "sm:max-w-lg",
          size === "lg" && "sm:max-w-3xl",
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-3 top-3 z-10 rounded-full border border-[#E2E8EA] bg-white p-1.5 text-[#66777D] transition hover:bg-[#EAF3FE] hover:text-[#075ED1] focus-visible:outline-2 focus-visible:outline-[#075ED1]"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------- Side panel ------------------------------- */

export function SidePanel({
  open,
  onClose,
  label,
  side = "right",
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  side?: "left" | "right";
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <div
        className="anim-fade absolute inset-0 bg-[#0346A5]/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={cn(
          "absolute top-0 flex h-full w-[86vw] max-w-sm flex-col bg-white shadow-2xl outline-none",
          side === "right" ? "right-0 anim-slide-left" : "left-0 anim-slide-right",
        )}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------- Empty state ------------------------------ */

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E2E8EA] bg-white px-6 py-14 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF3FE] text-[#075ED1]">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="text-lg font-semibold text-[#17242A]">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm text-[#66777D]">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/* -------------------------------- Skeletons ------------------------------- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-[#E2E8EA]/70", className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#E2E8EA] bg-white p-3">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <Skeleton className="mt-3 h-3 w-1/3" />
      <Skeleton className="mt-2 h-4 w-4/5" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <Skeleton className="mt-3 h-9 w-full rounded-xl" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ------------------------------ Rating stars ------------------------------ */

export function RatingStars({
  rating,
  count,
  className,
}: {
  rating: number;
  count?: number;
  className?: string;
}) {
  const { language } = useLanguage();
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="inline-flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i <= Math.round(rating) ? "fill-[#FFC800] text-[#FFC800]" : "text-[#E2E8EA]",
            )}
          />
        ))}
      </span>
      <span className="text-xs font-medium text-[#66777D]">
        {rating.toLocaleString(language === "bn" ? "bn-BD" : "en-US", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}
        {count !== undefined ? ` (${count.toLocaleString(language === "bn" ? "bn-BD" : "en-US")})` : ""}
      </span>
      <span className="sr-only">Rating {rating} out of 5</span>
    </span>
  );
}

/* ---------------------------- Quantity selector ---------------------------- */

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  compact = false,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  compact?: boolean;
}) {
  const btn = cn(
    "flex items-center justify-center text-[#075ED1] transition hover:bg-[#EAF3FE] disabled:cursor-not-allowed disabled:text-[#66777D]/40 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-[#075ED1]",
    compact ? "h-7 w-7" : "h-9 w-9",
  );
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border border-[#E2E8EA] bg-white",
        compact ? "h-7" : "h-9",
      )}
    >
      <button
        type="button"
        className={btn}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className={compact ? "h-3 w-3" : "h-4 w-4"} />
      </button>
      <span
        className={cn(
          "text-center font-semibold tabular-nums text-[#17242A]",
          compact ? "w-7 text-xs" : "w-10 text-sm",
        )}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        className={btn}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus className={compact ? "h-3 w-3" : "h-4 w-4"} />
      </button>
    </div>
  );
}

/* -------------------------------- Breadcrumb ------------------------------- */

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-[#66777D] sm:text-[13px]">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-1">
            {i > 0 ? <ChevronRight className="h-3 w-3 shrink-0 text-[#66777D]/60" /> : null}
            {item.href ? (
              <Link
                href={item.href}
                className="truncate transition hover:text-[#075ED1] hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="truncate font-medium text-[#17242A]">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ----------------------------- Section heading ----------------------------- */

export function SectionHeading({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8", className)}>
      <div className="min-w-0">
        <h2 className="text-[22px] font-bold leading-snug text-[#0346A5] sm:text-[28px]">
          {title}
        </h2>
        {subtitle ? <p className="mt-1.5 max-w-2xl text-sm text-[#66777D]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

/* ---------------------------------- Badge --------------------------------- */

export function Badge({
  children,
  tone = "teal",
  className,
}: {
  children: ReactNode;
  tone?: "teal" | "green" | "amber" | "red" | "muted";
  className?: string;
}) {
  const tones: Record<string, string> = {
    teal: "bg-[#EAF3FE] text-[#075ED1]",
    green: "bg-[#2D9819]/10 text-[#238014]",
    amber: "bg-[#FFC800]/15 text-[#8A6400]",
    red: "bg-[#DC2626]/10 text-[#B91C1C]",
    muted: "bg-[#E2E8EA]/60 text-[#66777D]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------ Form controls ------------------------------ */

export const inputClass =
  "w-full rounded-xl border border-[#E2E8EA] bg-white px-3.5 py-2.5 text-[15px] text-[#17242A] placeholder:text-[#66777D]/60 transition focus:border-[#075ED1] focus:outline-none focus:ring-2 focus:ring-[#075ED1]/15 disabled:bg-[#F7F9FA]";

export function Field({
  label,
  htmlFor,
  error,
  required,
  optionalLabel,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  optionalLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-[#17242A]">
        {label}
        {required ? <span className="ml-0.5 text-[#DC2626]">*</span> : null}
        {!required && optionalLabel ? (
          <span className="ml-1.5 font-normal text-[#66777D]">({optionalLabel})</span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-[#DC2626]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({
  invalid,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...props}
      aria-invalid={invalid || undefined}
      className={cn(inputClass, invalid && "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/15", className)}
    />
  );
}

export function TextArea({
  invalid,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid || undefined}
      className={cn(inputClass, "min-h-[110px] resize-y", invalid && "border-[#DC2626]", className)}
    />
  );
}

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputClass, "appearance-none pr-8", className)} />;
}

/* ------------------------------ WhatsApp icon ------------------------------ */

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("flex items-center justify-center rounded-full bg-[#FFC800] text-[#0346A5]", className)}
    >
      <span className="translate-y-[1px] font-sans text-[13px] font-black leading-none">f</span>
    </span>
  );
}
