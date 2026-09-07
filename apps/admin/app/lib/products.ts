/** Tipos e helpers puros do admin (seguro importar em Client Components). */

export const CATEGORIES = [
  { value: "caneca", label: "Caneca" },
  { value: "camiseta", label: "Camiseta" },
  { value: "chaveiro", label: "Chaveiro" },
  { value: "garrafa", label: "Garrafa" },
  { value: "toalha", label: "Toalha" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export function categoryLabel(value: string): string {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export interface AdminVariant {
  name: string;
  price: number;
}

export interface AdminImage {
  assetId: string;
  url: string;
}

export interface AdminProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  customizable: boolean;
  featured: boolean;
  variants: AdminVariant[];
  images: AdminImage[];
  thumbUrl?: string;
}
