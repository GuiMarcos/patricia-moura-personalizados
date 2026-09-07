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
        <h1 className="text-3xl font-bold mb-8">Pedidos</h1>
        <OrdersClient orders={orders} />
      </div>
    </div>
  );
}
