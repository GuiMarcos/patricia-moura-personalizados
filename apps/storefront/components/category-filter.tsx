"use client";

import { siteConfig } from "@mkt-digital/config";

export function CategoryFilter() {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      <a
        href="/produtos"
        className="rounded-full bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-700 transition"
      >
        Todos
      </a>
      {siteConfig.categories.map((cat) => (
        <a
          key={cat.value}
          href={`/produtos?categoria=${cat.value}`}
          className="rounded-full border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:border-primary-600 hover:text-primary-600 transition"
        >
          {cat.label}
        </a>
      ))}
    </div>
  );
}
