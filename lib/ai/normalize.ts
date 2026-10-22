import { AiError, type AiUsage, type GenerationResult } from "./types";

export function normalizeUsage(input?: number, output?: number): AiUsage {
  const count = (value: number | undefined) =>
    typeof value === "number" && Number.isFinite(value) && value >= 0
      ? Math.floor(value)
      : null;
  return { inputTokens: count(input), outputTokens: count(output) };
}

export function normalizeText(value: unknown): string {
  if (typeof value !== "string" || !value.trim())
    throw new AiError(
      "invalid_response",
      "The AI provider returned an empty or invalid response.",
    );
  return value.trim();
}

/** Accept plain or Markdown-fenced JSON, then validate every required field. */
export function normalizeKitResponse(text: string): GenerationResult {
  let value: unknown;
  try {
    const normalized = normalizeText(text)
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "");
    try {
      value = JSON.parse(normalized);
    } catch {
      const start = normalized.indexOf("{");
      const end = normalized.lastIndexOf("}");
      if (start < 0 || end <= start) throw new Error("missing JSON object");
      value = JSON.parse(normalized.slice(start, end + 1));
    }
  } catch {
    throw new AiError(
      "invalid_response",
      "The AI provider did not return valid update JSON.",
    );
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new AiError(
      "invalid_response",
      "The AI provider returned an invalid update kit.",
    );
  const kit = value as Record<string, unknown>;
  if (
    !Array.isArray(kit.twitterMessages) ||
    !kit.twitterMessages.length ||
    kit.twitterMessages.some((item) => typeof item !== "string" || !item.trim())
  ) {
    throw new AiError(
      "invalid_response",
      "The AI provider returned an invalid X thread.",
    );
  }
  return {
    changelog: normalizeText(kit.changelog),
    twitterMessages: kit.twitterMessages.map(normalizeText),
    linkedin: normalizeText(kit.linkedin),
    helpFaq: normalizeText(kit.helpFaq),
    emailNewsletter: normalizeText(kit.emailNewsletter),
  };
}
