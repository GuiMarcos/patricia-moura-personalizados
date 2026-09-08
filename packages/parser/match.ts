import Fuse, { type IFuseOptions } from "fuse.js";

export interface MatchableVariant {
  name: string;
  price: number;
}

export interface MatchableProduct {
  _id: string;
  name: string;
  price: number;
  variants?: MatchableVariant[];
}

export interface LineMatch {
  productId: string | null;
  matchedName: string | null;
  confidence: number;
  variantName?: string;
  price: number | null;
}

const FUSE_OPTIONS: IFuseOptions<MatchableProduct> = {
  keys: ["name"],
  threshold: 0.38,
  ignoreLocation: true,
  includeScore: true,
};

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickVariant(product: MatchableProduct, query: string): MatchableVariant | undefined {
  if (!product.variants?.length) return undefined;
  const q = normalize(query);
  let best: MatchableVariant | undefined;
  let bestLength = 0;
  for (const variant of product.variants) {
    const name = normalize(variant.name);
    if (!name) continue;
    if (name.length > bestLength && q.includes(name)) {
      best = variant;
      bestLength = name.length;
    }
  }
  return best;
}

function buildMatch(
  product: MatchableProduct,
  query: string,
  confidence: number
): LineMatch {
  const variant = pickVariant(product, query);
  return {
    productId: product._id,
    matchedName: product.name,
    confidence,
    variantName: variant?.name,
    price: variant?.price ?? product.price,
  };
}

export function matchCatalog(
  catalog: MatchableProduct[],
  nameRaw: string
): LineMatch {
  const query = normalize(nameRaw);
  if (!query) {
    return { productId: null, matchedName: null, confidence: 0, price: null };
  }

  const exact = catalog.find((product) => normalize(product.name) === query);
  if (exact) return buildMatch(exact, query, 1);

  const included = catalog.find(
    (product) =>
      query.includes(normalize(product.name)) ||
      normalize(product.name).includes(query)
  );
  if (included) return buildMatch(included, query, 0.9);

  const variantHit = catalog.find((product) =>
    product.variants?.some((variant) => query.includes(normalize(variant.name)))
  );
  if (variantHit) return buildMatch(variantHit, query, 0.85);

  const fuse = new Fuse(catalog, FUSE_OPTIONS);
  const [top] = fuse.search(query);
  const threshold = FUSE_OPTIONS.threshold ?? 0.38;
  if (top?.item && top.score !== undefined && top.score <= threshold) {
    return buildMatch(top.item, query, Math.max(0, Math.min(1, 1 - top.score)));
  }

  return { productId: null, matchedName: null, confidence: 0, price: null };
}