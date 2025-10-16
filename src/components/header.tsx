"use client";

import { Wallet } from "lucide-react";
import UserMenu from "@/components/UserMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <Wallet className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold font-headline">Gestor Financiero</h1>
      </div>

      <UserMenu />
    </header>
  );
}
