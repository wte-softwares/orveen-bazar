import { PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared visual stand-in for catalog items with no uploaded image, used by
 * both the homepage/catalog cards and the item detail gallery so a missing
 * image never renders as empty/blank space or bare "No image" text.
 */
export function ProductImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--color-primary-50)] to-[var(--color-warning-100)]",
        className,
      )}
    >
      <PackageSearch className="h-1/4 w-1/4 min-h-8 min-w-8 text-[var(--brand-primary)]/40" aria-hidden="true" />
    </div>
  );
}
