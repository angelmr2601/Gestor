import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Obtener la sesión del usuario autenticado
  const session = await getServerSession(authOptions);

  // Si no hay sesión, redirigir al login
  if (!session) {
    redirect("/login");
  }

  // Si hay sesión, renderizar el dashboard normalmente
  return <>{children}</>;
}