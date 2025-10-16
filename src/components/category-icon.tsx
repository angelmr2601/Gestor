import {
  Briefcase,
  TrendingUp,
  Gift,
  PlusCircle,
  Utensils,
  Car,
  Home,
  Gamepad2,
  HeartPulse,
  Receipt,
  Book,
  Shirt,
  Plane,
  PiggyBank,
  GraduationCap,
  Film,
  Music,
  ShoppingCart,
  PawPrint,
  Wifi,
  Phone,
  Tv,
  Laptop,
  Coffee,
  Beer,
  Scissors,
  Dumbbell,
  Landmark,
  type LucideProps,
  Circle,
} from "lucide-react";

const icons = {
  Briefcase,
  TrendingUp,
  Gift,
  PlusCircle,
  Utensils,
  Car,
  Home,
  Gamepad2,
  HeartPulse,
  Receipt,
  Book,
  Shirt,
  Plane,
  PiggyBank,
  GraduationCap,
  Film,
  Music,
  ShoppingCart,
  PawPrint,
  Wifi,
  Phone,
  Tv,
  Laptop,
  Coffee,
  Beer,
  Scissors,
  Dumbbell,
  Landmark,
};

type CategoryIconProps = {
  name: string;
} & LucideProps;

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  const Icon = icons[name as keyof typeof icons] || Circle;
  return <Icon {...props} />;
}
