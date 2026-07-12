import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import type { StyleTemplates } from "@/utils/style-templates";

type GenerationResult = {
  changelog: string;
  twitterMessages: string[];
  linkedin: string;
  helpFaq: string;
  emailNewsletter: string;
};

type GenerateContentArgs = {
  projectName: string;
  rawInput: string;
  isSubscribed: boolean;
  templates: StyleTemplates;
};

const apiKey = process.env.OPENAI_API_KEY;
const client = createOpenRouter({
  apiKey: apiKey,
  appUrl: "https://featurelogs.com",
  appName: "FeatureLogs",
});

function fallbackGeneration(args: GenerateContentArgs): GenerationResult {
  const { projectName, rawInput, isSubscribed, templates } = args;
  const bullets = rawInput
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8)
    .map((line) => `- ${line}`)
    .join("\n");

  return {
    changelog: `## ${projectName} Update\n\n${bullets || "- Improved stability and polished release quality."}`,
    twitterMessages: [
      `Shipping update for ${projectName}:\n\n${rawInput.slice(0, 200)}\n\n${templates.twitter.hashtags}`,
    ],
    linkedin: isSubscribed
      ? `We pushed another release for ${projectName}.\n\n${rawInput.slice(0, 420)}\n\n${templates.linkedin.cta}`
      : "Upgrade to unlock LinkedIn generation.",
    helpFaq: isSubscribed
      ? `### FAQ: ${projectName} release\n\n- **What changed?** ${rawInput.slice(0, 220)}\n- **How do I use it?** Follow the latest release guide.\n- **Need help?** ${templates.helpFaq.cta}`
      : "Upgrade to unlock Help Center FAQ generation.",
    emailNewsletter: isSubscribed
      ? `Subject: ${projectName} weekly update\n\n${rawInput.slice(0, 500)}\n\n${templates.emailNewsletter.cta}`
      : "Upgrade to unlock Email Newsletter generation.",
  };
}

function normalizeTwitterMessages(
  input: unknown,
  maxMessages: number,
  fallback: string,
) {
  if (!Array.isArray(input)) {
    return [fallback];
  }

  const prepared = input
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .slice(0, maxMessages);

  return prepared.length ? prepared : [fallback];
}

export async function generateContent(
  args: GenerateContentArgs,
): Promise<GenerationResult> {
  const { projectName, rawInput, isSubscribed, templates } = args;
  const apiKey = process.env.OPENAI_API_KEY;
  const maxTwitterMessages = isSubscribed ? 4 : 1;

  if (!apiKey) {
    return fallbackGeneration(args);
  }

  const premiumInstructions = isSubscribed
    ? "Include premium outputs for linkedin, helpFaq, and emailNewsletter."
    : "Set linkedin, helpFaq, and emailNewsletter to empty strings.";

  // const systemPrompt = `You are FeatureLogs, a concise build-in-public writer that returns ONLY valid JSON, no explanation, nothing else.`;

  //   const userPrompt = `Project: ${projectName}
  // Raw update text:\n${rawInput}

  // Template settings:\n${JSON.stringify(templates)}

  // ${premiumInstructions}

  // Return strict JSON with keys changelog, twitterMessages, linkedin, helpFaq, emailNewsletter.
  // {
  //   "changelog": "<markdown section with title + bullets>",
  //   "twitterMessages": "array of short thread messages. Maximum count: ${maxTwitterMessages}",
  //   "linkedin": "structured post with hook + bullets + CTA",
  //   "helpFaq": "help center style FAQ entry",
  //   "emailNewsletter": "newsletter-ready update text"
  // }`;

  // const response = await client.responses.create({
  //   model,
  //   input: prompt,``
  // });

  const prompt = `You are an expert Chief Marketing Officer (CMO) and Technical Writer for SaaS startups.
Your goal is to turn technical, messy, raw git commits or quick informal text descriptions written by software founders into highly polished, engaging, and professional public-facing marketing copy and documentation.
${premiumInstructions}
Given the following raw input from a founder about what they built:
---
${rawInput}
---
${JSON.stringify(templates)}

Instantly generate the following 5 distinct, high-quality deliverables in JSON format. You MUST return ONLY a valid JSON object matching the schema below. Do not wrap the JSON in Markdown backticks (like \`\`\`json) or include any preambles or post-scripts. The output must be pure, parsable JSON.

Expected JSON output format:
{
  "changelog": "A polished, public-facing Markdown changelog entry. Focus on user benefits, what problem it solves, and how to use it. Highlight the feature with neat bullet points, styled with spacious headers. Do not include any emojis or hashtags.",
  "linkedin": "A hook-driven LinkedIn post. Start with a scroll-stopping hook, followed by a clear breakdown of the benefits, and end with an engaging call-to-action (CTA). Use 3-5 relevant emojis and 3-4 hashtags. Keep paragraphs short (1-2 sentences) and spacious.",
  "twitterMessages": [
    "Tweet 1: Scroll-stopping hook announcing the update. Snappy, value-driven, ending with (1/4)",
    "Tweet 2: The pain point. Explain what makes this feature necessary. Ending with (2/4)",
    "Tweet 3: The solution. Highlight 2 key benefits of how this solves the problem. Ending with (3/4)",
    "Tweet 4: The call to action. Spark excitement and tell them to try it now. Ending with (4/4)"
  ],
  "helpFaq": "An updated draft for their Help Center/FAQ documentation in clean Markdown. Include sections like: 'Overview', 'How to use it', and 'FAQ' (with 2 common questions and answers).",
  "emailNewsletter": "A personalized email newsletter update for their existing users. Include: 'Subject: <Catchy, high-open-rate subject line>', a warm opening ('Hey everyone, <Founder Name> here!'), an exciting, benefit-driven breakdown, and a clear CTA button/link."
}`;

  const response = await generateText({
    // model: client("xiaomi/mimo-v2.5"),
    model: client("openai/gpt-4.1-mini"),
    // model: client("google/gemini-2.5-flash"),
    prompt,
    maxOutputTokens: 1500,
    temperature: 0.5,
  });

  const text = response.text;
  if (!text) {
    return fallbackGeneration(args);
  }

  try {
    const parsed = JSON.parse(text) as Partial<GenerationResult>;

    if (!parsed.changelog) {
      return fallbackGeneration(args);
    }

    const fallbackTwitter = `Shipping ${projectName} update. ${templates.twitter.hashtags}`;

    return {
      changelog: parsed.changelog,
      twitterMessages: normalizeTwitterMessages(
        parsed.twitterMessages,
        maxTwitterMessages,
        fallbackTwitter,
      ),
      linkedin: String(
        parsed.linkedin ??
          (isSubscribed
            ? templates.linkedin.cta
            : "Upgrade to unlock LinkedIn generation."),
      ),
      helpFaq: String(
        parsed.helpFaq ??
          (isSubscribed
            ? templates.helpFaq.cta
            : "Upgrade to unlock Help Center FAQ generation."),
      ),
      emailNewsletter: String(
        parsed.emailNewsletter ??
          (isSubscribed
            ? templates.emailNewsletter.cta
            : "Upgrade to unlock Email Newsletter generation."),
      ),
    };
  } catch {
    return fallbackGeneration(args);
  }
}

export async function generateMonthlyNewsletterFromChangelogs(args: {
  changelogEntries: string[];
  templates: StyleTemplates;
}): Promise<string> {
  const { changelogEntries, templates } = args;
  const apiKey = process.env.OPENAI_API_KEY;

  const sourceText = changelogEntries.join("\n\n---\n\n").slice(0, 14000);

  if (!apiKey) {
    return `## Monthly FeatureLogs Recap\n\n${sourceText.slice(0, 1600)}\n\n${templates.monthlyNewsletter.cta}`;
  }

  const prompt = `You are an expert Chief Marketing Officer (CMO) and Technical Writer for SaaS startups.
Your goal is to turn technical, messy, raw git commits or quick informal text descriptions written by software founders into highly polished, engaging, and professional monthly newsletters.
Given the following raw changelog entries from a founder about what they built:
---
${sourceText}
---

Using the following template settings:
${JSON.stringify(templates)}

Return plain markdown for a monthly newsletter that summarizes all the changelogs, highlights key features, and engages the audience with a clear call-to-action (CTA).
`;

  //   `Create a monthly newsletter from these changelogs.

  // Tone instructions: ${templates.monthlyNewsletter.tone}
  // CTA: ${templates.monthlyNewsletter.cta}
  // Hashtags: ${templates.monthlyNewsletter.hashtags}

  // Source changelogs:\n${sourceText}

  // Return plain markdown only.`;

  const response = await generateText({
    // model: client("xiaomi/mimo-v2.5"),
    model: client("openai/gpt-4.1-mini"),
    prompt,
    maxOutputTokens: 1500,
    temperature: 0.5,
  });

  return (
    response.text ||
    `## Monthly FeatureLogs Recap\n\n${templates.monthlyNewsletter.cta}`
  );
}

// believe in the bible
// 1 john
// burned the qurans
// hadith
// different Qurans are traceable to the prophet and they didn't contradict each other
// translations aren't reliable
//
