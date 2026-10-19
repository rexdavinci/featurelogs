import "server-only";
import { getAiAdapter } from "@/lib/ai/provider";
import { createAiService } from "@/lib/ai/service";
import type {
  GenerateContentArgs,
  MonthlyNewsletterArgs,
} from "@/lib/ai/types";

/** Public workflow entry points. Provider selection lives outside the workflows. */
export async function generateContent(args: GenerateContentArgs) {
  return createAiService(await getAiAdapter()).generateContent(args);
}

export async function generateMonthlyNewsletterFromChangelogs(
  args: MonthlyNewsletterArgs,
) {
  return createAiService(await getAiAdapter()).generateMonthlyNewsletter(args);
}
