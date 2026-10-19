import "server-only";
import { env } from "@/.env";

export function getSiteUrl(): string {
  return env.site.url;
}
