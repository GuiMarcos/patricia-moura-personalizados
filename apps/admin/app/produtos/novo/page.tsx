import Link from "next/link";
import { ProductForm } from "../product-form";

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/produtos" className="text-sm text-primary-600 hover:underline">
          ← Voltar para produtos
        </Link>
        <h1 className="mt-1 text-3xl font-bold">Novo produto</h1>
        <div className="mt-6 rounded-xl border bg-white p-6 shadow-sm">
          <ProductForm />
        </div>
      </div>
    </div>
  );
}
