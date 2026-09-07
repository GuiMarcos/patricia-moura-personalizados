"use client";

import { useState } from "react";
import type { Order } from "./orders-client";

function csvCell(value: string | number): string {
  const s = String(value);
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR");
}

function formatBRL(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

/** Exporta os pedidos (respeitando os filtros ativos) para CSV compatível com Excel PT-BR. */
export function ExportButton({ orders }: { orders: Order[] }) {
  const [done, setDone] = useState(false);

  const handleExport = () => {
    const header = [
      "Pedido",
      "Data",
      "Produto",
      "Variante",
      "Qtd",
      "Preço unitário (R$)",
      "Subtotal (R$)",
      "Status",
      "Total do pedido (R$)",
    ];
    const rows: string[] = [header.map(csvCell).join(";")];
    for (const order of orders) {
      const number = order._id.slice(-8).toUpperCase();
      for (const item of order.items) {
        rows.push(
          [
            number,
            formatDate(order._createdAt),
            item.product?.name || "Produto removido",
            item.variantName || "",
            item.quantity,
            formatBRL(item.price),
            formatBRL(item.price * item.quantity),
            order.status,
            formatBRL(order.total),
          ]
            .map(csvCell)
            .join(";")
        );
      }
    }
    const blob = new Blob(["\uFEFF" + rows.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };

  return (
    <button
      onClick={handleExport}
      disabled={orders.length === 0}
      className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition disabled:opacity-50"
    >
      {done ? "Exportado!" : `Exportar CSV (${orders.length})`}
    </button>
  );
}
