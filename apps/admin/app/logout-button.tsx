"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
    >
      <LogOut className="h-4 w-4" />
      Sair
    </button>
  );
}
