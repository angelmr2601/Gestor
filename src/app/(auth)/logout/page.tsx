"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">Cerrar sesión</h2>
        <p className="mb-4">¿Deseas cerrar tu sesión?</p>
        <button
          onClick={handleLogout}
          className="py-2 px-4 rounded-md bg-destructive text-destructive-foreground"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
