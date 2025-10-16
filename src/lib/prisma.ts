// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // allow global prisma during dev to avoid multiple instances
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
