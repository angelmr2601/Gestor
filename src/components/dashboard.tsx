"use client";

import { useState, useMemo, useEffect } from "react";
// Importar useSession (Asumiendo NextAuth.js o similar)
import { useSession } from "next-auth/react";
import type { Transaction, RecurringTransaction, Category } from "@/lib/types";
import { incomeCategories, expenseCategories as initialExpenseCategories, availableIcons } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { AddTransactionForm } from "./add-transaction-form";
import { TransactionPieChart } from "./transaction-pie-chart";
import { TransactionList } from "./transaction-list";
import { useToast } from "@/hooks/use-toast";
import type { z } from "zod";
import type { transactionSchema } from "./add-transaction-form";
import { RecurringTransactionList } from "./recurring-transaction-list";
import { CategoryIcon } from "./category-icon";
import { Button } from "./ui/button";
import { Trash2, Circle, Loader2 } from "lucide-react"; // Se añade Loader2
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";

export function Dashboard() {
  const [incomes, setIncomes] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [recurringIncomes, setRecurringIncomes] = useState<RecurringTransaction[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringTransaction[]>([]);
  const [budgets, setBudgets] = useState<{ [key: string]: number }>({});
  const [expenseCategories, setExpenseCategories] = useState<Category[]>(initialExpenseCategories);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState<string>("Circle");
  const { toast } = useToast();

  // 🔑 Obtener el estado de la sesión
  const { status } = useSession();

  // Load incomes and expenses from DB on initial render
  useEffect(() => {
    // 🛑 Modificación clave: Detener la ejecución si no está autenticado o está cargando.
    if (status !== 'authenticated') {
      // En una aplicación real, probablemente redirigirías aquí.
      console.log(`Estado de autenticación: ${status}. No se cargan datos financieros.`);
      return;
    }

    const fetchData = async () => {
      try {
        const incomesRes = await fetch('/api/incomes', {
          cache: 'no-store',
          credentials: 'include', // <- esto envía la cookie de sesión
        });

        const expensesRes = await fetch('/api/expenses', {
          cache: 'no-store',
          credentials: 'include',
        });

        console.log("Incomes:", incomesRes.status, incomesRes.statusText);
        console.log("Expenses:", expensesRes.status, expensesRes.statusText);

        // La verificación de .ok sigue siendo necesaria para manejar otros errores (500, etc.)
        if (!incomesRes.ok || !expensesRes.ok) throw new Error("Error al cargar datos");

        const incomesData: Transaction[] = await incomesRes.json();
        const expensesData: Transaction[] = await expensesRes.json();

        setIncomes(incomesData.map(i => ({ ...i, date: new Date(i.date) })));
        setExpenses(expensesData.map(e => ({ ...e, date: new Date(e.date) })));
      } catch (err) {
        console.error(err);
        // Mostrar error solo si el usuario estaba autenticado y falló la carga
        if (status === 'authenticated') {
          toast({ variant: "destructive", title: "Error de carga", description: "No se pudieron obtener los datos del servidor." });
        }
      }
    };

    fetchData();
  }, [status, toast]); // <-- Asegurar que se ejecuta cuando 'status' cambia a 'authenticated'

  // Handle recurring transactions (este useEffect NO necesita la verificación de status,
  // ya que solo usa datos locales)
  useEffect(() => {
    const today = new Date().getDate();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const newIncomes: Transaction[] = [];
    recurringIncomes.forEach(rec => {
      if (rec.recurrenceDay === today) {
        newIncomes.push({
          id: `inc-${Date.now()}-${rec.id}`,
          amount: rec.amount,
          category: rec.category,
          date: new Date(currentYear, currentMonth, today),
          notes: rec.notes ? `${rec.notes} (Recurrente)` : "(Recurrente)",
        });
      }
    });

    const newExpenses: Transaction[] = [];
    recurringExpenses.forEach(rec => {
      if (rec.recurrenceDay === today) {
        newExpenses.push({
          id: `exp-${Date.now()}-${rec.id}`,
          amount: rec.amount,
          category: rec.category,
          date: new Date(currentYear, currentMonth, today),
          notes: rec.notes ? `${rec.notes} (Recurrente)` : "(Recurrente)",
        });
      }
    });

    if (newIncomes.length > 0) {
      setIncomes(prev => [...prev, ...newIncomes]);
      toast({ title: `${newIncomes.length} ingreso(s) recurrente(s) añadido(s).` });
    }

    if (newExpenses.length > 0) {
      setExpenses(prev => [...prev, ...newExpenses]);
      toast({ title: `${newExpenses.length} gasto(s) recurrente(s) añadido(s).` });
    }
  }, [recurringIncomes, recurringExpenses, toast]);

  const handleAddIncome = async (data: z.infer<typeof transactionSchema>) => {
    try {
      if (data.isRecurring && data.recurrenceDay) {
        const newRecurringIncome: RecurringTransaction = {
          id: `rec-inc-${Date.now()}`,
          amount: data.amount,
          category: data.category,
          recurrenceDay: data.recurrenceDay,
          notes: data.notes,
        };
        setRecurringIncomes(prev => [newRecurringIncome, ...prev]);
        toast({ title: "Ingreso recurrente añadido", description: `${formatCurrency(data.amount)} cada día ${data.recurrenceDay}.` });
      } else {
        const res = await fetch("/api/incomes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: data.notes || "Ingreso",
            amount: data.amount,
            category: data.category,
          }),
        });

        if (!res.ok) throw new Error("Error al añadir ingreso");

        const newIncomeFromApi: Transaction = await res.json();

        // 🔑 CORRECCIÓN CLAVE: Convertir la fecha de string a Date
        const newIncome: Transaction = {
          ...newIncomeFromApi,
          date: new Date(newIncomeFromApi.date),
        };

        // Ahora newIncome.date es un objeto Date válido y .getTime() funcionará.
        setIncomes(prev => [newIncome, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime()));
        toast({ title: "Ingreso añadido", description: `${formatCurrency(data.amount)} en ${data.category}.` });
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error al añadir ingreso" });
    }
  };

  const handleAddExpense = async (data: z.infer<typeof transactionSchema>) => {
    try {
      if (data.isRecurring && data.recurrenceDay) {
        const newRecurringExpense: RecurringTransaction = {
          id: `rec-exp-${Date.now()}`,
          amount: data.amount,
          category: data.category,
          recurrenceDay: data.recurrenceDay,
          notes: data.notes,
        };
        setRecurringExpenses(prev => [newRecurringExpense, ...prev]);
        toast({ title: "Gasto recurrente añadido", description: `${formatCurrency(data.amount)} cada día ${data.recurrenceDay}.` });
      } else {
        const res = await fetch("/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: data.notes || "Gasto",
            amount: data.amount,
            category: data.category,
          }),
        });

        if (!res.ok) throw new Error("Error al añadir gasto");

        const newExpenseFromApi: Transaction = await res.json();

        // 🔑 CORRECCIÓN CLAVE: Convertir la fecha de string a Date
        const newExpense: Transaction = {
          ...newExpenseFromApi,
          date: new Date(newExpenseFromApi.date),
        };

        // Ahora newExpense.date es un objeto Date válido y .getTime() funcionará.
        setExpenses(prev => [newExpense, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime()));
        toast({ title: "Gasto añadido", description: `${formatCurrency(data.amount)} en ${data.category}.` });
      }
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error al añadir gasto" });
    }
  };

  const handleDeleteIncome = async (id: string) => {
    try {
      const res = await fetch("/api/incomes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Error al eliminar ingreso");
      setIncomes(prev => prev.filter(t => t.id !== id));
      toast({ title: "Ingreso eliminado" });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error al eliminar ingreso" });
    }
  };

  const handleDeleteRecurringIncome = (id: string) => {
    setRecurringIncomes(prev => prev.filter(t => t.id !== id));
    toast({ title: "Ingreso recurrente eliminado" });
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const res = await fetch("/api/expenses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Error al eliminar gasto");
      setExpenses(prev => prev.filter(t => t.id !== id));
      toast({ title: "Gasto eliminado" });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error al eliminar gasto" });
    }
  };

  const handleDeleteRecurringExpense = (id: string) => {
    setRecurringExpenses(prev => prev.filter(t => t.id !== id));
    toast({ title: "Gasto recurrente eliminado" });
  };

  const handleBudgetChange = (category: string, amount: number) => {
    setBudgets(prev => ({ ...prev, [category]: amount }));
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() === "") {
      toast({ variant: "destructive", title: "El nombre de la categoría no puede estar vacío." });
      return;
    }
    const categoryValue = newCategoryName.toLowerCase().replace(/\s/g, "_");
    if (expenseCategories.some(c => c.value === categoryValue)) {
      toast({ variant: "destructive", title: "Esa categoría ya existe." });
      return;
    }

    const newCategory: Category = {
      value: categoryValue,
      label: newCategoryName,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      icon: newCategoryIcon
    };

    setExpenseCategories(prev => [...prev, newCategory]);
    setBudgets(prev => ({ ...prev, [newCategory.value]: 0 }));
    setNewCategoryName("");
    setNewCategoryIcon("Circle");
    toast({ title: "Categoría añadida" });
  };

  const handleDeleteCategory = (categoryValue: string) => {
    setExpenseCategories(prev => prev.filter(c => c.value !== categoryValue));
    setBudgets(prev => {
      const newBudgets = { ...prev };
      delete newBudgets[categoryValue];
      return newBudgets;
    });
    toast({ title: "Categoría eliminada" });
  };

  const { totalIncomes, totalExpenses, balance, expensesByCategory, overallBudgetUsage } = useMemo(() => {
    const totalIncomes = incomes.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncomes - totalExpenses;
    const overallBudgetUsage = totalIncomes > 0 ? (totalExpenses / totalIncomes) * 100 : 0;

    const expensesByCategory = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) acc[expense.category] = 0;
      acc[expense.category] += expense.amount;
      return acc;
    }, {} as { [key: string]: number });

    return { totalIncomes, totalExpenses, balance, expensesByCategory, overallBudgetUsage };
  }, [incomes, expenses]);

  // 🛑 Lógica condicional de renderizado:
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p>Cargando sesión...</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Card className="max-w-md mx-auto my-20">
        <CardHeader>
          <CardTitle className="text-destructive">Acceso Restringido</CardTitle>
          <CardDescription>
            Debes iniciar sesión para acceder a tu panel de control financiero.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a href="/login"> {/* Ajusta esta ruta a tu página de inicio de sesión real */}
            <Button className="w-full">
              Ir a Iniciar Sesión
            </Button>
          </a>
        </CardContent>
      </Card>
    );
  }

  // Solo se renderiza el dashboard completo si status === 'authenticated'
  return (
    <Tabs defaultValue="resumen" className="w-full animate-fade-in">
      {/* --- TAB LIST --- */}
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="resumen">Resumen</TabsTrigger>
        <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
        <TabsTrigger value="gastos">Gastos</TabsTrigger>
      </TabsList>

      {/* --- RESUMEN --- */}
      <TabsContent value="resumen" className="mt-4 grid gap-6 md:grid-cols-2">
        {/* Resumen Financiero */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Resumen Financiero</CardTitle>
            <CardDescription>Tu vista general financiera del mes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos Totales</p>
                <p className="text-2xl font-bold text-[hsl(var(--chart-2))]">{formatCurrency(totalIncomes)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gastos Totales</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-[hsl(var(--chart-2))]' : 'text-destructive'}`}>{formatCurrency(balance)}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="font-semibold">Presupuesto Global (Ingresos)</Label>
                <div className="text-lg font-bold">{formatCurrency(totalIncomes)}</div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gastado del presupuesto global</span>
                <span className="font-medium">{overallBudgetUsage.toFixed(0)}%</span>
              </div>
              <Progress value={overallBudgetUsage} aria-label={`${overallBudgetUsage.toFixed(0)}% del presupuesto gastado`} />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatCurrency(totalExpenses)} gastados</span>
                <span>Restante: {formatCurrency(balance)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Presupuestos por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Presupuestos por Categoría</CardTitle>
            <CardDescription>Define y sigue tus límites de gasto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {expenseCategories.map(category => {
              const spent = expensesByCategory[category.value] || 0;
              const budget = budgets[category.value] || 0;
              const usage = budget > 0 ? (spent / budget) * 100 : 0;
              const remaining = budget - spent;

              return (
                <div key={category.value} className="space-y-2 group">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-muted rounded-full">
                      <CategoryIcon name={category.icon} className="h-4 w-4" style={{ color: category.color }} />
                    </div>
                    <Label htmlFor={`budget-${category.value}`} className="flex-1 font-semibold">{category.label}</Label>
                    <div className="flex items-baseline gap-1">
                      <Input
                        id={`budget-${category.value}`}
                        type="number"
                        value={budget}
                        onChange={(e) => handleBudgetChange(category.value, Number(e.target.value) || 0)}
                        className="w-24 h-8 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        aria-label={`Presupuesto para ${category.label}`}
                      />
                      <span className="text-sm font-medium">€</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteCategory(category.value)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <Progress value={usage} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(spent)} de {formatCurrency(budget)}</span>
                    <span className={remaining < 0 ? 'text-destructive' : ''}>{formatCurrency(remaining)} restante</span>
                  </div>
                </div>
              );
            })}
            <Separator />
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9 flex-shrink-0">
                    <CategoryIcon name={newCategoryIcon} className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <div className="grid grid-cols-5 gap-2">
                    {availableIcons.map((icon) => (
                      <Button
                        key={icon}
                        variant={newCategoryIcon === icon ? "default" : "ghost"}
                        size="icon"
                        onClick={() => setNewCategoryIcon(icon)}
                      >
                        <CategoryIcon name={icon} className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Input
                placeholder="Nueva categoría"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="h-9"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <Button onClick={handleAddCategory} className="h-9">Añadir</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* INGRESOS */}
      <TabsContent value="ingresos" className="mt-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <AddTransactionForm categories={incomeCategories} onSubmit={handleAddIncome} type="income" />
          </div>
          <div className="lg:col-span-3 grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Distribución de Ingresos</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionPieChart transactions={incomes} categories={incomeCategories} />
              </CardContent>
            </Card>
            <TransactionList transactions={incomes} categories={incomeCategories} onDelete={handleDeleteIncome} />
            <RecurringTransactionList transactions={recurringIncomes} categories={incomeCategories} onDelete={handleDeleteRecurringIncome} type="ingresos" />
          </div>
        </div>
      </TabsContent>

      {/* GASTOS */}
      <TabsContent value="gastos" className="mt-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <AddTransactionForm categories={expenseCategories} onSubmit={handleAddExpense} type="expense" />
          </div>
          <div className="lg:col-span-3 grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Distribución de Gastos</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionPieChart transactions={expenses} categories={expenseCategories} />
              </CardContent>
            </Card>
            <TransactionList transactions={expenses} categories={expenseCategories} onDelete={handleDeleteExpense} />
            <RecurringTransactionList transactions={recurringExpenses} categories={expenseCategories} onDelete={handleDeleteRecurringExpense} type="gastos" />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}