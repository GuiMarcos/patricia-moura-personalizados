"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Garante que a lista reflita o estado mais recente do Sanity:
 * - ao voltar para a listagem (novo mount da rota, ex.: após salvar um
 *   pedido/produto) dispara router.refresh()
 * - ao reativar a aba do navegador dispara novamente
 */
export function ListRefresh() {
  const router = useRouter();
  const firstMount = useRef(true);

  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }
    router.refresh();
  }, [router]);

  useEffect(() => {
    const onFocus = () => router.refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [router]);

  return null;
}