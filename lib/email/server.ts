import "server-only";
import { Resend } from "resend";
import { env } from "@/.env";
import type { EmailAdapter } from "./types";

export function createEmailAdapter(config = env.email): EmailAdapter {
  if (config.provider !== "resend")
    throw new Error(
      "Email sending requires EMAIL_PROVIDER=resend. Other providers are not implemented.",
    );
  if (!config.apiKey || !config.from)
    throw new Error(
      "RESEND_API_KEY and EMAIL_FROM are required for email sending.",
    );
  const resend = new Resend(config.apiKey);
  return {
    async send(message) {
      try {
        const { data, error } = await resend.emails.send(
          {
            from: config.from!,
            ...message,
          },
          { signal: AbortSignal.timeout(15_000) },
        );
        if (error || !data?.id) throw new Error("Email delivery failed.");
        return { id: data.id };
      } catch {
        // Never propagate SDK errors that could include recipient or request data.
        throw new Error("Email delivery failed.");
      }
    },
  };
}

let adapter: EmailAdapter | undefined;
export function getEmailAdapter() {
  return (adapter ??= createEmailAdapter());
}
