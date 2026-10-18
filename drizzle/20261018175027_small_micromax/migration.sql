CREATE TABLE "auth_sessions" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_users" (
	"id" text PRIMARY KEY,
	"email" text NOT NULL,
	"email_normalized" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "auth_sessions_token_hash_idx" ON "auth_sessions" ("token_hash");--> statement-breakpoint
CREATE INDEX "auth_sessions_user_expires_idx" ON "auth_sessions" ("user_id","expires_at");--> statement-breakpoint
CREATE INDEX "auth_users_email_normalized_idx" ON "auth_users" ("email_normalized");