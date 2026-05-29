"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type LoginScreenProps = {
  callbackUrl: string;
  credentialsFallbackEnabled: boolean;
  githubEnabled: boolean;
  zitadelEnabled: boolean;
  zitadelHost: string | null;
  initialError: string | null;
};

function getErrorMessage(error: string | null) {
  if (!error) {
    return null;
  }

  if (error === "CredentialsSignin" || error === "invalid_credentials") {
    return "Invalid email or password.";
  }

  if (error === "AccessDenied") {
    return "Sign-in was denied after the Zitadel login completed. If this keeps happening, check whether Zitadel is reporting the email as unverified.";
  }

  if (error === "CallbackRouteError" || error === "OAuthCallbackError") {
    return "The login flow did not complete. Check the ZITADEL issuer, client ID, secret, and callback URL.";
  }

  return "Sign-in failed. Check the auth configuration and try again.";
}

export function LoginScreen({
  callbackUrl,
  credentialsFallbackEnabled,
  githubEnabled,
  zitadelEnabled,
  zitadelHost,
  initialError,
}: LoginScreenProps) {
  const router = useRouter();
  const [error, setError] = useState(getErrorMessage(initialError));
  const [pendingProvider, setPendingProvider] = useState<
    "credentials" | "github" | "zitadel" | null
  >(null);

  async function handleGithubSignIn() {
    setError(null);
    setPendingProvider("github");

    const result = await authClient.signIn.social({
      provider: "github",
      callbackURL: callbackUrl,
    });

    if (result.error) {
      setError(
        "GitHub sign-in failed. Check the OAuth app configuration and try again.",
      );
      setPendingProvider(null);
    }
  }

  async function handleZitadelSignIn() {
    setError(null);
    setPendingProvider("zitadel");

    const result = await authClient.signIn.oauth2({
      providerId: "zitadel",
      callbackURL: callbackUrl,
    });

    if (result.error) {
      setError(
        "HazyForge sign-in failed. Check the ZITADEL configuration and try again.",
      );
      setPendingProvider(null);
    }
  }

  async function handleCredentialsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPendingProvider("credentials");
    setError(null);

    const form = new FormData(e.currentTarget);
    const result = await authClient.signIn.email({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      rememberMe: true,
    });

    if (result.error) {
      setError("Invalid email or password.");
      setPendingProvider(null);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="text-sm text-[#a59cb8] transition-colors hover:text-[#fff1da]"
        >
          &larr; Back
        </Link>

        <h1 className="mt-6 text-2xl font-bold text-white">Sign in</h1>

        {githubEnabled || zitadelEnabled ? (
          <>
            <p className="mt-2 text-sm text-[#d6d0e5]">
              Continue with GitHub
              {zitadelEnabled ? " or your HazyForge account" : ""}.
              {zitadelEnabled && zitadelHost
                ? ` HazyForge redirects through ${zitadelHost}.`
                : null}
            </p>

            <div className="mt-6 space-y-3">
              {githubEnabled ? (
                <button
                  type="button"
                  onClick={handleGithubSignIn}
                  disabled={pendingProvider !== null}
                  className="ck-button-primary w-full px-4 py-2.5 text-sm disabled:opacity-50"
                >
                  {pendingProvider === "github"
                    ? "Redirecting..."
                    : "Continue with GitHub"}
                </button>
              ) : null}

              {zitadelEnabled ? (
                <button
                  type="button"
                  onClick={handleZitadelSignIn}
                  disabled={pendingProvider !== null}
                  className="ck-button-secondary w-full px-4 py-2.5 text-sm disabled:opacity-50"
                >
                  {pendingProvider === "zitadel"
                    ? "Redirecting..."
                    : "Continue with HazyForge"}
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-[#ffb04a]">
            OAuth is not configured. Using the local development fallback
            instead.
          </p>
        )}

        {credentialsFallbackEnabled ? (
          <form onSubmit={handleCredentialsSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#ddd7ef]"
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
                className="ck-input mt-1 block w-full rounded-lg px-3 py-2 text-sm"
                placeholder="alex@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#ddd7ef]"
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
                className="ck-input mt-1 block w-full rounded-lg px-3 py-2 text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={pendingProvider !== null}
              className="ck-button-secondary w-full px-4 py-2.5 text-sm disabled:opacity-50"
            >
              {pendingProvider === "credentials"
                ? "Signing in..."
                : "Use local seed account"}
            </button>
          </form>
        ) : null}

        {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}
      </div>
    </main>
  );
}
