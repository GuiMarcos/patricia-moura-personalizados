import type { SanityClient } from "next-sanity";
import { CATEGORIES, slugify } from "@/app/lib/products";

export interface ProductInput {
  name: unknown;
  description: unknown;
  price: unknown;
  category: unknown;
  customizable?: unknown;
  featured?: unknown;
  variants?: unknown;
  images?: unknown;
}

export interface ValidProduct {
  name: string;
  description: string;
  price: number;
  category: string;
  customizable: boolean;
  featured: boolean;
  variants: { name: string; price: number }[];
  imageAssetIds: string[];
}

/** Valida o corpo de POST/PATCH. `partial` = PATCH (campos opcionais). */
export function validateProductInput(
  body: ProductInput,
  partial = false
): ValidProduct {
  const fail = (msg: string): never => {
    throw new Error(msg);
  };

  const need = (cond: boolean, msg: string) => {
    if (!cond) fail(msg);
  };

  const out: ValidProduct = {
    name: "",
    description: "",
    price: 0,
    category: "",
    customizable: false,
    featured: false,
    variants: [],
    imageAssetIds: [],
  };

  if (body.name !== undefined || !partial) {
    need(
      typeof body.name === "string" && body.name.trim().length >= 3,
      "Nome é obrigatório (mín. 3 letras)."
    );
    out.name = (body.name as string).trim();
  }

  if (body.description !== undefined || !partial) {
    need(
      typeof body.description === "string" && body.description.trim().length >= 10,
      "Descrição é obrigatória (mín. 10 letras)."
    );
    out.description = (body.description as string).trim();
  }

  if (body.price !== undefined || !partial) {
    const price = Number(body.price);
    need(Number.isFinite(price) && price >= 0, "Preço inválido.");
    out.price = Math.round(price * 100) / 100;
  }

  if (body.category !== undefined || !partial) {
    need(
      typeof body.category === "string" &&
        CATEGORIES.some((c) => c.value === body.category),
      "Categoria inválida."
    );
    out.category = body.category as string;
  }

  if (body.customizable !== undefined) out.customizable = !!body.customizable;
  if (body.featured !== undefined) out.featured = !!body.featured;

  if (body.variants !== undefined) {
    need(Array.isArray(body.variants), "Variações inválidas.");
    const seen = new Set<string>();
    out.variants = (body.variants as unknown[]).map((v, i) => {
      const row = v as { name?: unknown; price?: unknown };
      need(typeof row?.name === "string" && (row.name as string).trim().length > 0, `Variação ${i + 1}: nome obrigatório.`);
      const name = (row.name as string).trim();
      need(!seen.has(name.toLowerCase()), `Variação duplicada: "${name}".`);
      seen.add(name.toLowerCase());
      const price = Number(row.price);
      need(Number.isFinite(price) && price >= 0, `Variação "${name}": preço inválido.`);
      return { name, price: Math.round(price * 100) / 100 };
    });
  }

  if (body.images !== undefined) {
    need(Array.isArray(body.images), "Imagens inválidas.");
    out.imageAssetIds = (body.images as unknown[]).map((img, i) => {
      const id =
        typeof img === "string" ? img : (img as { assetId?: unknown })?.assetId;
      need(typeof id === "string" && id.length > 0, `Imagem ${i + 1} inválida.`);
      return id as string;
    });
  }

  if (!partial) {
    need(out.imageAssetIds.length >= 1, "Adicione pelo menos 1 imagem.");
  } else if (body.images !== undefined) {
    need(out.imageAssetIds.length >= 1, "O produto precisa de pelo menos 1 imagem.");
  }

  return out;
}

/** Slug único: base, base-2, base-3... */
export async function ensureUniqueSlug(
  client: SanityClient,
  baseName: string
): Promise<string> {
  const base = slugify(baseName) || "produto";
  let slug = base;
  let n = 2;
  for (;;) {
    const existing = await client.fetch(
      `*[_type == "product" && slug.current == $slug][0]._id`,
      { slug }
    );
    if (!existing) return slug;
    slug = `${base}-${n++}`;
  }
}

export function toImageObjects(assetIds: string[]) {
  return assetIds.map((assetId, i) => ({
    _key: `img${i}`,
    _type: "image",
    asset: { _type: "reference", _ref: assetId },
  }));
}

export const ADMIN_LIST_QUERY = `*[_type == "product"] | order(_createdAt desc) {
  _id,
  name,
  "slug": slug.current,
  price,
  category,
  customizable,
  featured,
  "thumbUrl": images[0].asset->url,
  "imageCount": count(images),
  variants[] { name, price }
}`;
