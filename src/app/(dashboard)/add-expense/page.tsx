"use client";

import { z } from "zod";
import { AddTransactionForm, transactionSchema } from "@/components/add-transaction-form";
import { Category } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

const expenseCategories: Category[] = [
  { label: "Comida", value: "food", color: "red", icon: "🍔" },
  { label: "Transporte", value: "transport", color: "blue", icon: "🚌" },
  { label: "Entretenimiento", value: "entertainment", color: "green", icon: "🎬" },
  { label: "Otros", value: "others", color: "gray", icon: "📝" },
];

export default function AddExpensePage() {
  async function handleExpenseSubmit(data: z.infer<typeof transactionSchema>) {
    try {
      const resp = await fetch("/api/auth/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.notes || "Gasto",
          amount: data.amount,
          category: data.category,
          budgetId: null, // Puedes asignar un budgetId si quieres
          date: data.date,
        }),
      });

      if (!resp.ok) throw new Error("Error al crear gasto");

      toast({ title: "Gasto añadido correctamente" });
    } catch (err) {
      toast({ title: "Error al crear gasto", variant: "destructive" });
      console.error(err);
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Añadir Gasto</h2>
      <AddTransactionForm
        categories={expenseCategories}
        onSubmit={handleExpenseSubmit}
        type="expense"
      />
    </div>
  );
}
