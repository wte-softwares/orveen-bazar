import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * ORVEEN wordmark: blue "O" ring with green leaves (matching the brand billboard),
 * drawn as inline SVG so the real logo file can replace it later without layout changes.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none">
      <defs>
        <linearGradient id="orveen-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7DC242" />
          <stop offset="100%" stopColor="#1F7A33" />
        </linearGradient>
      </defs>
      <circle cx="27" cy="37" r="19" stroke="currentColor" strokeWidth="8" />
      <path
        d="M43 24c3-9 11-15 19-16-1 9-6 16-14 18-2 .5-4-1-5-2Z"
        fill="url(#orveen-leaf)"
      />
      <path d="M40 27c-1-5 0-10 3-13 2 3 3 8 1 12-.8 1.6-2.6 1.6-4 1Z" fill="url(#orveen-leaf)" opacity="0.85" />
      <path
        d="M46 30c4-2 9-2 13 0-3 3-8 5-12 4-1.6-.4-1.6-2.6-1-4Z"
        fill="url(#orveen-leaf)"
        opacity="0.85"
      />
    </svg>
  );
}

export function Logo({
  compact = false,
  light = false,
  /** Show only the icon until the `sm` breakpoint (used in the mobile header to save space). */
  iconOnlyOnMobile = false,
}: {
  compact?: boolean;
  light?: boolean;
  iconOnlyOnMobile?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "flex shrink-0 items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1D4ED8]",
        iconOnlyOnMobile && "gap-0 sm:gap-2",
      )}
      aria-label="ORVEEN BAZZAR home"
    >
      <LogoMark
        className={cn(compact ? "h-8 w-8" : "h-9 w-9 sm:h-10 sm:w-10", light ? "text-white" : "text-[#1D4ED8]")}
      />
      <span className={cn("flex-col leading-none", iconOnlyOnMobile ? "hidden sm:flex" : "flex")}>
        <span
          className={cn(
            "font-black tracking-tight",
            compact ? "text-[15px]" : "text-base sm:text-lg",
          )}
        >
          <span className={light ? "text-white" : "text-[#16339B]"}>ORVEEN</span>{" "}
          <span className={light ? "text-[#8ED060]" : "text-[#2E9E44]"}>BAZAAR</span>
          <span className={light ? "text-[#FFC800]" : "text-[#1D4ED8]"}>.COM</span>
        </span>
        {!compact ? (
          <span
            className={cn(
              "mt-1 text-[8.5px] font-semibold uppercase tracking-[0.22em]",
              light ? "text-white/70" : "text-[#66777D]",
            )}
          >
            Reliable Multi Products
          </span>
        ) : null}
      </span>
    </Link>
  );
}
