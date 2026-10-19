import type { StyleTemplates, TemplateItem, TemplateKey } from "@/lib/types";

export type { StyleTemplates, TemplateItem, TemplateKey } from "@/lib/types";

export const TEMPLATE_ORDER: TemplateKey[] = [
  "changelog",
  "twitter",
  "linkedin",
  "helpFaq",
  "emailNewsletter",
  "monthlyRecap",
];

export const DEFAULT_STYLE_TEMPLATES: StyleTemplates = {
  changelog: {
    label: "Public Changelog",
    tone: "Informative, benefit-driven, and concise with clear bullets.",
    cta: "Try this release and share feedback with our team.",
    hashtags: "#ProductUpdate",
  },
  linkedin: {
    label: "LinkedIn Post",
    tone: "Professional storytelling with a sharp hook and short paragraphs.",
    cta: "Tell us what you think of the update.",
    hashtags: "#ProductUpdate",
  },
  twitter: {
    label: "Twitter Thread",
    tone: "Punchy and high-signal with a problem-to-solution structure.",
    cta: "Share your thoughts on what’s new.",
    hashtags: "#ProductUpdate",
  },
  helpFaq: {
    label: "Help Center FAQ",
    tone: "Clear, customer-friendly guidance with practical examples.",
    cta: "Need more help? Contact support for direct guidance.",
    hashtags: "#support #helpcenter #docs",
  },
  emailNewsletter: {
    label: "Email Newsletter",
    tone: "Warm, conversational voice with clear highlights and next steps.",
    cta: "Reply to this email with your feedback.",
    hashtags: "",
  },
  monthlyRecap: {
    label: "Monthly Recap",
    tone: "A clear monthly roundup of useful improvements and what they mean for customers.",
    cta: "Let us know which update was most useful.",
    hashtags: "",
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
