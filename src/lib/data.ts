import type { Category } from './types';

export const incomeCategories: Category[] = [
  { value: 'salario', label: 'Salario', color: 'hsl(142.1, 76.2%, 36.3%)', icon: 'Briefcase' },
  { value: 'inversiones', label: 'Inversiones', color: 'hsl(221.2, 83.2%, 53.3%)', icon: 'TrendingUp' },
  { value: 'regalos', label: 'Regalos', color: 'hsl(346.8, 77.2%, 49.8%)', icon: 'Gift' },
  { value: 'otros', label: 'Otros', color: 'hsl(47.9, 95.8%, 53.1%)', icon: 'PlusCircle' },
];

export const expenseCategories: Category[] = [
  { value: 'comida', label: 'Comida', color: 'hsl(22, 95%, 61%)', icon: 'Utensils' },
  { value: 'transporte', label: 'Transporte', color: 'hsl(262, 80%, 68%)', icon: 'Car' },
  { value: 'vivienda', label: 'Vivienda', color: 'hsl(180, 70%, 45%)', icon: 'Home' },
  { value: 'ocio', label: 'Ocio', color: 'hsl(320, 75%, 60%)', icon: 'Gamepad2' },
  { value: 'salud', label: 'Salud', color: 'hsl(0, 85%, 65%)', icon: 'HeartPulse' },
  { value: 'otros', label: 'Otros', color: 'hsl(60, 80%, 55%)', icon: 'Receipt' },
];

export const availableIcons = [
  "Briefcase",
  "TrendingUp",
  "Gift",
  "PlusCircle",
  "Utensils",
  "Car",
  "Home",
  "Gamepad2",
  "HeartPulse",
  "Receipt",
  "Book",
  "Shirt",
  "Plane",
  "PiggyBank",
  "GraduationCap",
  "Film",
  "Music",
  "ShoppingCart",
  "PawPrint",
  "Wifi",
  "Phone",
  "Tv",
  "Laptop",
  "Coffee",
  "Beer",
  "Scissors",
  "Dumbbell",
  "Landmark",
] as const;

    
