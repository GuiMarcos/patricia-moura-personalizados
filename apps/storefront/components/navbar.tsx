"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Instagram, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "./cart-provider";
import { siteConfig } from "@patricia-moura-personalizados/config";
import { CartSidebar } from "./cart-sidebar";

export function Navbar() {
  const { itemCount, setIsOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-primary-100 bg-cream/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" aria-label={siteConfig.name}>
              <Image
                src="/logo.jpg"
                alt={siteConfig.name}
                width={640}
                height={418}
                className="h-10 w-auto"
                priority
              />
            </Link>

            <div className="hidden md:flex md:items-center md:gap-8">
              <Link href="/" className="text-cocoa hover:text-primary-600 transition">
                Início
              </Link>
              <Link href="/produtos" className="text-cocoa hover:text-primary-600 transition">
                Produtos
              </Link>
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cocoa hover:text-primary-600 transition"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <button
                onClick={() => setIsOpen(true)}
                className="relative text-cocoa hover:text-primary-600 transition"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-4 md:hidden">
              <button
                onClick={() => setIsOpen(true)}
                className="relative text-cocoa"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
                    {itemCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-cocoa"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-primary-100 md:hidden">
            <div className="flex flex-col gap-4 px-4 py-4">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-cocoa hover:text-primary-600"
              >
                Início
              </Link>
              <Link
                href="/produtos"
                onClick={() => setMobileMenuOpen(false)}
                className="text-cocoa hover:text-primary-600"
              >
                Produtos
              </Link>
              <a
                href={siteConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cocoa hover:text-primary-600"
              >
                Instagram
              </a>
            </div>
          </div>
        )}
      </nav>

      <CartSidebar />
    </>
  );
}
