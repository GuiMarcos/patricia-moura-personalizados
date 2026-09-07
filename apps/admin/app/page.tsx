import Link from "next/link";
import { LogoutButton } from "./logout-button";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <LogoutButton />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            href="https://sanity.io/manage"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold">Sanity Studio</h2>
            <p className="mt-2 text-gray-500">Abrir o Sanity Studio local</p>
          </a>
        </div>
      </div>
    </div>
  );
}
