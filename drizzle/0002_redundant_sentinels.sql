CREATE TABLE "projectRole" (
	"id" text PRIMARY KEY NOT NULL,
	"projectId" text NOT NULL,
	"name" text NOT NULL,
	"hourlyRate" text,
	"salary" text
);
--> statement-breakpoint
ALTER TABLE "projectMember" DROP CONSTRAINT "projectMember_projectId_userId_pk";--> statement-breakpoint
ALTER TABLE "projectMember" ALTER COLUMN "userId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ALTER COLUMN "longDescription" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "projectMember" ADD COLUMN "id" text;--> statement-breakpoint
UPDATE "projectMember" SET "id" = gen_random_uuid()::text WHERE "id" IS NULL;--> statement-breakpoint
ALTER TABLE "projectMember" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "projectMember" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "projectMember" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "projectMember" ADD COLUMN "role" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "githubUrl" text;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "timelineDate" timestamp;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "timelineOpenEnded" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "openSlots" integer;--> statement-breakpoint
ALTER TABLE "projectRole" ADD CONSTRAINT "projectRole_projectId_project_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;
