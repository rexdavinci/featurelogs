export interface UserProfile {
  uid: string;
  email: string;
  projects: Project[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  normalized: string;
  createdAt: string;
  updatedAt: string;
  tone?: StyleAndTone;
}

export type LogRecord = {
  id: string;
  userId: string;
  projectId: string;
  projectName: string;
  rawInput: string;
  outputChangelog: string;
  outputTwitter: string;
  outputLinkedin: string;
  outputHelpFaq: string;
  outputEmailNewsletter: string;
  outputMonthlyRecap?: string;
  createdAt: string;
};

export type TemplateRecord = {
  projectId: string;
  userId: string;
  settings: StyleTemplates;
  updatedAt: string;
};

export type DashboardSnapshot = {
  projects: Project[];
  logs: LogRecord[];
  styleTemplates: StyleTemplates;
  usageCount: number;
};

export type TemplateKey =
  | "changelog"
  | "linkedin"
  | "twitter"
  | "helpFaq"
  | "emailNewsletter"
  | "monthlyRecap";

export type TemplateItem = {
  label: string;
  tone: string;
  cta: string;
  hashtags?: string;
};

export type StyleTemplates = Record<TemplateKey, TemplateItem>;

export type StyleAndTone = {
  project: string;
  tone: string;
  cta: string;
  hashtags: string;
  label:
    | "changelog"
    | "linkedin"
    | "twitter"
    | "helpFaq"
    | "emailNewsletter"
    | "monthlyRecap";
};
