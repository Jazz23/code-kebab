import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { verify } from "@node-rs/argon2";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Zitadel from "next-auth/providers/zitadel";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  credentialsFallbackEnabled,
  zitadelConfigured,
  zitadelIssuer,
} from "@/lib/auth-config";

if (process.env.NODE_ENV === "production" && !zitadelConfigured) {
  throw new Error(
    "Missing Zitadel auth configuration. Set AUTH_ZITADEL_ID, AUTH_ZITADEL_SECRET, and AUTH_ZITADEL_ISSUER.",
  );
}

const providers = [];

if (zitadelConfigured && zitadelIssuer) {
  providers.push(
    Zitadel({
      clientId: process.env.AUTH_ZITADEL_ID!,
      clientSecret: process.env.AUTH_ZITADEL_SECRET!,
      issuer: zitadelIssuer,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),
  );
}

if (credentialsFallbackEnabled) {
  providers.push(
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
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  providers,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    signIn: async ({ account, profile }) => {
      if (account?.provider === "zitadel") {
        return profile?.email_verified === true;
      }

      return true;
    },
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
