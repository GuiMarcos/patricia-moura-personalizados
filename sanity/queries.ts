import { client, isSanityConfigured } from "./client";
import type { Product } from "@mkt-digital/types";

export const allProductsQuery = `*[_type == "product"] | order(_createdAt desc) {
  _id,
  name,
  "slug": slug.current,
  description,
  price,
  category,
  images[] {
    "url": asset->url,
    "alt": alt
  },
  customizable,
  featured,
  variants[] {
    name,
    price
  }
}`;

export const productBySlugQuery = `*[_type == "product" && slug.current == $slug][0] {
  _id,
  name,
  "slug": slug.current,
  description,
  price,
  category,
  images[] {
    "url": asset->url,
    "alt": alt
  },
  customizable,
  featured,
  variants[] {
    name,
    price
  }
}`;

export const featuredProductsQuery = `*[_type == "product" && featured == true] | order(_createdAt desc) {
  _id,
  name,
  "slug": slug.current,
  description,
  price,
  category,
  images[] {
    "url": asset->url,
    "alt": alt
  },
  customizable,
  featured,
  variants[] {
    name,
    price
  }
}`;

export const productsByCategoryQuery = `*[_type == "product" && category == $category] | order(_createdAt desc) {
  _id,
  name,
  "slug": slug.current,
  description,
  price,
  category,
  images[] {
    "url": asset->url,
    "alt": alt
  },
  customizable,
  featured,
  variants[] {
    name,
    price
  }
}`;

export const allOrdersQuery = `*[_type == "order"] | order(_createdAt desc) {
  _id,
  items[] {
    product-> {
      name,
      price
    },
    quantity,
    price,
    variantName,
    customNote,
    artworkUrls
  },
  total,
  status,
  customerNote,
  _createdAt
}`;

// Demo data for when Sanity is not configured
const demoProducts: Product[] = [
  {
    _id: "1",
    name: "Caneca Personalizada - Amor",
    slug: "caneca-personalizada-amor",
    description: "Caneca de porcelana com estampa personalizada. Perfeita para presentear alguém especial.",
    price: 39.90,
    category: "caneca",
    images: [{ url: "https://placehold.co/600x600/f0abfc/701a75?text=Caneca+Amor", alt: "Caneca Amor" }],
    customizable: true,
    featured: true,
  },
  {
    _id: "2",
    name: "Caneca Café é Vida",
    slug: "caneca-cafe-e-vida",
    description: "Para os amantes de café. Caneca com frase engraçada.",
    price: 34.90,
    category: "caneca",
    images: [{ url: "https://placehold.co/600x600/f0abfc/701a75?text=Caneca+Cafe", alt: "Caneca Café" }],
    customizable: false,
    featured: false,
  },
  {
    _id: "3",
    name: "Camiseta Estampada - Luna",
    slug: "camiseta-estampada-luna",
    description: "Camiseta 100% algodão com estampa exclusiva. Disponível em vários tamanhos.",
    price: 59.90,
    category: "camiseta",
    images: [{ url: "https://placehold.co/600x600/e879f9/701a75?text=Camiseta+Luna", alt: "Camiseta Luna" }],
    customizable: true,
    featured: true,
  },
  {
    _id: "4",
    name: "Camiseta Geométrica",
    slug: "camiseta-geometrica",
    description: "Design moderno com padrões geométricos. Algodão premium.",
    price: 54.90,
    category: "camiseta",
    images: [{ url: "https://placehold.co/600x600/e879f9/701a75?text=Camiseta+Geo", alt: "Camiseta Geométrica" }],
    customizable: false,
    featured: false,
  },
];

export async function fetchProducts(category?: string): Promise<Product[]> {
  if (!isSanityConfigured) {
    if (category) return demoProducts.filter((p) => p.category === category);
    return demoProducts;
  }
  if (category) return client.fetch(productsByCategoryQuery, { category });
  return client.fetch(allProductsQuery);
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (!isSanityConfigured) return demoProducts.find((p) => p.slug === slug) || null;
  return client.fetch(productBySlugQuery, { slug });
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  if (!isSanityConfigured) return demoProducts.filter((p) => p.featured);
  return client.fetch(featuredProductsQuery);
}

export async function fetchProductsByCategory(category: string): Promise<Product[]> {
  if (!isSanityConfigured) return demoProducts.filter((p) => p.category === category);
  return client.fetch(productsByCategoryQuery, { category });
}

export async function fetchOrders(): Promise<unknown[]> {
  if (!isSanityConfigured) return [];
  return client.fetch(allOrdersQuery);
}
