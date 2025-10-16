import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { RecurringTransaction, Category } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { CategoryIcon } from "./category-icon";

type RecurringTransactionListProps = {
  transactions: RecurringTransaction[];
  categories: Category[];
  onDelete: (id: string) => void;
  type: 'ingresos' | 'gastos';
};

export function RecurringTransactionList({ transactions, categories, onDelete, type }: RecurringTransactionListProps) {
  const categoryMap = new Map(categories.map((c) => [c.value, c]));

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            {type === 'ingresos' ? 'Ingresos Recurrentes' : 'Gastos Recurrentes'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24 rounded-lg border border-dashed">
            <p className="text-muted-foreground">No hay transacciones recurrentes.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">
          {type === 'ingresos' ? 'Ingresos Recurrentes' : 'Gastos Recurrentes'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const category = categoryMap.get(transaction.category);
            return (
              <div key={transaction.id} className="flex items-center gap-4 animate-fade-in">
                <div className="p-2 bg-muted rounded-full">
                  {category && <CategoryIcon name={category.icon} className="h-5 w-5" style={{ color: category.color }} />}
                </div>
                <div className="flex-grow">
                  <p className="font-semibold">{category?.label}</p>
                  <p className="text-sm text-muted-foreground">
                    Cada día {transaction.recurrenceDay} del mes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{formatCurrency(transaction.amount)}</p>
                  <Button variant="ghost" size="icon" onClick={() => onDelete(transaction.id)} aria-label={`Eliminar transacción recurrente de ${formatCurrency(transaction.amount)}`}>
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