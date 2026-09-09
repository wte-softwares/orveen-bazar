/** Core domain types for ORVEEN BAZZAR — shared by UI now and future backend integration. */

export type Lang = "bn" | "en";

export interface LocalizedText {
  bn: string;
  en: string;
}

export type CategoryGroup = "food" | "household" | "beverages" | "future";

/** Stylised placeholder package illustration used until real product photos exist. */
export type PackageVisual =
  | "bottle"
  | "jug"
  | "bag"
  | "pouch"
  | "can"
  | "spray"
  | "box"
  | "coil";

export interface Category {
  slug: string;
  name: LocalizedText;
  group: CategoryGroup;
  description: LocalizedText;
  comingSoon: boolean;
  /** soft background tint for product visuals */
  tint: string;
  /** package body colour */
  pack: string;
  /** accent colour (cap / label stripe) */
  accent: string;
  visual: PackageVisual;
  icon: string;
}

export interface Product {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  shortDescription: LocalizedText;
  brand: string;
  category: LocalizedText;
  categorySlug: string;
  subcategory?: LocalizedText;
  price: number;
  comparePrice?: number;
  discountPercentage: number;
  unit: LocalizedText;
  weight: string;
  sku: string;
  stock: number;
  stockStatus: "in" | "out";
  rating: number;
  reviewCount: number;
  images: string[];
  visual: PackageVisual;
  tint: string;
  pack: string;
  accent: string;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  /** bilingual search keywords */
  tags: string[];
}

export interface CartItem {
  id: string;
  qty: number;
}

export interface OrderItem {
  id: string;
  slug: string;
  name: LocalizedText;
  unit: LocalizedText;
  price: number;
  qty: number;
}

export interface CheckoutInfo {
  fullName: string;
  mobile: string;
  email: string;
  district: string;
  upazila: string;
  area: string;
  address: string;
  notes: string;
}

export interface Order {
  ref: string;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  deliveryZone: "inside" | "outside";
  /** null = to be configured / confirmed at order confirmation */
  deliveryFee: number | null;
  total: number;
  customer: CheckoutInfo;
  payment: "cod";
  demo: true;
}

export interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export interface Session {
  name: string;
  email: string;
  mobile: string;
}
