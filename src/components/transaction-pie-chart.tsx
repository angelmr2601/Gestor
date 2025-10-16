"use client";

import * as React from "react";
import { Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Transaction, Category } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type TransactionPieChartProps = {
  transactions: Transaction[];
  categories: Category[];
};

export function TransactionPieChart({
  transactions,
  categories,
}: TransactionPieChartProps) {
  const chartData = React.useMemo(() => {
    return categories
      .map((category) => {
        const total = transactions
          .filter((t) => t.category === category.value)
          .reduce((sum, t) => sum + t.amount, 0);
        return { name: category.label, total, fill: category.color };
      })
      .filter((item) => item.total > 0);
  }, [transactions, categories]);

  const chartConfig = React.useMemo(() => {
    return Object.fromEntries(
      categories.map((cat) => [cat.label, { label: cat.label, color: cat.color }])
    ) as ChartConfig;
  }, [categories]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-60 w-full items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">No hay datos para mostrar el gráfico</p>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <PieChart accessibilityLayer>
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(value as number)}
              nameKey="name"
              hideLabel
            />
          }
        />
        <Pie
          data={chartData}
          dataKey="total"
          nameKey="name"
          innerRadius={50}
          strokeWidth={2}
          labelLine={false}
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
        />
        <ChartLegend
          content={<ChartLegendContent nameKey="name" />}
          className="-translate-y-2 flex-wrap"
        />
      </PieChart>
    </ChartContainer>
  );
}
