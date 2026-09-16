"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { LS_KEYS, readLS, writeLS, removeLS } from "@/lib/utils";
import type { ToastItem } from "@/lib/types";
import { useAuth } from "@/providers/AuthProvider";

/* ----------------------------- Wishlist ----------------------------- */

interface WishlistContextValue {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => boolean;
  add: (id: string) => void;
  remove: (id: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

/* ------------------------------- Toasts ------------------------------ */

interface ToastContextValue {
  toasts: ToastItem[];
  push: (message: string, type?: ToastItem["type"]) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/* ----------------------------- UI overlays ---------------------------- */

interface UIContextValue {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const toastId = useRef(0);
  const hydrated = useRef(false);
  const wishlistKey = user ? `${LS_KEYS.wishlist}:${user.id}` : null;

  useEffect(() => {
    if (!wishlistKey) {
      const reset = window.setTimeout(() => setWishlist([]), 0);
      hydrated.current = false;
      return () => window.clearTimeout(reset);
    }
    const stored = readLS<string[]>(wishlistKey, []);
    const pending = readLS<string | null>(LS_KEYS.pendingWishlist, null);
    let initial = stored;
    if (pending) {
      removeLS(LS_KEYS.pendingWishlist);
      if (!initial.includes(pending)) {
        initial = [...initial, pending];
      }
      writeLS(wishlistKey, initial);
    }
    const apply = window.setTimeout(() => setWishlist(initial), 0);
    hydrated.current = true;
    return () => window.clearTimeout(apply);
  }, [wishlistKey]);

  useEffect(() => {
    if (!wishlistKey || !hydrated.current) return;
    writeLS(wishlistKey, wishlist);
  }, [wishlist, wishlistKey]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (message: string, type: ToastItem["type"] = "success") => {
      const id = ++toastId.current;
      setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
      window.setTimeout(() => dismiss(id), 3200);
    },
    [dismiss],
  );

  const has = useCallback((id: string) => wishlist.includes(id), [wishlist]);

  const add = useCallback((id: string) => {
    setWishlist((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const remove = useCallback((id: string) => {
    setWishlist((prev) => prev.filter((x) => x !== id));
  }, []);

  const toggle = useCallback(
    (id: string) => {
      const adding = !wishlist.includes(id);
      setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
      return adding;
    },
    [wishlist],
  );

  const wishValue = useMemo(
    () => ({ ids: wishlist, has, toggle, add, remove }),
    [wishlist, has, toggle, add, remove],
  );
  const toastValue = useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss]);
  const uiValue = useMemo(
    () => ({ menuOpen, setMenuOpen, searchOpen, setSearchOpen }),
    [menuOpen, searchOpen],
  );

  return (
    <UIContext.Provider value={uiValue}>
      <ToastContext.Provider value={toastValue}>
        <WishlistContext.Provider value={wishValue}>{children}</WishlistContext.Provider>
      </ToastContext.Provider>
    </UIContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <StoreProvider>");
  return ctx;
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <StoreProvider>");
  return ctx;
}

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside <StoreProvider>");
  return ctx;
}
