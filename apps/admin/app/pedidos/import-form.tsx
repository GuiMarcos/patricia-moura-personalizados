"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  matchCatalog,
  parseWhatsAppOrder,
  type MatchableProduct,
  type ParsedOrder,
} from "@patricia-moura-personalizados/parser";

export interface ImportProduct {
  _id: string;
  name: string;
  price: number;
  variants?: { name: string; price: number }[];
}

interface ImportLine {
  key: string;
  nameRaw: string;
  productId: string;
  matchedName: string | null;
  confidence: number;
  variantName: string;
  quantity: number;
  unitPrice: number;
  customNote: string;
}

function newKey(): string {
  return `line-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

export function ImportForm({ products }: { products: ImportProduct[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedOrder | null>(null);
  const [lines, setLines] = useState<ImportLine[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const byId = useMemo(() => new Map(products.map((p) => [p._id, p])), [products]);

  const handleAnalyze = () => {
    setError(null);
    if (!text.trim()) {
      setError("Cole a mensagem do WhatsApp para analisar.");
      return;
    }
    const order = parseWhatsAppOrder(text);
    if (order.lines.length === 0) {
      setError("Não consegui identificar itens nessa mensagem. Use o formato '2x Produto - R$ 00,00'.");
      return;
    }
    const nextLines: ImportLine[] = order.lines.map((l) => {
      const match = matchCatalog(products as MatchableProduct[], l.nameRaw);
      const unitPrice =
        l.unitPrice !== null && l.unitPrice > 0
          ? l.unitPrice
          : match.price ?? 0;
      return {
        key: newKey(),
        nameRaw: l.nameRaw,
        productId: match.productId ?? "",
        matchedName: match.matchedName,
        confidence: match.confidence,
        variantName: match.variantName ?? "",
        quantity: l.quantity,
        unitPrice,
        customNote: l.customNote ?? "",
      };
    });
    setLines(nextLines);
    setParsed(order);
    setCustomerPhone(order.customerPhone ?? "");
    setCustomerAddress(order.customerAddress ?? "");
    setCustomerNote(order.notes.join("\n"));
  };

  const patchLine = (key: string, patch: Partial<ImportLine>) =>
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const handleProductChange = (key: string, productId: string) => {
    const p = byId.get(productId);
    patchLine(key, {
      productId,
      variantName: "",
      unitPrice: p ? p.price : 0,
      matchedName: p?.name ?? null,
      confidence: 0,
    });
  };

  const handleVariantChange = (key: string, variantName: string) => {
    const line = lines.find((l) => l.key === key);
    const p = line ? byId.get(line.productId) : undefined;
    const v = p?.variants?.find((vv) => vv.name === variantName);
    patchLine(key, { variantName, unitPrice: v ? v.price : p?.price ?? 0 });
  };

  const subtotal = useMemo(
    () =>
      Math.round(
        lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0) * 100
      ) / 100,
    [lines]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (lines.length === 0 || lines.some((l) => !l.productId)) {
      setError("Confira os itens: ao menos um produto selecionado em cada linha.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        items: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
          price: l.unitPrice,
          ...(l.variantName ? { variantName: l.variantName } : {}),
          ...(l.customNote ? { customNote: l.customNote } : {}),
        })),
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        customerAddress: customerAddress.trim() || undefined,
        customerNote: customerNote.trim() || undefined,
        discountType: "none",
        discountValue: 0,
      };
      const res = await fetch("/api/orders", {
        method: "POST",
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

  const badge = (line: ImportLine) => {
    if (!line.productId) {
      return (
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
          Sem correspondência — selecione
        </span>
      );
    }
    const pct = Math.round(line.confidence * 100);
    const color = pct >= 85 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";
    return (
      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
        {pct >= 85 ? "Correspondência" : "Aproximada"} · {pct}%
      </span>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-semibold">Mensagem do WhatsApp</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder={"Ex:\n2x Caneca Básica Personalizável - R$ 120.00\n   ✏️ Personalização: Nome \"Ana\"\n1x Chaveiro Redondo Personalizado - R$ 25.00\n💰 Total: R$ 145.00"}
          className={`${inputCls} resize-y font-mono text-xs`}
        />
        <button
          type="button"
          onClick={handleAnalyze}
          className="mt-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition"
        >
          {parsed ? "Analisar novamente" : "Analisar mensagem"}
        </button>
      </div>

      {parsed && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">Nome do cliente</label>
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} maxLength={120} placeholder="Ex: Maria Silva" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Telefone / WhatsApp</label>
              <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} maxLength={30} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold">Endereço de entrega</label>
            <textarea value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} rows={2} className={`${inputCls} resize-y`} />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold">Itens identificados ({lines.length})</span>
            </div>
            <div className="space-y-3">
              {lines.map((line, i) => {
                const p = byId.get(line.productId);
                return (
                  <div key={line.key} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-gray-700">
                        {i + 1}. {line.nameRaw}
                      </span>
                      {badge(line)}
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
                        <input type="number" min={0} step="0.01" value={line.unitPrice} onChange={(e) => patchLine(line.key, { unitPrice: Math.max(0, Number(e.target.value) || 0) })} className={inputCls} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-500">Subtotal</label>
                        <p className="px-3 py-2 text-sm font-semibold">R$ {(line.unitPrice * line.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                    {line.customNote && (
                      <input
                        value={line.customNote}
                        onChange={(e) => patchLine(line.key, { customNote: e.target.value })}
                        maxLength={1000}
                        placeholder="Personalização / observação do item"
                        className={`${inputCls} mt-2`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">Observação do pedido</label>
            <textarea value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} maxLength={1000} rows={2} className={`${inputCls} resize-y`} />
          </div>

          <div className="rounded-lg bg-primary-50 p-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-primary-200 pt-2 text-base font-bold text-primary-700">
              <span>Total</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 transition disabled:opacity-60"
          >
            {saving ? "Criando…" : "Criar pedido"}
          </button>
        </>
      )}
    </form>
  );
}