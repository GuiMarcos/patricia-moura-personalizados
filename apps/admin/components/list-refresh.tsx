"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Garante que a lista reflita o estado mais recente do Sanity:
 * - a cada mount da rota (ex.: ao voltar para a listagem após salvar um
 *   pedido/produto) dispara router.refresh()
 * - ao reativar a aba do navegador dispara novamente
 */
export function ListRefresh() {
  const router = useRouter();

  useEffect(() => {
    router.refresh();
  }, [router]);

  useEffect(() => {
    const onFocus = () => router.refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [router]);

  return null;
}