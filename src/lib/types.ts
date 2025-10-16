export type Transaction = {
  id: string;
  amount: number;
  category: string;
  date: Date;
  notes?: string;
};

export type RecurringTransaction = {
  id: string;
  amount: number;
  category: string;
  recurrenceDay: number;
  notes?: string;
};

export type Category = {
  value: string;
  label: string;
  color: string;
  icon: string;
};

export type Budget = {
  category: string;
  amount: number;
};
