export type DiscountType = "none" | "fixed" | "percent";

export interface ValidOrderItem {
  productId: string;
  quantity: number;
  price: number;
  variantName?: string;
  customNote?: string;
}

export interface ValidOrderInput {
  items: ValidOrderItem[];
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerNote?: string;
  discountType: DiscountType;
  discountValue: number;
  subtotal: number;
  total: number;
}

function str(value: unknown, max: number): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  return value.trim().slice(0, max);
}

function need(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

/** Valida itens, cliente e desconto; calcula subtotal e total. */
export function validateOrderInput(body: {
  items?: unknown;
  customerName?: unknown;
  customerPhone?: unknown;
  customerAddress?: unknown;
  customerNote?: unknown;
  discountType?: unknown;
  discountValue?: unknown;
}): ValidOrderInput {
  need(Array.isArray(body.items) && body.items.length > 0, "Pedido sem itens.");
  need((body.items as unknown[]).length <= 50, "Pedido grande demais.");

  const items: ValidOrderItem[] = [];
  for (const [i, raw] of (body.items as unknown[]).entries()) {
    const in_ = raw as Record<string, unknown>;
    need(typeof in_.productId === "string" && in_.productId, `Item ${i + 1}: produto inválido.`);
    const quantity = Number(in_.quantity);
    need(Number.isInteger(quantity) && quantity >= 1 && quantity <= 99, `Item ${i + 1}: quantidade inválida.`);
    const price = Number(in_.price);
    need(Number.isFinite(price) && price >= 0, `Item ${i + 1}: preço inválido.`);
    items.push({
      productId: in_.productId as string,
      quantity,
      price: Math.round(price * 100) / 100,
      variantName: str(in_.variantName, 100),
      customNote: str(in_.customNote, 1000),
    });
  }

  const discountType: DiscountType =
    body.discountType === "fixed" || body.discountType === "percent"
      ? body.discountType
      : "none";
  let discountValue = Number(body.discountValue);
  if (!Number.isFinite(discountValue) || discountValue < 0) discountValue = 0;
  if (discountType === "percent") discountValue = Math.min(100, discountValue);
  discountValue = Math.round(discountValue * 100) / 100;

  const subtotal =
    Math.round(items.reduce((s, it) => s + it.price * it.quantity, 0) * 100) / 100;
  const discount =
    discountType === "fixed"
      ? Math.min(discountValue, subtotal)
      : Math.round(((subtotal * discountValue) / 100) * 100) / 100;
  const total = Math.round((subtotal - discount) * 100) / 100;

  return {
    items,
    customerName: str(body.customerName, 120),
    customerPhone: str(body.customerPhone, 30),
    customerAddress: str(body.customerAddress, 500),
    customerNote: str(body.customerNote, 1000),
    discountType,
    discountValue,
    subtotal,
    total,
  };
}

/** Monta o documento de itens com referências de produto. */
export function toOrderItems(items: ValidOrderItem[]) {
  return items.map((it, i) => ({
    _key: `item${i}`,
    product: { _type: "reference", _ref: it.productId },
    quantity: it.quantity,
    price: it.price,
    ...(it.variantName ? { variantName: it.variantName } : {}),
    ...(it.customNote ? { customNote: it.customNote } : {}),
  }));
}

/** Garante que todos os produtos existem. Retorna 400 se algum faltar. */
export async function assertProductsExist(
  client: { fetch: <T>(q: string, p?: Record<string, unknown>) => Promise<T> },
  productIds: string[]
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ids = [...new Set(productIds)];
  const found = await client.fetch<string[]>(
    `*[_type == "product" && _id in $ids]._id`,
    { ids }
  );
  if (found.length !== ids.length) {
    return { ok: false, error: "Pedido contém produto inexistente." };
  }
  return { ok: true };
}
