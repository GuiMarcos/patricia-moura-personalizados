import { fetchOrders } from "@patricia-moura-personalizados/sanity";
import { AdvanceStatusButton } from "./advance-button";

interface OrderItem {
  product: { name: string; price: number } | null;
  quantity: number;
  price: number;
  variantName?: string;
  customNote?: string;
  artworkUrls?: string[];
}

interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  status: string;
  customerNote?: string;
  _createdAt: string;
}

export default async function OrdersPage() {
  const orders = (await fetchOrders()) as Order[];

  const statusColors: Record<string, string> = {
    pendente: "bg-yellow-100 text-yellow-800",
    confirmado: "bg-blue-100 text-blue-800",
    enviado: "bg-purple-100 text-purple-800",
    entregue: "bg-green-100 text-green-800",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Pedidos</h1>

        {orders.length === 0 ? (
          <p className="text-gray-500">Nenhum pedido encontrado.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Pedido #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(order._createdAt).toLocaleDateString("pt-BR")}
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
                    <AdvanceStatusButton id={order._id} status={order.status} />
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
                        <p className="mt-1 text-xs text-gray-500">
                          ✏️ {item.customNote}
                        </p>
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
    </div>
  );
}
