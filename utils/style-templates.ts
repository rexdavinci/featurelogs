export type TemplateKey =
  | "changelog"
  | "linkedin"
  | "twitter"
  | "helpFaq"
  | "emailNewsletter"
  | "monthlyNewsletter";

export type TemplateItem = {
  label: string;
  tone: string;
  cta: string;
  hashtags: string;
  premiumOnly?: boolean;
};

export type StyleTemplates = Record<TemplateKey, TemplateItem>;

export const TEMPLATE_ORDER: TemplateKey[] = [
  "changelog",
  "twitter",
  "linkedin",
  "helpFaq",
  "emailNewsletter",
  "monthlyNewsletter",
];

export const DEFAULT_STYLE_TEMPLATES: StyleTemplates = {
  changelog: {
    label: "Public Changelog",
    tone: "Informative, benefit-driven, and concise with clear bullets.",
    cta: "Try this release and share feedback with our team.",
    hashtags: "#SaaS #BuildInPublic #ProductUpdate",
  },
  linkedin: {
    label: "LinkedIn Post",
    tone: "Professional storytelling with a sharp hook and short paragraphs.",
    cta: "Comment with your launch strategy this week.",
    hashtags: "#startups #product #softwareengineering",
    premiumOnly: true,
  },
  twitter: {
    label: "Twitter Thread",
    tone: "Punchy and high-signal with a problem-to-solution structure.",
    cta: "Retweet if this release solves your pain point.",
    hashtags: "#buildinpublic #indiehackers #solofounder",
  },
  helpFaq: {
    label: "Help Center FAQ",
    tone: "Step-by-step developer-friendly style with practical examples.",
    cta: "Need more help? Contact support for direct guidance.",
    hashtags: "#support #helpcenter #docs",
    premiumOnly: true,
  },
  emailNewsletter: {
    label: "Email Newsletter",
    tone: "Warm founder voice with clear highlights and action items.",
    cta: "Reply to this email with your feedback.",
    hashtags: "#newsletter #saas #community",
    premiumOnly: true,
  },
  monthlyNewsletter: {
    label: "Monthly Newsletter",
    tone: "Executive monthly recap with wins, insights, and roadmap notes.",
    cta: "Share this recap with your team and investors.",
    hashtags: "#monthlyrecap #buildinpublic #growth",
    premiumOnly: true,
  },
};

export function mergeTemplates(input: unknown): StyleTemplates {
  if (!input || typeof input !== "object") {
    return DEFAULT_STYLE_TEMPLATES;
  }

  const raw = input as Partial<Record<TemplateKey, Partial<TemplateItem>>>;
  const merged = { ...DEFAULT_STYLE_TEMPLATES } as StyleTemplates;

  for (const key of TEMPLATE_ORDER) {
    const candidate = raw[key];
    if (!candidate) continue;

    merged[key] = {
      ...merged[key],
      tone: candidate.tone?.trim() || merged[key].tone,
      cta: candidate.cta?.trim() || merged[key].cta,
      hashtags: candidate.hashtags?.trim() || merged[key].hashtags,
    };
  }

  return merged;
}
