import "server-only";
import { GoogleGenAI } from "@google/genai";
import { normalizeUsage } from "../normalize";
import type { AiAdapter } from "../types";

export function createGeminiAdapter(apiKey: string, model: string): AiAdapter {
  const client = new GoogleGenAI({ apiKey, httpOptions: { timeout: 60_000 } });
  return {
    async generate({ prompt, format }) {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          maxOutputTokens: 2400,
          temperature: 0.5,
          ...(format === "json"
            ? { responseMimeType: "application/json" }
            : {}),
        },
      });
      return {
        text: response.text ?? "",
        provider: "gemini",
        model,
        usage: normalizeUsage(
          response.usageMetadata?.promptTokenCount,
          response.usageMetadata?.candidatesTokenCount,
        ),
      };
    },
  };
}
