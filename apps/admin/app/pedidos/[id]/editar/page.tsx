import Link from "next/link";
import { notFound } from "next/navigation";
import { getWriteClient } from "@patricia-moura-personalizados/sanity/server";
import {
  OrderForm,
  type CatalogProduct,
  type OrderFormInitial,
} from "../../order-form";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

async function fetchCatalog(): Promise<CatalogProduct[]> {
  try {
    const client = getWriteClient();
    return await client.fetch(
      `*[_type == "product"] | order(name asc) {
        _id, name, price, variants[] { name, price }
      }`
    );
  } catch {
    return [];
  }
}

async function fetchOrder(id: string): Promise<OrderFormInitial | null> {
  try {
    const client = getWriteClient();
    const order = await client.fetch<{
      _id: string;
      items: {
        product: { _id: string } | null;
        quantity: number;
        price: number;
        variantName?: string;
      }[];
      customerName?: string;
      customerPhone?: string;
      customerAddress?: string;
      customerNote?: string;
      discountType?: string;
      discountValue?: number;
    } | null>(
      `*[_type == "order" && _id == $id][0] {
        _id,
        items[] {
          product-> { _id },
          quantity, price, variantName
        },
        customerName, customerPhone, customerAddress, customerNote,
        discountType, discountValue
      }`,
      { id }
    );
    if (!order) return null;
    return {
      _id: order._id,
      items: order.items
        .filter((it) => it.product?._id)
        .map((it) => ({
          productId: it.product!._id,
          variantName: it.variantName,
          quantity: it.quantity,
          price: it.price,
        })),
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      customerNote: order.customerNote,
      discountType: order.discountType,
      discountValue: order.discountValue,
    };
  } catch {
    return null;
  }
}

export default async function EditOrderPage({ params }: Props) {
  const { id } = await params;
  const [products, order] = await Promise.all([fetchCatalog(), fetchOrder(id)]);
  if (!order) notFound();

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/pedidos" className="text-sm text-primary-600 hover:underline">
          ← Voltar para pedidos
        </Link>
        <h1 className="mt-1 text-3xl font-bold">
          Editar pedido #{id.slice(-8).toUpperCase()}
        </h1>
        <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
          <OrderForm products={products} initial={order} />
        </div>
      </div>
    </div>
  );
}
