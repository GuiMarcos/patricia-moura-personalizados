"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

const NEXT_STATUS: Record<string, { next: string; label: string }> = {
  pendente: { next: "confirmado", label: "Confirmar" },
  confirmado: { next: "enviado", label: "Marcar enviado" },
  enviado: { next: "entregue", label: "Marcar entregue" },
};

export function AdvanceStatusButton({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const step = NEXT_STATUS[status];
  if (!step) return null;

  const handleClick = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: step.next }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Falha ao atualizar.");
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao atualizar.");
      setSaving(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={saving}
      className="flex items-center gap-1 rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white hover:bg-primary-700 transition disabled:opacity-60"
    >
      {saving ? "..." : step.label}
      <ArrowRight className="h-3 w-3" />
    </button>
  );
}
