import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { db } from "@/db";
import { users } from "@/db/schema";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    GitHub,
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials.email as string;
        const password = credentials.password as string;

        if (!email || !password) {
          return null;
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user?.password) {
          return null;
        }

        const valid = await verify(user.password, password);
        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      return session;
    },
    authorized: async ({ auth }) => {
      return !!auth;
    },
  },
});
