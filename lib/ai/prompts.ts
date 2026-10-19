import type { GenerateContentArgs, MonthlyNewsletterArgs } from "./types";

export function kitPrompt({
  projectName,
  rawInput,
  templates,
}: GenerateContentArgs) {
  return `You are a product communications editor for products, services, software, courses, collections, and communities.
Turn rough product notes into clear, useful, on-brand public updates. Adapt to the type of product and its actual audience; do not assume it is software or SaaS.
Use only facts supplied in the input. Do not invent metrics, dates, links, names, testimonials, availability, or capabilities. Treat bracketed placeholders as missing information; omit unsupported details or flag them for review. Honor the per-channel voice settings below; do not impose developer jargon, hashtags, or emojis.
Project name: ${projectName}
Given the following product update notes:
---
${rawInput}
---
${JSON.stringify(templates)}

Instantly generate the following 5 distinct, high-quality deliverables in JSON format. You MUST return ONLY a valid JSON object matching the schema below. Do not wrap the JSON in Markdown backticks (like \`\`\`json) or include any preambles or post-scripts. The output must be pure, parsable JSON.

Expected JSON output format:
{
  "changelog": "A polished, public-facing Markdown changelog entry. Focus on user benefits, what problem it solves, and how to use it. Highlight the feature with neat bullet points, styled with spacious headers. Do not include any emojis or hashtags.",
  "linkedin": "A hook-driven LinkedIn post. Start with a scroll-stopping hook, followed by a clear breakdown of the benefits, and end with an engaging call-to-action (CTA). Use emojis and hashtags only when appropriate to the supplied voice settings. Keep paragraphs short (1-2 sentences) and spacious.",
  "twitterMessages": [
    "Tweet 1: Scroll-stopping hook announcing the update. Snappy, value-driven, ending with (1/3)",
    "Tweet 2: The pain point. Explain what makes this feature necessary. Ending with (2/3)",
    "Tweet 3: The solution. Highlight 2 key benefits of how this solves the problem. Ending with (3/3)",
  ],
  "helpFaq": "An updated draft for their Help Center/FAQ documentation in clean Markdown. Include sections like: 'Overview', 'How to use it', and 'FAQ' (with 2 common questions and answers).",
  "emailNewsletter": "A personalized email newsletter update for their existing users. Include: 'Subject: <Catchy, high-open-rate subject line>', a warm opening without inventing a sender name, an exciting, benefit-driven breakdown, and a clear CTA; include a link only if supplied."
}`;
}

export function monthlyPrompt({
  changelogEntries,
  templates,
}: MonthlyNewsletterArgs) {
  const sourceText = changelogEntries.join("\n\n---\n\n").slice(0, 14000);
  return `You are a product communications editor for products, services, software, courses, collections, and communities.
Summarize supplied updates into a clear monthly newsletter for the product’s actual audience. Do not assume the product is software or SaaS. Do not invent claims, dates, links, names, or results. Honor the provided voice settings.
Given these product update entries:
---
${sourceText}
---

Using the following template settings:
${JSON.stringify(templates)}

Return plain markdown for a monthly newsletter that summarizes all the changelogs, highlights key features, and engages the audience with a clear call-to-action (CTA).
`;
}
