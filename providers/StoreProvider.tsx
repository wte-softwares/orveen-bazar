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
import { LS_KEYS, readLS, writeLS } from "@/lib/utils";
import { products } from "@/data/products";
import type { CartItem, Product, ToastItem } from "@/lib/types";

/* ------------------------------- Cart ------------------------------- */

export interface CartLine {
  product: Product;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  lines: CartLine[];
  count: number;
  subtotal: number;
  qtyOf: (id: string) => number;
  add: (id: string, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/* ----------------------------- Wishlist ----------------------------- */

interface WishlistContextValue {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => boolean;
  remove: (id: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

/* -------------------------- Recently viewed -------------------------- */

interface RecentContextValue {
  ids: string[];
  push: (id: string) => void;
}

const RecentContext = createContext<RecentContextValue | null>(null);

/* ------------------------------- Toasts ------------------------------ */

interface ToastContextValue {
  toasts: ToastItem[];
  push: (message: string, type?: ToastItem["type"]) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/* ----------------------------- UI overlays ---------------------------- */

interface UIContextValue {
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  quickViewId: string | null;
  setQuickViewId: (id: string | null) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

/* ------------------------------ Provider ------------------------------ */

export function StoreProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const toastId = useRef(0);
  const hydrated = useRef(false);

  /* hydrate from localStorage after mount (SSR safe) */
  useEffect(() => {
    setItems(readLS<CartItem[]>(LS_KEYS.cart, []));
    setWishlist(readLS<string[]>(LS_KEYS.wishlist, []));
    setRecent(readLS<string[]>(LS_KEYS.recent, []));
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (hydrated.current) writeLS(LS_KEYS.cart, items);
  }, [items]);
  useEffect(() => {
    if (hydrated.current) writeLS(LS_KEYS.wishlist, wishlist);
  }, [wishlist]);
  useEffect(() => {
    if (hydrated.current) writeLS(LS_KEYS.recent, recent);
  }, [recent]);

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

  const qtyOf = useCallback(
    (id: string) => items.find((item) => item.id === id)?.qty ?? 0,
    [items],
  );

  const add = useCallback((id: string, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === id);
      const product = products.find((p) => p.id === id);
      const max = Math.max(product?.stock ?? 99, 1);
      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, qty: Math.min(item.qty + qty, max) } : item,
        );
      }
      return [...prev, { id, qty: Math.min(qty, max) }];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) => {
      const product = products.find((p) => p.id === id);
      const max = Math.max(product?.stock ?? 99, 1);
      const safe = Math.max(1, Math.min(Math.floor(qty) || 1, max));
      return prev.map((item) => (item.id === id ? { ...item, qty: safe } : item));
    });
  }, []);

  const increment = useCallback(
    (id: string) => {
      const product = products.find((p) => p.id === id);
      const max = Math.max(product?.stock ?? 99, 1);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, qty: Math.min(item.qty + 1, max) } : item,
        ),
      );
    },
    [],
  );

  const decrement = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(item.qty - 1, 1) } : item,
      ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const lines = useMemo<CartLine[]>(
    () =>
      items
        .map((item) => {
          const product = products.find((p) => p.id === item.id);
          return product ? { product, qty: item.qty } : null;
        })
        .filter((line): line is CartLine => line !== null),
    [items],
  );

  const count = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items]);
  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.product.price * line.qty, 0),
    [lines],
  );

  const has = useCallback((id: string) => wishlist.includes(id), [wishlist]);

  const toggle = useCallback((id: string) => {
    let added = false;
    setWishlist((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      added = true;
      return [...prev, id];
    });
    return !wishlist.includes(id) || added;
  }, [wishlist]);

  const removeWish = useCallback((id: string) => {
    setWishlist((prev) => prev.filter((x) => x !== id));
  }, []);

  const pushRecent = useCallback((id: string) => {
    setRecent((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 8));
  }, []);

  const cartValue = useMemo(
    () => ({ items, lines, count, subtotal, qtyOf, add, remove, setQty, increment, decrement, clear }),
    [items, lines, count, subtotal, qtyOf, add, remove, setQty, increment, decrement, clear],
  );
  const wishValue = useMemo(
    () => ({ ids: wishlist, has, toggle, remove: removeWish }),
    [wishlist, has, toggle, removeWish],
  );
  const recentValue = useMemo(() => ({ ids: recent, push: pushRecent }), [recent, pushRecent]);
  const toastValue = useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss]);
  const uiValue = useMemo(
    () => ({
      cartOpen,
      setCartOpen,
      menuOpen,
      setMenuOpen,
      quickViewId,
      setQuickViewId,
      searchOpen,
      setSearchOpen,
    }),
    [cartOpen, menuOpen, quickViewId, searchOpen],
  );

  return (
    <UIContext.Provider value={uiValue}>
      <ToastContext.Provider value={toastValue}>
        <CartContext.Provider value={cartValue}>
          <WishlistContext.Provider value={wishValue}>
            <RecentContext.Provider value={recentValue}>{children}</RecentContext.Provider>
          </WishlistContext.Provider>
        </CartContext.Provider>
      </ToastContext.Provider>
    </UIContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <StoreProvider>");
  return ctx;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <StoreProvider>");
  return ctx;
}

export function useRecent(): RecentContextValue {
  const ctx = useContext(RecentContext);
  if (!ctx) throw new Error("useRecent must be used inside <StoreProvider>");
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
