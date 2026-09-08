import Link from "next/link";
import { fetchOrders } from "@patricia-moura-personalizados/sanity";
import { OrdersClient, type Order } from "./orders-client";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  let orders: Order[] = [];
  try {
    orders = (await fetchOrders()) as Order[];
  } catch (err) {
    console.error("[pedidos] Falha ao buscar pedidos:", err);
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/pedidos/importar"
              className="rounded-lg border border-primary-300 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50 transition"
            >
              Importar mensagem
            </Link>
            <Link
              href="/pedidos/novo"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 transition"
            >
              + Novo pedido
            </Link>
          </div>
        </div>
        <OrdersClient orders={orders} />
      </div>
    </div>
  );
}
