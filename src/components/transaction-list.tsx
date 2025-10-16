import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Transaction, Category } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { CategoryIcon } from "./category-icon";

type TransactionListProps = {
  transactions: Transaction[];
  categories: Category[];
  onDelete: (id: string) => void;
};

export function TransactionList({ transactions, categories, onDelete }: TransactionListProps) {
  const categoryMap = new Map(categories.map((c) => [c.value, c]));

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Transacciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24 rounded-lg border border-dashed">
            <p className="text-muted-foreground">No hay transacciones todavía.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Transacciones Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.slice(0, 5).map((transaction) => {
            const category = categoryMap.get(transaction.category);
            
            // 🚀 CORRECCIÓN: Aseguramos que la fecha sea un objeto Date
            const transactionDate = new Date(transaction.date); 
            
            // Verificación adicional de seguridad: si la fecha no es válida, mostramos un mensaje alternativo.
            const dateString = transactionDate.toString() === 'Invalid Date' 
                ? 'Fecha no válida'
                : transactionDate.toLocaleDateString("es-ES", { day: "numeric", month: "long" });

            return (
              <div key={transaction.id} className="flex items-center gap-4 animate-fade-in">
                <div className="p-2 bg-muted rounded-full">
                  {category && <CategoryIcon name={category.icon} className="h-5 w-5" style={{ color: category.color }} />}
                </div>
                <div className="flex-grow">
                  <p className="font-semibold">{category?.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {dateString}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{formatCurrency(transaction.amount)}</p>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(transaction.id)} aria-label={`Eliminar transacción de ${formatCurrency(transaction.amount)}`}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}