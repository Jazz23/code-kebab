ALTER TABLE "verificationToken" RENAME TO "verification";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "providerAccountId" TO "accountId";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "provider" TO "providerId";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "access_token" TO "accessToken";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "refresh_token" TO "refreshToken";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "id_token" TO "idToken";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "sessionToken" TO "token";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "expires" TO "expiresAt";--> statement-breakpoint
ALTER TABLE "verification" RENAME COLUMN "token" TO "value";--> statement-breakpoint
ALTER TABLE "verification" RENAME COLUMN "expires" TO "expiresAt";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT IF EXISTS "account_provider_providerAccountId_pk";--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_pkey";--> statement-breakpoint
ALTER TABLE "verification" DROP CONSTRAINT IF EXISTS "verificationToken_identifier_token_pk";--> statement-breakpoint
UPDATE "user"
SET
  "name" = coalesce(nullif("name", ''), nullif("email", ''), 'User'),
  "email" = coalesce(nullif("email", ''), "id" || '@users.code-kebab.local');--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "emailVerified" SET DATA TYPE boolean USING ("emailVerified" IS NOT NULL);--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "emailVerified" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "emailVerified" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "createdAt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "id" text;--> statement-breakpoint
UPDATE "account"
SET "id" = md5("providerId" || ':' || "accountId" || ':' || "userId");--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "accessTokenExpiresAt" timestamp;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "refreshTokenExpiresAt" timestamp;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "account" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
INSERT INTO "account" (
  "id",
  "type",
  "accountId",
  "providerId",
  "userId",
  "password",
  "createdAt",
  "updatedAt"
)
SELECT
  'credential-' || "id",
  'credentials',
  "id",
  'credential',
  "id",
  "password",
  now(),
  now()
FROM "user"
WHERE "password" IS NOT NULL
ON CONFLICT ("id") DO NOTHING;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "id" text;--> statement-breakpoint
UPDATE "session"
SET "id" = md5("token" || ':' || "userId");--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "ipAddress" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "userAgent" text;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN "id" text;--> statement-breakpoint
UPDATE "verification"
SET "id" = md5("identifier" || ':' || "value");--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "verification" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "expires_at";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "token_type";--> statement-breakpoint
ALTER TABLE "account" DROP COLUMN "session_state";--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "password";--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_token_unique" UNIQUE("token");
