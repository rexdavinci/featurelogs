CREATE TABLE "auth_password_resets" (
	"email_normalized" text PRIMARY KEY,
	"user_id" text,
	"token_hash" text NOT NULL UNIQUE,
	"expires_at" text NOT NULL,
	"requested_at" text NOT NULL
);
