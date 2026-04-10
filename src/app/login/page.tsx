import { redirect } from "next/navigation";
import { LoginScreen } from "@/components/login-screen";
import {
  credentialsFallbackEnabled,
  zitadelConfigured,
  zitadelHost,
} from "@/lib/auth-config";

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/";

  if (zitadelConfigured && !params.error) {
    redirect(`/api/auth/start?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return (
    <LoginScreen
      callbackUrl={callbackUrl}
      credentialsFallbackEnabled={credentialsFallbackEnabled}
      oidcEnabled={zitadelConfigured}
      oidcHost={zitadelHost}
      initialError={params.error ?? null}
    />
  );
}
