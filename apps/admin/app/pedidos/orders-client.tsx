"use client";

import { useMemo, useState } from "react";
import { StatusSelect } from "./status-select";
import { ExportButton } from "./export-button";

export interface OrderItem {
  product: { name: string; price: number } | null;
  quantity: number;
  price: number;
  variantName?: string;
  customNote?: string;
  artworkUrls?: string[];
}

export interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  status: string;
  customerNote?: string;
  _createdAt: string;
}

const FILTERS = [
  "todos",
  "pendente",
  "confirmado",
  "enviado",
  "entregue",
  "cancelado",
] as const;

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800",
  confirmado: "bg-blue-100 text-blue-800",
  enviado: "bg-purple-100 text-purple-800",
  entregue: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

export function OrdersClient({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("todos");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recentes" | "valor">("recentes");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = orders.filter((order) => {
      if (filter !== "todos" && order.status !== filter) return false;
      if (!q) return true;
      const number = order._id.slice(-8).toUpperCase().toLowerCase();
      if (number.includes(q)) return true;
      return order.items.some((item) =>
        (item.product?.name || "").toLowerCase().includes(q)
      );
    });
    list = [...list].sort((a, b) =>
      sort === "valor"
        ? b.total - a.total
        : new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime()
    );
    return list;
  }, [orders, filter, search, sort]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nº do pedido ou produto…"
          className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "recentes" | "valor")}
          className="rounded-lg border px-3 py-2 text-sm"
          aria-label="Ordenar pedidos"
        >
          <option value="recentes">Mais recentes</option>
          <option value="valor">Maior valor</option>
        </select>
        <ExportButton orders={filtered} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
              filter === f
                ? "bg-primary-600 text-white"
                : "bg-white text-gray-600 border hover:border-primary-400"
            }`}
          >
            {f === "todos" ? `Todos (${orders.length})` : f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500">Nenhum pedido encontrado.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div
              key={order._id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-gray-500">
                    Pedido #{order._id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order._createdAt).toLocaleDateString("pt-BR")} ·{" "}
                    {timeAgo(order._createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      statusColors[order.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status}
                  </span>
                  <StatusSelect id={order._id} status={order.status} />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="text-sm">
                    <div className="flex justify-between">
                      <span>
                        {item.quantity}x {item.product?.name || "Produto removido"}
                        {item.variantName && (
                          <span className="text-primary-700"> ({item.variantName})</span>
                        )}
                      </span>
                      <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    {item.customNote && (
                      <p className="mt-1 text-xs text-gray-500">✏️ {item.customNote}</p>
                    )}
                    {item.artworkUrls && item.artworkUrls.length > 0 && (
                      <p className="mt-1 text-xs">
                        🖼️{" "}
                        {item.artworkUrls.map((url, j) => (
                          <a
                            key={j}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mr-2 text-primary-600 hover:underline"
                          >
                            ref {j + 1}
                          </a>
                        ))}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t pt-4 flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary-600">R$ {order.total.toFixed(2)}</span>
              </div>

              {order.customerNote && (
                <div className="mt-4 rounded-lg bg-gray-50 p-3">
                  <p className="text-sm text-gray-600">
                    <strong>Observação:</strong> {order.customerNote}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
