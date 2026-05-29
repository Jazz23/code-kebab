import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { authServer } from "@/auth";
import { zitadelConfigured } from "@/lib/auth-config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const callbackUrl = url.searchParams.get("callbackUrl") ?? "/";

  if (!zitadelConfigured) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  const result = await (
    authServer.api as unknown as {
      signInWithOAuth2: (options: {
        body: { providerId: string; callbackURL: string };
        headers: Headers;
      }) => Promise<{ url?: string }>;
    }
  ).signInWithOAuth2({
    body: {
      providerId: "zitadel",
      callbackURL: callbackUrl,
    },
    headers: await headers(),
  });

  if (result.url) {
    redirect(result.url);
  }

  const loginUrl = new URL("/login", url.origin);
  loginUrl.searchParams.set("callbackUrl", callbackUrl);
  loginUrl.searchParams.set("error", "OAuthSignIn");
  return NextResponse.redirect(loginUrl);
}
