// ...existing code...
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      console.log("Status:", res.status, "OK:", res.ok);

      const data = await res.json();
      console.log("Data recibida:", data);

      if (!res.ok) {
        const msg = data?.error || "Error desconocido";
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      toast.success("Cuenta creada");
      router.push("/login");
    } catch (err) {
      console.error("Error en try/catch:", err);
      setError("Server error");
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen flex items-center justify-center px-4">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md bg-card p-6 rounded-2xl shadow"
        >
          <h2 className="text-2xl font-semibold mb-4">Crear cuenta</h2>

          {error && <div className="text-destructive mb-3">{error}</div>}

          <label className="block mb-3">
            <span className="text-sm">Nombre</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 block w-full rounded-md border px-3 py-2 bg-transparent"
            />
          </label>

          <label className="block mb-3">
            <span className="text-sm">Email</span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1 block w-full rounded-md border px-3 py-2 bg-transparent"
            />
          </label>

          <label className="block mb-4">
            <span className="text-sm">Contraseña</span>
            <input
              required
              type="password"
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 block w-full rounded-md border px-3 py-2 bg-transparent"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-primary text-primary-foreground hover:opacity-95"
          >
            {loading ? "Creando..." : "Crear cuenta"}
          </button>

          <p className="mt-3 text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="text-primary underline">
              Inicia sesión
            </a>
          </p>
        </form>
      </div>
    </>
  );
}