import Link from "next/link";
import { LogoutButton } from "./logout-button";
import { ListRefresh } from "@/components/list-refresh";
import { getOrderStats } from "./lib/stats";
import { fetchOrders } from "@patricia-moura-personalizados/sanity";

interface OrderItem {
  product: { name: string; price: number } | null;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  status: string;
  _createdAt: string;
}

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800",
  confirmado: "bg-blue-100 text-blue-800",
  enviado: "bg-purple-100 text-purple-800",
  entregue: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800",
};

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [stats, allOrders] = await Promise.all([
    getOrderStats(),
    (async () => {
      try {
        return ((await fetchOrders()) as Order[]).slice(0, 10);
      } catch {
        return [] as Order[];
      }
    })(),
  ]);

  const cards = [
    { label: "Total de pedidos", value: String(stats.total) },
    { label: "Pendentes", value: String(stats.pending) },
    { label: "Receita total", value: formatBRL(stats.revenue) },
    { label: "Receita do mês", value: formatBRL(stats.monthRevenue) },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <ListRefresh />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <LogoutButton />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="mt-1 text-3xl font-bold text-primary-700">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Últimos pedidos</h2>
            <Link href="/pedidos" className="text-sm text-primary-600 hover:underline">
              Ver todos →
            </Link>
          </div>
          {allOrders.length === 0 ? (
            <p className="text-gray-500">Nenhum pedido encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="py-2 pr-4 font-medium">Pedido</th>
                    <th className="py-2 pr-4 font-medium">Data</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {allOrders.map((order) => (
                    <tr key={order._id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-2 pr-4 text-gray-600">
                        {new Date(order._createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                            statusColors[order.status] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-2 text-right font-semibold">
                        {formatBRL(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/pedidos"
            className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold">Pedidos</h2>
            <p className="mt-2 text-gray-500">Ver e gerenciar pedidos recebidos</p>
          </Link>

          <Link
            href="/produtos"
            className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold">Produtos</h2>
            <p className="mt-2 text-gray-500">Cadastrar, editar e excluir produtos</p>
          </Link>

          <a
            href={process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3333"}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold">Sanity Studio</h2>
            <p className="mt-2 text-gray-500">Abrir o Studio de conteúdo</p>
          </a>
        </div>
      </div>
    </div>
  );
}
