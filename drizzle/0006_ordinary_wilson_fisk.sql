CREATE TABLE "directMessage" (
	"id" text PRIMARY KEY NOT NULL,
	"senderId" text NOT NULL,
	"recipientId" text NOT NULL,
	"content" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "directMessage" ADD CONSTRAINT "directMessage_senderId_user_id_fk" FOREIGN KEY ("senderId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "directMessage" ADD CONSTRAINT "directMessage_recipientId_user_id_fk" FOREIGN KEY ("recipientId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;