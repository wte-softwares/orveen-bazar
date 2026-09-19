import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The single source of truth for the storefront's fixed content width —
 * `--container-max` (1280px) and `--container-pad` (24px), both from the
 * client's design tokens (app/globals.css).
 *
 * Every public-facing section (header, hero, brand cards, product grids,
 * footer, etc.) must wrap its content in this instead of repeating the
 * width/padding classes inline — that duplication is exactly how the
 * header drifted out of alignment with the sections below it (it used a
 * viewport-relative `5vw` padding with no max-width cap, so on a wide
 * screen its content stretched noticeably wider than everything else).
 * `--container-pad` is a **fixed** pixel value on purpose — once the
 * container itself is capped, a `vw`-based gutter would just reintroduce
 * the same "grows with the viewport instead of staying fixed" problem one
 * level in.
 *
 * Adding a new full-width section (a background color, a border) still
 * works: put the background on the outer semantic element (`<header>`,
 * `<section>`, ...) and this `Container` only around the content that
 * should line up with the rest of the page.
 */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-(--container-max) px-(--container-pad)",
        className,
      )}
    >
      {children}
    </div>
  );
}
