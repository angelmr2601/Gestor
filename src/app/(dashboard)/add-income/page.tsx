"use client";

import { z } from "zod";
import { AddTransactionForm, transactionSchema } from "@/components/add-transaction-form";
import { Category } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

const incomeCategories: Category[] = [
  { label: "Salario", value: "salary", color: "green", icon: "💰" },
  { label: "Regalos", value: "gifts", color: "purple", icon: "🎁" },
  { label: "Otros", value: "others", color: "gray", icon: "📝" },
];

export default function AddIncomePage() {
  async function handleIncomeSubmit(data: z.infer<typeof transactionSchema>) {
    try {
      const resp = await fetch("/api/auth/incomes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.notes || "Ingreso",
          amount: data.amount,
          category: data.category,
          budgetId: null, // Puedes asignar un budgetId si quieres
          date: data.date,
        }),
      });

      if (!resp.ok) throw new Error("Error al crear ingreso");

      toast({ title: "Ingreso añadido correctamente" });
    } catch (err) {
      toast({ title: "Error al crear ingreso", variant: "destructive" });
      console.error(err);
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Añadir Ingreso</h2>
      <AddTransactionForm
        categories={incomeCategories}
        onSubmit={handleIncomeSubmit}
        type="income"
      />
    </div>
  );
}
