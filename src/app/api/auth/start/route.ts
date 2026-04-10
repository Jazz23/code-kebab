import { NextResponse } from "next/server";
import { signIn } from "@/auth";
import { zitadelConfigured } from "@/lib/auth-config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const callbackUrl = url.searchParams.get("callbackUrl") ?? "/";

  if (!zitadelConfigured) {
    const loginUrl = new URL("/login", url.origin);
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(loginUrl);
  }

  return signIn("zitadel", { redirectTo: callbackUrl });
}
