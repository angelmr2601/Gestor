import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 });
  }

  const body = await req.json();
  const { name, amount } = body;

  if (!name || !amount) {
    return new Response(JSON.stringify({ error: "Datos incompletos" }), { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });

  if (!user) {
    return new Response(JSON.stringify({ error: "Usuario no encontrado" }), { status: 404 });
  }

  const budget = await prisma.budget.create({
    data: {
      name,
      amount: parseFloat(amount),
      userId: user.id,
    },
  });

  return new Response(JSON.stringify(budget), { status: 201 });
}
