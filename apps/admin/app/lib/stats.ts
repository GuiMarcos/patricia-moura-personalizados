import { getWriteClient } from "@patricia-moura-personalizados/sanity/server";

export interface OrderStats {
  total: number;
  byStatus: Record<string, number>;
  pending: number;
  revenue: number;
  monthRevenue: number;
}

const EMPTY: OrderStats = {
  total: 0,
  byStatus: {},
  pending: 0,
  revenue: 0,
  monthRevenue: 0,
};

/** Agregados de pedidos para o dashboard. Retorna zeros se o Sanity não estiver configurado. */
export async function getOrderStats(): Promise<OrderStats> {
  try {
    const client = getWriteClient();
    const [statuses, revenue, monthRevenue] = await Promise.all([
      client.fetch<{ status: string }[]>(`*[_type == "order"] { status }`),
      client.fetch<number | null>(
        `math::sum(*[_type == "order" && status != "cancelado"].total)`
      ),
      client.fetch<number | null>(
        `math::sum(*[_type == "order" && status != "cancelado" && _createdAt >= $start].total)`,
        {
          start: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
          ).toISOString(),
        }
      ),
    ]);

    const byStatus: Record<string, number> = {};
    for (const r of statuses) byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    const total = statuses.length;

    return {
      total,
      byStatus,
      pending: byStatus["pendente"] || 0,
      revenue: revenue || 0,
      monthRevenue: monthRevenue || 0,
    };
  } catch {
    return EMPTY;
  }
}
