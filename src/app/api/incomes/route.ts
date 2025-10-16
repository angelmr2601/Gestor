import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

// 📌 GET: Obtener todos los ingresos del usuario autenticado
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

    const incomes = await prisma.income.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(incomes, { status: 200 });
  } catch (error) {
    console.error("Error al obtener ingresos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// 📌 POST: Crear un nuevo ingreso
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

    const newIncome = await prisma.income.create({
      data: {
        title,
        amount,
        category,
        userId: user.id,
        date: new Date(),
      },
    });

    return NextResponse.json(newIncome, { status: 201 });
  } catch (error) {
    console.error("Error al crear ingreso:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
// 📌 DELETE: Eliminar un ingreso por ID
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

    // Opcional: Verifica que el ingreso pertenezca al usuario
    const income = await prisma.income.findUnique({ where: { id } });
    if (!income || income.userId !== session.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await prisma.income.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar ingreso:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
