function normalizeEnv(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeUrl(value: string | undefined) {
  return normalizeEnv(value)?.replace(/\/$/, "") ?? null;
}

function getUrlHost(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

const normalizedZitadelIssuer = normalizeUrl(process.env.AUTH_ZITADEL_ISSUER);
const normalizedZitadelClientId = normalizeEnv(process.env.AUTH_ZITADEL_ID);
const normalizedZitadelClientSecret = normalizeEnv(
  process.env.AUTH_ZITADEL_SECRET,
);
const normalizedGithubClientId = normalizeEnv(process.env.AUTH_GITHUB_ID);
const normalizedGithubClientSecret = normalizeEnv(
  process.env.AUTH_GITHUB_SECRET,
);
const normalizedAuthUrl = normalizeUrl(
  process.env.BETTER_AUTH_URL ?? process.env.AUTH_URL,
);
const normalizedAuthSecret = normalizeEnv(
  process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET,
);

export const zitadelConfigured = Boolean(
  normalizedZitadelClientId && normalizedZitadelIssuer,
);

const credentialsFallbackRequested =
  process.env.AUTH_CREDENTIALS_FALLBACK === "true";

export const credentialsFallbackEnabled =
  credentialsFallbackRequested ||
  (process.env.NODE_ENV !== "production" &&
    !zitadelConfigured &&
    !(normalizedGithubClientId && normalizedGithubClientSecret));

export const zitadelClientId = normalizedZitadelClientId;
export const zitadelClientSecret = normalizedZitadelClientSecret;
export const zitadelIssuer = normalizedZitadelIssuer;
export const zitadelHost = getUrlHost(zitadelIssuer);
export const githubClientId = normalizedGithubClientId ?? "";
export const githubClientSecret = normalizedGithubClientSecret ?? "";
export const githubConfigured = Boolean(
  normalizedGithubClientId && normalizedGithubClientSecret,
);
export const authUrl = normalizedAuthUrl;
export const authSecret = normalizedAuthSecret;
