import type { StyleTemplates } from "@/lib/types";

export type AiProvider = "openrouter" | "openai" | "gemini" | "mock";
export type AiRequest = { prompt: string; format: "json" | "text" } & (
  | { task: "kit"; input: GenerateContentArgs }
  | { task: "monthly"; input: MonthlyNewsletterArgs }
);
export type AiUsage = {
  inputTokens: number | null;
  outputTokens: number | null;
};
export type AiTextResponse = {
  text: string;
  provider: AiProvider;
  model: string;
  usage: AiUsage;
};

/** Provider SDK payloads stop here; workflows consume only this contract. */
export interface AiAdapter {
  generate(request: AiRequest): Promise<AiTextResponse>;
}
export type AiResult<T> = Omit<AiTextResponse, "text"> & { data: T };
export type GenerationResult = {
  changelog: string;
  twitterMessages: string[];
  linkedin: string;
  helpFaq: string;
  emailNewsletter: string;
};
export type GenerateContentArgs = {
  projectName: string;
  rawInput: string;
  templates: StyleTemplates;
};
export type MonthlyNewsletterArgs = {
  changelogEntries: string[];
  templates: StyleTemplates;
};

export class AiError extends Error {
  constructor(
    public readonly code:
      | "configuration"
      | "provider_error"
      | "invalid_response",
    message: string,
  ) {
    super(message);
    this.name = "AiError";
  }
}
