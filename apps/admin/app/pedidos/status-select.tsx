"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["pendente", "confirmado", "enviado", "entregue", "cancelado"] as const;

export function StatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [value, setValue] = useState(status);

  const handleChange = async (next: string) => {
    if (next === status) return;
    const ok = window.confirm(
      `Mudar o status do pedido para "${next}"?`
    );
    if (!ok) {
      setValue(status);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Falha ao atualizar.");
      }
      setValue(next);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao atualizar.");
      setValue(status);
    } finally {
      setSaving(false);
    }
  };

  return (
    <select
      value={value}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-full border bg-white px-3 py-1 text-xs font-semibold capitalize disabled:opacity-60"
      aria-label="Alterar status do pedido"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {saving ? "..." : s}
        </option>
      ))}
    </select>
  );
}
