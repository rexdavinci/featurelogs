import "server-only";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { normalizeUsage } from "../normalize";
import type { AiAdapter } from "../types";

export function createOpenRouterAdapter(
  apiKey: string,
  model: string,
): AiAdapter {
  const client = createOpenRouter({
    apiKey,
    appUrl: "https://featurelogs.com",
    appName: "FeatureLogs",
  });
  return {
    async generate({ prompt }) {
      const response = await generateText({
        model: client(model),
        prompt,
        maxOutputTokens: 2400,
        temperature: 0.5,
        abortSignal: AbortSignal.timeout(60_000),
      });
      return {
        text: response.text,
        provider: "openrouter",
        model,
        usage: normalizeUsage(
          response.usage.inputTokens,
          response.usage.outputTokens,
        ),
      };
    },
  };
}
