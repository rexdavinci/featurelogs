import type {
  DashboardSnapshot,
  LogRecord,
  Project,
  StyleTemplates,
  UserProfile,
} from "@/lib/types";

type UsageAction =
  | "create_project"
  | "save_templates"
  | "generate_marketing_kit_ai"
  | "save_log"
  | "generate_monthly_newsletter_ai";

export interface ServerDatabaseAdapter {
  countUsageSince(userId: string, sinceIso: string): Promise<number>;
  consumeUsage(
    userId: string,
    action: UsageAction,
    metadata?: Record<string, unknown>,
  ): Promise<void>;
  loadPublicRanking(): Promise<
    { projectId: string; projectName: string; count: number }[]
  >;
  countProjects(userId: string): Promise<number>;
  ensureProject(userId: string, projectName: string): Promise<Project>;
  findProjectByName(
    userId: string,
    projectName: string,
  ): Promise<Project | undefined>;
  loadDashboardSnapshot(userId: string): Promise<DashboardSnapshot>;
  loadProjectById(
    userId: string,
    projectId: string,
  ): Promise<Project | undefined>;
  loadTemplates(userId: string, projectId: string): Promise<StyleTemplates>;
  saveTemplates(
    userId: string,
    projectId: string,
    settings: StyleTemplates,
  ): Promise<void>;
  loadLogsSince(userId: string, sinceIso: string): Promise<LogRecord[]>;
  saveLog(input: Record<string, unknown>): Promise<void>;
  createUserProfile(newUser: UserProfile): Promise<void>;
  getUserProfile(uid: string): Promise<UserProfile | null>;
  ensureUserProfile(uid: string, email: string): Promise<UserProfile>;
}
