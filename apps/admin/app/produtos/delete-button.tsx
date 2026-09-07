"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Excluir "${name}"? Essa ação não pode ser desfeita.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Falha ao excluir.");
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Falha ao excluir.");
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      title={`Excluir ${name}`}
      className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
