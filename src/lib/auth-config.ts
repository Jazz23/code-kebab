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

export const zitadelConfigured = Boolean(
  normalizedZitadelClientId && normalizedZitadelIssuer,
);

export const credentialsFallbackEnabled =
  (process.env.NODE_ENV !== "production" ||
    process.env.AUTH_CREDENTIALS_FALLBACK === "true") &&
  !zitadelConfigured;

export const zitadelClientId = normalizedZitadelClientId;
export const zitadelClientSecret = normalizedZitadelClientSecret;
export const zitadelIssuer = normalizedZitadelIssuer;
export const zitadelHost = getUrlHost(zitadelIssuer);
