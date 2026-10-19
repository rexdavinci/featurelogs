import "server-only";
import { env } from "@/.env";
import type { AppEnv } from "@/lib/config/env";
import { AiError, type AiAdapter } from "./types";

export async function createAiAdapter(
  config: AppEnv["ai"],
): Promise<AiAdapter> {
  const { provider, apiKey, model } = config;
  if (provider === "mock") {
    const { createMockAdapter } = await import("./adapters/mock");
    return createMockAdapter();
  }
  if (!apiKey)
    throw new AiError(
      "configuration",
      `The ${provider} AI provider requires its API key. Check .env.example.`,
    );
  switch (provider) {
    case "openrouter":
      return (await import("./adapters/openrouter")).createOpenRouterAdapter(
        apiKey,
        model,
      );
    case "openai":
      return (await import("./adapters/openai")).createOpenAIAdapter(
        apiKey,
        model,
      );
    case "gemini":
      return (await import("./adapters/gemini")).createGeminiAdapter(
        apiKey,
        model,
      );
  }
}

let adapter: Promise<AiAdapter> | undefined;
export function getAiAdapter() {
  return (adapter ??= createAiAdapter(env.ai));
}
