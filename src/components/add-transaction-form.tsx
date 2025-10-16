"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "./ui/card";
import { Switch } from "./ui/switch";

export const transactionSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "Debe ser un número" })
    .positive("La cantidad debe ser positiva."),
  category: z.string().min(1, "Por favor selecciona una categoría."),
  date: z.date({
    required_error: "Por favor selecciona una fecha.",
  }),
  notes: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurrenceDay: z.coerce.number().optional(),
}).refine(data => {
  if (data.isRecurring) {
    return data.recurrenceDay !== undefined && data.recurrenceDay >= 1 && data.recurrenceDay <= 31;
  }
  return true;
}, {
  message: "El día de recurrencia debe ser entre 1 y 31.",
  path: ["recurrenceDay"],
});

type AddTransactionFormProps = {
  categories: Category[];
  onSubmit: (data: z.infer<typeof transactionSchema>) => void;
  type: "income" | "expense";
};

export function AddTransactionForm({ categories, onSubmit, type }: AddTransactionFormProps) {
  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: undefined,
      category: "",
      date: new Date(),
      notes: "",
      isRecurring: false,
      recurrenceDay: undefined,
    },
  });

  const isRecurring = form.watch("isRecurring");

  function handleSubmit(values: z.infer<typeof transactionSchema>) {
    onSubmit(values);
    form.reset({ 
      ...values, 
      amount: undefined, 
      category: '', 
      notes: '',
      isRecurring: false,
      recurrenceDay: undefined,
      date: new Date(),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{type === 'income' ? 'Añadir Ingreso' : 'Añadir Gasto'}</CardTitle>
        <CardDescription>Registra una nueva transacción.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad (€)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Transacción Recurrente</FormLabel>
                    <FormDescription>
                      Se añadirá automáticamente cada mes.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {isRecurring ? (
               <FormField
                control={form.control}
                name="recurrenceDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Día del Mes</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="31" placeholder="Ej: 15" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Elige una fecha</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("2000-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
             <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Añade una nota..." {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              {type === "income" ? "Añadir Ingreso" : "Añadir Gasto"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
