"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/lib/i18n/LocaleProvider";

/**
 * Cart, checkout, and delivery/return-policy controls exist in the visual
 * design but are intentionally inert — see AGENTS.md, "Cart/checkout/
 * delivery UI exists visually but is intentionally inert." Every one of
 * those controls calls `trigger()` from this single shared dialog instead
 * of being wired to real behaviour, so there's exactly one place that
 * decides what "not built yet" looks like, not a different disabled-state
 * treatment per button.
 */
interface ComingSoonContextValue {
  trigger: (featureLabel?: string) => void;
}

const ComingSoonContext = createContext<ComingSoonContextValue | null>(null);

export function ComingSoonProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState<string | undefined>();
  const t = useTranslations("comingSoon");

  const trigger = useCallback((featureLabel?: string) => {
    setLabel(featureLabel);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ trigger }), [trigger]);

  return (
    <ComingSoonContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{label ? `${label} — ${t("body")}` : t("body")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setOpen(false)}>{t("close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ComingSoonContext.Provider>
  );
}

/** Returns a `trigger(label?)` function — call it from any onClick to open the shared "coming soon" dialog. */
export function useComingSoon(): ComingSoonContextValue {
  const ctx = useContext(ComingSoonContext);
  if (!ctx) {
    throw new Error("useComingSoon must be used within a ComingSoonProvider");
  }
  return ctx;
}
