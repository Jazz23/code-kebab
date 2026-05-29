import type { BetterAuthPlugin } from "@better-auth/core";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { hash, verify } from "@node-rs/argon2";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { genericOAuth } from "better-auth/plugins";
import { headers } from "next/headers";
import { db } from "@/db";
import { accounts, sessions, users, verifications } from "@/db/schema";
import {
  authUrl,
  credentialsFallbackEnabled,
  githubClientId,
  githubClientSecret,
  githubConfigured,
  zitadelClientId,
  zitadelClientSecret,
  zitadelConfigured,
  zitadelIssuer,
} from "@/lib/auth-config";

function getStringClaim(profile: unknown, claim: string) {
  if (!profile || typeof profile !== "object") {
    return null;
  }

  const claims = profile as Record<string, unknown>;

  if (!(claim in claims) || typeof claims[claim] !== "string") {
    return null;
  }

  const value = claims[claim].trim();
  return value || null;
}

function getUsernameFromProfile(profile: unknown) {
  const username =
    getStringClaim(profile, "login") ??
    getStringClaim(profile, "preferred_username") ??
    null;

  if (!username) {
    return null;
  }

  return username.includes("@")
    ? (username.split("@")[0]?.trim() ?? username)
    : username;
}

const plugins: BetterAuthPlugin[] = [nextCookies()];
const zitadelRedirectURI = authUrl
  ? `${authUrl.replace(/\/$/, "")}/api/auth/callback/zitadel`
  : undefined;

if (zitadelConfigured && zitadelIssuer && zitadelClientId) {
  plugins.push(
    genericOAuth({
      config: [
        {
          providerId: "zitadel",
          clientId: zitadelClientId,
          clientSecret: zitadelClientSecret ?? undefined,
          redirectURI: zitadelRedirectURI,
          discoveryUrl: `${zitadelIssuer}/.well-known/openid-configuration`,
          issuer: zitadelIssuer,
          scopes: ["openid", "profile", "email"],
          pkce: true,
          mapProfileToUser(profile) {
            return {
              name: getStringClaim(profile, "name") ?? "",
              email: getStringClaim(profile, "email") ?? "",
              image: getStringClaim(profile, "picture"),
              emailVerified: profile.email_verified !== false,
              username: getUsernameFromProfile(profile),
            };
          },
        },
      ],
    }),
  );
}

export const authServer = betterAuth({
  baseURL: authUrl ?? undefined,
  secret: process.env.AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    camelCase: true,
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
        input: false,
      },
      bio: {
        type: "string",
        required: false,
        input: false,
      },
      timezone: {
        type: "string",
        required: false,
        input: false,
      },
      skills: {
        type: "string[]",
        required: false,
        input: false,
      },
      socialLinks: {
        type: "string[]",
        required: false,
        input: false,
      },
      emailNotifications: {
        type: "boolean",
        required: false,
        input: false,
        defaultValue: true,
      },
    },
  },
  emailAndPassword: {
    enabled: credentialsFallbackEnabled,
    disableSignUp: true,
    minPasswordLength: 1,
    password: {
      hash,
      verify: ({ hash: passwordHash, password }) =>
        verify(passwordHash, password),
    },
  },
  socialProviders: githubConfigured
    ? {
        github: {
          clientId: githubClientId,
          clientSecret: githubClientSecret,
          mapProfileToUser(profile) {
            return {
              username: profile.login,
            };
          },
        },
      }
    : undefined,
  plugins,
  onAPIError: {
    errorURL: "/login",
  },
});

export async function auth() {
  return authServer.api.getSession({
    headers: await headers(),
  });
}
