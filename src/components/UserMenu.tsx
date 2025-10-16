"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

export default function UserMenu() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!session?.user) {
    return (
      <button
        onClick={() => router.push("/login")}
        className="px-4 py-2 rounded-md bg-primary text-white hover:opacity-90"
      >
        Iniciar sesión
      </button>
    );
  }

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
      >
        <span>{session.user.name || session.user.email}</span>
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-4 py-2 hover:bg-gray-100"
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
