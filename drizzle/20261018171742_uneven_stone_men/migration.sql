CREATE TABLE "logs" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"project_id" text NOT NULL,
	"project_name" text NOT NULL,
	"raw_input" text NOT NULL,
	"output_changelog" text NOT NULL,
	"output_twitter" text NOT NULL,
	"output_linkedin" text NOT NULL,
	"output_help_faq" text NOT NULL,
	"output_email_newsletter" text NOT NULL,
	"output_monthly_recap" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"uid" text PRIMARY KEY,
	"email" text NOT NULL,
	"projects" jsonb NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"normalized" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "style_templates" (
	"user_id" text,
	"project_id" text,
	"settings" jsonb NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "style_templates_pkey" PRIMARY KEY("user_id","project_id")
);
--> statement-breakpoint
CREATE TABLE "usage_events" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"action" text NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "logs_user_created_idx" ON "logs" ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "logs_project_created_idx" ON "logs" ("project_id","created_at");--> statement-breakpoint
CREATE INDEX "projects_user_normalized_idx" ON "projects" ("user_id","normalized");--> statement-breakpoint
CREATE INDEX "usage_events_user_created_idx" ON "usage_events" ("user_id","created_at");