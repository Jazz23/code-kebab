const normalizedZitadelIssuer =
  process.env.AUTH_ZITADEL_ISSUER?.trim().replace(/\/$/, "") ?? null;

export const zitadelConfigured = Boolean(
  process.env.AUTH_ZITADEL_ID &&
    process.env.AUTH_ZITADEL_SECRET &&
    normalizedZitadelIssuer,
);

export const credentialsFallbackEnabled =
  process.env.NODE_ENV !== "production" && !zitadelConfigured;

export const zitadelIssuer = normalizedZitadelIssuer;

export const zitadelHost = (() => {
  if (!zitadelIssuer) {
    return null;
  }

  try {
    return new URL(zitadelIssuer).host;
  } catch {
    return null;
  }
})();
