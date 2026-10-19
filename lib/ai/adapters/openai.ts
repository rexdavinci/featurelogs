import "server-only";
import OpenAI from "openai";
import { normalizeUsage } from "../normalize";
import type { AiAdapter } from "../types";

export function createOpenAIAdapter(apiKey: string, model: string): AiAdapter {
  const client = new OpenAI({ apiKey, timeout: 60_000, maxRetries: 1 });
  return {
    async generate({ prompt, format }) {
      const response = await client.chat.completions.create({
        model,
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 2400,
        ...(format === "json"
          ? { response_format: { type: "json_object" as const } }
          : {}),
      });
      return {
        text: response.choices[0]?.message.content ?? "",
        provider: "openai",
        model,
        usage: normalizeUsage(
          response.usage?.prompt_tokens,
          response.usage?.completion_tokens,
        ),
      };
    },
  };
}
