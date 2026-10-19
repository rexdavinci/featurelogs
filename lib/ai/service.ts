import {
  AiError,
  type AiAdapter,
  type AiRequest,
  type AiResult,
  type GenerateContentArgs,
  type GenerationResult,
  type MonthlyNewsletterArgs,
} from "./types";
import {
  normalizeKitResponse,
  normalizeText,
  normalizeUsage,
} from "./normalize";
import { kitPrompt, monthlyPrompt } from "./prompts";

/** Injectable workflow layer: prompts and response validation never depend on an SDK. */
export function createAiService(adapter: AiAdapter) {
  async function generate<T>(
    request: AiRequest,
    normalize: (text: string) => T,
  ): Promise<AiResult<T>> {
    try {
      const response = await adapter.generate(request);
      return {
        data: normalize(response.text),
        provider: response.provider,
        model: normalizeText(response.model),
        usage: normalizeUsage(
          response.usage.inputTokens ?? undefined,
          response.usage.outputTokens ?? undefined,
        ),
      };
    } catch (error) {
      if (error instanceof AiError) throw error;
      // Do not send raw provider errors, prompts, credentials, or SDK payloads to clients.
      throw new AiError(
        "provider_error",
        "The AI provider is unavailable. Please try again.",
      );
    }
  }
  return {
    generateContent(
      input: GenerateContentArgs,
    ): Promise<AiResult<GenerationResult>> {
      return generate(
        { task: "kit", input, format: "json", prompt: kitPrompt(input) },
        normalizeKitResponse,
      );
    },
    generateMonthlyNewsletter(
      input: MonthlyNewsletterArgs,
    ): Promise<AiResult<string>> {
      return generate(
        {
          task: "monthly",
          input,
          format: "text",
          prompt: monthlyPrompt(input),
        },
        normalizeText,
      );
    },
  };
}
