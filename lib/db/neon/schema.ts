import { index, jsonb, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import type { Project, StyleTemplates, UserProfile } from "@/lib/types";

export const projects = pgTable(
  "projects",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    normalized: text("normalized").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    index("projects_user_normalized_idx").on(table.userId, table.normalized),
  ],
);

export const usageEvents = pgTable(
  "usage_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    action: text("action").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [index("usage_events_user_created_idx").on(table.userId, table.createdAt)],
);

export const logs = pgTable(
  "logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    projectId: text("project_id").notNull(),
    projectName: text("project_name").notNull(),
    rawInput: text("raw_input").notNull(),
    outputChangelog: text("output_changelog").notNull(),
    outputTwitter: text("output_twitter").notNull(),
    outputLinkedin: text("output_linkedin").notNull(),
    outputHelpFaq: text("output_help_faq").notNull(),
    outputEmailNewsletter: text("output_email_newsletter").notNull(),
    outputMonthlyRecap: text("output_monthly_recap"),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("logs_user_created_idx").on(table.userId, table.createdAt),
    index("logs_project_created_idx").on(table.projectId, table.createdAt),
  ],
);

export const styleTemplates = pgTable(
  "style_templates",
  {
    userId: text("user_id").notNull(),
    projectId: text("project_id").notNull(),
    settings: jsonb("settings").$type<StyleTemplates>().notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.projectId],
    }),
  ],
);

export const profiles = pgTable("profiles", {
  uid: text("uid").primaryKey(),
  email: text("email").notNull(),
  projects: jsonb("projects").$type<Project[]>().notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const authUsers = pgTable(
  "auth_users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    emailNormalized: text("email_normalized").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [index("auth_users_email_normalized_idx").on(table.emailNormalized)],
);

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => [
    index("auth_sessions_token_hash_idx").on(table.tokenHash),
    index("auth_sessions_user_expires_idx").on(table.userId, table.expiresAt),
  ],
);

export type NeonProjectRow = typeof projects.$inferSelect;
export type NeonProfileRow = typeof profiles.$inferSelect;
export type NeonUserProfile = UserProfile;
