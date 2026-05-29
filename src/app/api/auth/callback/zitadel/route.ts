import { authServer } from "@/auth";

function forwardToBetterAuthCallback(request: Request) {
  const url = new URL(request.url);
  url.pathname = "/api/auth/oauth2/callback/zitadel";

  return authServer.handler(new Request(url, request));
}

export const GET = forwardToBetterAuthCallback;
