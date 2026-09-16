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
import { items as seedItems, type CatalogItem } from "@/data/items";
import { categories as seedCategories, type CatalogCategory } from "@/data/categories";
import { banners as seedBanners, type Banner } from "@/data/banners";
import { mockUsers, type AdminUser } from "@/data/users";
import { organizations, type OrgSlug } from "@/data/organizations";
import type { LocalizedText } from "@/lib/types";
import { readLS, writeLS, LS_KEYS } from "@/lib/utils";

export interface OrgSettings {
  brandName: string;
  intro: LocalizedText;
  contactText: LocalizedText;
  logoDataUrl?: string;
}

export interface AdminState {
  items: CatalogItem[];
  categories: CatalogCategory[];
  banners: Banner[];
  settings: Record<string, OrgSettings>;
  users: AdminUser[];
}

interface AdminStoreValue {
  state: AdminState;
  selectedOrg: OrgSlug;
  setSelectedOrg: (org: OrgSlug) => void;
  /* content mutations (frontend simulation) */
  saveItem: (item: CatalogItem) => void;
  setItemStatus: (id: string, status: CatalogItem["status"]) => void;
  saveCategory: (category: CatalogCategory) => void;
  deleteCategory: (orgSlug: OrgSlug, categorySlug: string) => void;
  saveBanner: (banner: Banner) => void;
  saveSettings: (org: OrgSlug, settings: OrgSettings) => void;
  setUserStatus: (id: string, status: AdminUser["status"]) => void;
  setUserOrgs: (id: string, orgs: OrgSlug[]) => void;
  /** true while an admin editor holds unsaved changes (guards org switching) */
  editorDirty: boolean;
  setEditorDirty: (dirty: boolean) => void;
  /** restore the original seed content (QA helper) */
  resetDemoData: () => void;
  /* public selectors */
  publishedItems: (org?: string) => CatalogItem[];
  itemBySlugPublic: (slug: string) => CatalogItem | undefined;
  settingsFor: (org: OrgSlug) => OrgSettings;
}

const AdminStoreContext = createContext<AdminStoreValue | null>(null);

/*
 * FRONTEND CMS prototype storage (localStorage only).
 * Production integration point: swap this provider for an
 * AdminContentRepository backed by a database (see src/lib/repositories.ts).
 */
const LS_KEY = "orveen-demo-admin-data";

function seedState(): AdminState {
  const settings: Record<string, OrgSettings> = {};
  for (const org of organizations) {
    settings[org.slug] = {
      brandName: org.name,
      intro: org.intro,
      contactText: org.contactText,
    };
  }
  return {
    items: seedItems,
    categories: seedCategories,
    banners: seedBanners,
    settings,
    users: mockUsers,
  };
}

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminState>(() => seedState());
  const [selectedOrg, setSelectedOrg] = useState<OrgSlug>("orveen");
  const hydrated = useRef(false);

  useEffect(() => {
    const stored = readLS<AdminState | null>(LS_KEY, null);
    const registered = readLS<{ name: string; email: string }[]>(LS_KEYS.demoUsers, []);
    const regUsers: AdminUser[] = registered.map((r) => ({
      id: `reg-${r.email}`,
      name: r.name,
      email: r.email,
      role: "customer" as const,
      orgs: [],
      status: "active" as const,
    }));

    const baseUsers = stored?.users?.length ? stored.users : mockUsers;
    const mergedUsers = [...baseUsers];
    for (const ru of regUsers) {
      if (!mergedUsers.some((u) => u.email === ru.email)) {
        mergedUsers.push(ru);
      }
    }

    const apply = window.setTimeout(() => {
      if (stored && stored.items && stored.categories && stored.banners && stored.settings) {
        setState({ ...seedState(), ...stored, users: mergedUsers });
      } else {
        setState((prev) => ({ ...prev, users: mergedUsers }));
      }
      hydrated.current = true;
    }, 0);
    return () => window.clearTimeout(apply);
  }, []);

  useEffect(() => {
    if (hydrated.current) writeLS(LS_KEY, state);
  }, [state]);

  const saveItem = useCallback((item: CatalogItem) => {
    setState((prev) => {
      const exists = prev.items.some((i) => i.id === item.id);
      return {
        ...prev,
        items: exists
          ? prev.items.map((i) => (i.id === item.id ? item : i))
          : [{ ...item, updatedAt: new Date().toISOString().slice(0, 10) }, ...prev.items],
      };
    });
  }, []);

  const setItemStatus = useCallback((id: string, status: CatalogItem["status"]) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === id ? { ...i, status, updatedAt: new Date().toISOString().slice(0, 10) } : i,
      ),
    }));
  }, []);

  const saveCategory = useCallback((category: CatalogCategory) => {
    setState((prev) => {
      const exists = prev.categories.some((c) => c.slug === category.slug && c.orgSlug === category.orgSlug);
      return {
        ...prev,
        categories: exists
          ? prev.categories.map((c) =>
              c.slug === category.slug && c.orgSlug === category.orgSlug ? category : c,
            )
          : [...prev.categories, category],
      };
    });
  }, []);

  const deleteCategory = useCallback((orgSlug: OrgSlug, categorySlug: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => !(c.orgSlug === orgSlug && c.slug === categorySlug)),
    }));
  }, []);

  const saveBanner = useCallback((banner: Banner) => {
    setState((prev) => {
      const exists = prev.banners.some((b) => b.id === banner.id);
      return {
        ...prev,
        banners: exists ? prev.banners.map((b) => (b.id === banner.id ? banner : b)) : [...prev.banners, banner],
      };
    });
  }, []);

  const saveSettings = useCallback((org: OrgSlug, settings: OrgSettings) => {
    setState((prev) => ({ ...prev, settings: { ...prev.settings, [org]: settings } }));
  }, []);

  const setUserStatus = useCallback((id: string, status: AdminUser["status"]) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === id ? { ...u, status } : u)),
    }));
  }, []);

  const setUserOrgs = useCallback((id: string, orgs: OrgSlug[]) => {
    setState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === id ? { ...u, orgs } : u)),
    }));
  }, []);

  const [editorDirty, setEditorDirty] = useState(false);

  const resetDemoData = useCallback(() => {
    const fresh = seedState();
    setState(fresh);
    writeLS(LS_KEY, fresh);
  }, []);

  const publishedItems = useCallback(
    (org?: string) =>
      state.items.filter((i) => i.status === "published" && (!org || i.orgSlug === org)),
    [state.items],
  );

  const itemBySlugPublic = useCallback(
    (slug: string) => state.items.find((i) => i.slug === slug && i.status === "published"),
    [state.items],
  );

  const settingsFor = useCallback(
    (org: OrgSlug): OrgSettings =>
      state.settings[org] ?? {
        brandName: org,
        intro: { bn: "", en: "" },
        contactText: { bn: "", en: "" },
      },
    [state.settings],
  );

  const value = useMemo(
    () => ({
      state,
      selectedOrg,
      setSelectedOrg,
      saveItem,
      setItemStatus,
      saveCategory,
      deleteCategory,
      saveBanner,
      saveSettings,
      setUserStatus,
      setUserOrgs,
      editorDirty,
      setEditorDirty,
      resetDemoData,
      publishedItems,
      itemBySlugPublic,
      settingsFor,
    }),
    [
      state,
      selectedOrg,
      saveItem,
      setItemStatus,
      saveCategory,
      deleteCategory,
      saveBanner,
      saveSettings,
      setUserStatus,
      setUserOrgs,
      editorDirty,
      resetDemoData,
      publishedItems,
      itemBySlugPublic,
      settingsFor,
    ],
  );

  return <AdminStoreContext.Provider value={value}>{children}</AdminStoreContext.Provider>;
}

export function useAdminStore(): AdminStoreValue {
  const ctx = useContext(AdminStoreContext);
  if (!ctx) throw new Error("useAdminStore must be used inside <AdminStoreProvider>");
  return ctx;
}
