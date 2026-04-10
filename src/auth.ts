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
  zitadelClientId,
  zitadelClientSecret,
  zitadelConfigured,
  zitadelIssuer,
} from "@/lib/auth-config";

function getZitadelUsernameCandidates(profile: unknown) {
  if (!profile || typeof profile !== "object") {
    return [];
  }

  const preferredUsername =
    "preferred_username" in profile &&
    typeof profile.preferred_username === "string"
      ? profile.preferred_username.trim()
      : "";

  if (!preferredUsername) {
    return [];
  }

  const localPart = preferredUsername.includes("@")
    ? (preferredUsername.split("@")[0]?.trim() ?? "")
    : "";

  return [...new Set([localPart, preferredUsername].filter(Boolean))];
}

function getStringClaim(profile: unknown, claim: string) {
  if (!profile || typeof profile !== "object") {
    return null;
  }

  if (!(claim in profile) || typeof profile[claim] !== "string") {
    return null;
  }

  const value = profile[claim].trim();
  return value || null;
}

async function syncZitadelProfile(userId: string, profile: unknown) {
  const [currentUser] = await db
    .select({
      name: users.name,
      email: users.email,
      image: users.image,
      username: users.username,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!currentUser) {
    return;
  }

  const updateData: Partial<{
    name: string;
    email: string;
    image: string;
    username: string;
  }> = {};

  if (!currentUser.name) {
    const name = getStringClaim(profile, "name");
    if (name) {
      updateData.name = name;
    }
  }

  if (!currentUser.email) {
    const email = getStringClaim(profile, "email");
    if (email) {
      updateData.email = email.toLowerCase();
    }
  }

  if (!currentUser.image) {
    const image = getStringClaim(profile, "picture");
    if (image) {
      updateData.image = image;
    }
  }

  if (!currentUser.username) {
    const usernameCandidates = getZitadelUsernameCandidates(profile);

    for (const username of usernameCandidates) {
      const [existingUser] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser && existingUser.id !== userId) {
        continue;
      }

      updateData.username = username;
      break;
    }
  }

  if (!Object.keys(updateData).length) {
    return;
  }

  await db.update(users).set(updateData).where(eq(users.id, userId));
}

if (process.env.NODE_ENV === "production" && !zitadelConfigured) {
  throw new Error(
    "Missing Zitadel auth configuration. Set AUTH_ZITADEL_ID and AUTH_ZITADEL_ISSUER. AUTH_ZITADEL_SECRET is optional for PKCE flows.",
  );
}

const providers = [];

if (zitadelConfigured && zitadelIssuer && zitadelClientId) {
  const zitadelConfig: Parameters<typeof Zitadel>[0] = {
    clientId: zitadelClientId,
    issuer: zitadelIssuer,
    idToken: false,
    authorization: {
      params: {
        scope: "openid profile email",
      },
    },
  };

  if (zitadelClientSecret) {
    zitadelConfig.clientSecret = zitadelClientSecret;
  }

  providers.push(Zitadel(zitadelConfig));
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
        const emailVerified = profile?.email_verified;
        return emailVerified !== false;
      }

      return true;
    },
    jwt: async ({ token, account, profile }) => {
      if (account?.provider === "zitadel") {
        const name = getStringClaim(profile, "name");
        const email = getStringClaim(profile, "email");
        const image = getStringClaim(profile, "picture");

        if (name) {
          token.name = name;
        }

        if (email) {
          token.email = email.toLowerCase();
        }

        if (image) {
          token.picture = image;
        }
      }

      return token;
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
  events: {
    signIn: async ({ user, account, profile }) => {
      if (account?.provider !== "zitadel" || !user.id) {
        return;
      }

      await syncZitadelProfile(user.id, profile);
    },
  },
});
