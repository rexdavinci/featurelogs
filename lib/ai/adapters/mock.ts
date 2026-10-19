import type { AiAdapter, GenerationResult } from "../types";

/** Offline, deterministic drafts for development. Never used to hide provider failures. */
export function createMockAdapter(): AiAdapter {
  return {
    async generate(request) {
      let text: string;
      if (request.task === "kit") {
        const { projectName, rawInput, templates } = request.input;
        const result: GenerationResult = {
          changelog: `## ${projectName} Update\n\n${rawInput}`,
          twitterMessages: [
            `What’s new with ${projectName}:\n\n${rawInput.slice(0, 180)}\n\n${templates.twitter.hashtags}`,
          ],
          linkedin: `Here’s what’s new with ${projectName}.\n\n${rawInput}\n\n${templates.linkedin.cta}`,
          helpFaq: `## ${projectName}: What changed?\n\n${rawInput}\n\n${templates.helpFaq.cta}`,
          emailNewsletter: `Subject: ${projectName} update\n\n${rawInput}\n\n${templates.emailNewsletter.cta}`,
        };
        text = JSON.stringify(result);
      } else {
        text = `## Monthly product recap\n\n${request.input.changelogEntries.join("\n\n").slice(0, 1600)}\n\n${request.input.templates.monthlyRecap.cta}`;
      }
      return {
        text,
        provider: "mock",
        model: "local-template",
        usage: { inputTokens: null, outputTokens: null },
      };
    },
  };
}
