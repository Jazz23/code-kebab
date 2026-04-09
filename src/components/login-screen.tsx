"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";

type LoginScreenProps = {
  callbackUrl: string;
  credentialsFallbackEnabled: boolean;
  oidcEnabled: boolean;
  oidcHost: string | null;
  initialError: string | null;
};

function getErrorMessage(error: string | null) {
  if (!error) {
    return null;
  }

  if (error === "AccessDenied") {
    return "Sign-in was denied. Verify the account exists in Zitadel and has a verified email address.";
  }

  if (error === "CallbackRouteError" || error === "OAuthCallbackError") {
    return "The login flow did not complete. Check the Zitadel issuer, client ID, secret, and callback URL.";
  }

  return "Sign-in failed. Check the auth configuration and try again.";
}

export function LoginScreen({
  callbackUrl,
  credentialsFallbackEnabled,
  oidcEnabled,
  oidcHost,
  initialError,
}: LoginScreenProps) {
  const router = useRouter();
  const [error, setError] = useState(getErrorMessage(initialError));
  const [pendingProvider, setPendingProvider] = useState<
    "credentials" | "zitadel" | null
  >(null);

  async function handleOidcSignIn() {
    setError(null);
    setPendingProvider("zitadel");
    await signIn("zitadel", { callbackUrl });
  }

  async function handleCredentialsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPendingProvider("credentials");
    setError(null);

    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      callbackUrl,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setPendingProvider(null);
      return;
    }

    router.push(result?.url ?? callbackUrl);
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          &larr; Back
        </Link>

        <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Sign in
        </h1>

        {oidcEnabled ? (
          <>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Continue with your HazyForge account.
              {oidcHost ? ` You will be redirected to ${oidcHost}.` : null}
            </p>

            <button
              type="button"
              onClick={handleOidcSignIn}
              disabled={pendingProvider !== null}
              className="mt-6 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {pendingProvider === "zitadel"
                ? "Redirecting…"
                : "Continue with HazyForge"}
            </button>
          </>
        ) : (
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
            Zitadel OIDC is not configured. Using the local development fallback
            instead.
          </p>
        )}

        {credentialsFallbackEnabled ? (
          <form onSubmit={handleCredentialsSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                defaultValue="alex@example.com"
                className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-100"
                placeholder="alex@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                defaultValue="password"
                className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-100"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={pendingProvider !== null}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:border-zinc-100"
            >
              {pendingProvider === "credentials"
                ? "Signing in…"
                : "Use local seed account"}
            </button>
          </form>
        ) : null}

        {error ? (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : null}
      </div>
    </main>
  );
}
