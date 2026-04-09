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

  return (
    <LoginScreen
      callbackUrl={params.callbackUrl ?? "/"}
      credentialsFallbackEnabled={credentialsFallbackEnabled}
      oidcEnabled={zitadelConfigured}
      oidcHost={zitadelHost}
      initialError={params.error ?? null}
    />
  );
}
