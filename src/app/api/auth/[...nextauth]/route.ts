import NextAuth, { type Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

console.log("✅ NEXTAUTH_SECRET loaded:", !!process.env.NEXTAUTH_SECRET);
console.log("✅ DATABASE_URL loaded:", !!process.env.DATABASE_URL);
console.log("✅ NEXTAUTH_URL loaded:", process.env.NEXTAUTH_URL);

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt" as const,
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) return null;

        const valid = await bcrypt.compare(credentials.password, user.hashedPassword);
        if (!valid) return null;

        return { id: user.id, name: user.name ?? null, email: user.email ?? null };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) session.user.id = token.sub!;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };