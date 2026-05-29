import { LoginScreen } from "@/components/login-screen";
import {
  credentialsFallbackEnabled,
  githubConfigured,
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

  return (
    <LoginScreen
      callbackUrl={callbackUrl}
      credentialsFallbackEnabled={credentialsFallbackEnabled}
      githubEnabled={githubConfigured}
      zitadelEnabled={zitadelConfigured}
      zitadelHost={zitadelHost}
      initialError={params.error ?? null}
    />
  );
}
