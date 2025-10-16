"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const resp = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (!resp?.ok) {
      setError(resp?.error || "Credenciales inválidas");
      return;
    }

    // Mostrar mensaje simple con alert
    alert("Sesión iniciada");
    router.push("/"); // redirige a home
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-card p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-semibold mb-4">Iniciar sesión</h2>

        {error && <div className="text-destructive mb-3">{error}</div>}

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
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="mt-3 text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <a href="/register" className="text-primary underline">
            Regístrate
          </a>
        </p>
      </form>
    </div>
  );
}
