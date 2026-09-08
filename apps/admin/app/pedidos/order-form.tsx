"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export interface CatalogProduct {
  _id: string;
  name: string;
  price: number;
  variants?: { name: string; price: number }[];
}

export interface OrderFormLine {
  key: string;
  productId: string;
  variantName: string;
  quantity: number;
  price: number;
}

export interface OrderFormInitial {
  _id: string;
  items: { productId: string; variantName?: string; quantity: number; price: number }[];
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerNote?: string;
  discountType?: string;
  discountValue?: number;
}

function newKey(): string {
  return `line-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

export function OrderForm({
  products,
  initial,
}: {
  products: CatalogProduct[];
  initial?: OrderFormInitial | null;
}) {
  const router = useRouter();
  const [lines, setLines] = useState<OrderFormLine[]>(
    initial?.items.map((it) => ({
      key: newKey(),
      productId: it.productId,
      variantName: it.variantName || "",
      quantity: it.quantity,
      price: it.price,
    })) || [{ key: newKey(), productId: "", variantName: "", quantity: 1, price: 0 }]
  );
  const [customerName, setCustomerName] = useState(initial?.customerName || "");
  const [customerPhone, setCustomerPhone] = useState(initial?.customerPhone || "");
  const [customerAddress, setCustomerAddress] = useState(initial?.customerAddress || "");
  const [customerNote, setCustomerNote] = useState(initial?.customerNote || "");
  const [discountType, setDiscountType] = useState<"none" | "fixed" | "percent">(
    initial?.discountType === "fixed" || initial?.discountType === "percent"
      ? initial.discountType
      : "none"
  );
  const [discountValue, setDiscountValue] = useState(
    initial?.discountValue ? String(initial.discountValue) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const byId = useMemo(() => new Map(products.map((p) => [p._id, p])), [products]);

  const patchLine = (key: string, patch: Partial<OrderFormLine>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const handleProductChange = (key: string, productId: string) => {
    const p = byId.get(productId);
    patchLine(key, {
      productId,
      variantName: "",
      price: p ? p.price : 0,
    });
  };

  const handleVariantChange = (key: string, variantName: string) => {
    const line = lines.find((l) => l.key === key);
    const p = line ? byId.get(line.productId) : undefined;
    const v = p?.variants?.find((vv) => vv.name === variantName);
    patchLine(key, { variantName, price: v ? v.price : p?.price || 0 });
  };

  const { subtotal, discount, total } = useMemo(() => {
    const sub = lines.reduce((s, l) => s + l.price * l.quantity, 0);
    const dv = Number(discountValue) || 0;
    const disc =
      discountType === "fixed"
        ? Math.min(dv, sub)
        : discountType === "percent"
          ? (sub * Math.min(100, dv)) / 100
          : 0;
    return {
      subtotal: Math.round(sub * 100) / 100,
      discount: Math.round(disc * 100) / 100,
      total: Math.round((sub - disc) * 100) / 100,
    };
  }, [lines, discountType, discountValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (lines.length === 0 || lines.some((l) => !l.productId)) {
      setError("Adicione ao menos um item com produto selecionado.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        items: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          price: l.price,
          ...(l.variantName ? { variantName: l.variantName } : {}),
        })),
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        customerAddress: customerAddress.trim() || undefined,
        customerNote: customerNote.trim() || undefined,
        discountType,
        discountValue: Number(discountValue) || 0,
      };
      const url = initial ? `/api/orders/${initial._id}` : "/api/orders";
      const res = await fetch(url, {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Falha ao salvar.");
      router.push("/pedidos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao salvar.");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold">Nome do cliente</label>
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} maxLength={120} placeholder="Ex: Maria Silva" className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">Telefone / WhatsApp</label>
          <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} maxLength={30} placeholder="Ex: (41) 99999-0000" className={inputCls} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold">Endereço de entrega</label>
        <textarea value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} maxLength={500} rows={2} placeholder="Rua, número, bairro, cidade…" className={`${inputCls} resize-y`} />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold">Itens do pedido</span>
          <button
            type="button"
            onClick={() => setLines((ls) => [...ls, { key: newKey(), productId: "", variantName: "", quantity: 1, price: 0 }])}
            className="rounded-lg border border-primary-300 px-3 py-1 text-sm font-medium text-primary-700 hover:bg-primary-50"
          >
            + Adicionar item
          </button>
        </div>
        <div className="space-y-3">
          {lines.map((line, i) => {
            const p = byId.get(line.productId);
            return (
              <div key={line.key} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Item {i + 1}</span>
                  {lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setLines((ls) => ls.filter((l) => l.key !== line.key))}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remover
                    </button>
                  )}
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <select value={line.productId} onChange={(e) => handleProductChange(line.key, e.target.value)} className={inputCls}>
                    <option value="">Selecionar produto…</option>
                    {products.map((prod) => (
                      <option key={prod._id} value={prod._id}>
                        {prod.name} — R$ {prod.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                  {p?.variants && p.variants.length > 0 ? (
                    <select value={line.variantName} onChange={(e) => handleVariantChange(line.key, e.target.value)} className={inputCls}>
                      <option value="">Sem variação</option>
                      {p.variants.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.name} — R$ {v.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input value={line.variantName} onChange={(e) => patchLine(line.key, { variantName: e.target.value })} maxLength={100} placeholder="Variação (opcional)" className={inputCls} />
                  )}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Qtd</label>
                    <input type="number" min={1} max={99} value={line.quantity} onChange={(e) => patchLine(line.key, { quantity: Math.min(99, Math.max(1, Math.floor(Number(e.target.value)) || 1)) })} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Preço unit. (R$)</label>
                    <input type="number" min={0} step="0.01" value={line.price} onChange={(e) => patchLine(line.key, { price: Math.max(0, Number(e.target.value) || 0) })} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">Subtotal</label>
                    <p className="px-3 py-2 text-sm font-semibold">R$ {(line.price * line.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold">Desconto</label>
          <div className="flex gap-2">
            {(["none", "fixed", "percent"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setDiscountType(t)}
                className={`flex-1 rounded-lg border px-2 py-2 text-sm font-medium transition ${
                  discountType === t
                    ? "border-primary-600 bg-primary-600 text-white"
                    : "border-gray-300 bg-white hover:border-primary-400"
                }`}
              >
                {t === "none" ? "Sem" : t === "fixed" ? "R$" : "%"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold">
            Valor do desconto {discountType === "percent" ? "(%)" : discountType === "fixed" ? "(R$)" : ""}
          </label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            disabled={discountType === "none"}
            placeholder="0"
            className={`${inputCls} disabled:opacity-50`}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">Observação</label>
        <textarea value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} maxLength={1000} rows={2} placeholder="Observação do pedido…" className={`${inputCls} resize-y`} />
      </div>

      <div className="rounded-lg bg-primary-50 p-4 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Desconto</span><span>− R$ {discount.toFixed(2)}</span></div>
        <div className="mt-1 flex justify-between border-t border-primary-200 pt-2 text-base font-bold text-primary-700">
          <span>Total</span><span>R$ {total.toFixed(2)}</span>
        </div>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-full bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 transition disabled:opacity-60"
      >
        {saving ? "Salvando…" : initial ? "Salvar alterações" : "Criar pedido"}
      </button>
    </form>
  );
}
