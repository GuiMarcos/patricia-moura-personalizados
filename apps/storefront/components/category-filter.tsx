import Link from "next/link";
import { siteConfig } from "@patricia-moura-personalizados/config";

export function CategoryFilter() {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      <Link
        href="/produtos"
        className="rounded-full bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 transition"
      >
        Todos
      </Link>
      {siteConfig.categories.map((cat) => (
        <Link
          key={cat.value}
          href={`/produtos?categoria=${cat.value}`}
          className="rounded-full border border-primary-200 bg-white px-6 py-2 text-sm font-medium text-cocoa hover:border-primary-500 hover:text-primary-600 transition"
        >
          {cat.label}
        </Link>
      ))}
    </div>
  );
}