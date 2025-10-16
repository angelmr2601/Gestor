import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

// 📌 GET: Obtener todos los gastos del usuario autenticado
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const expenses = await prisma.expense.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(expenses, { status: 200 });
  } catch (error) {
    console.error("Error al obtener gastos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// 📌 POST: Crear un nuevo gasto
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const { title, amount, category } = await req.json();

    if (!title || !amount || !category) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const newExpense = await prisma.expense.create({
      data: {
        title,
        amount,
        category,
        userId: user.id,
        date: new Date(),
      },
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error("Error al crear gasto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// 📌 DELETE: Eliminar un gasto por ID
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    // Opcional: Verifica que el gasto pertenezca al usuario
    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await prisma.expense.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar gasto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
