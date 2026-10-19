import "server-only";
import { parseEnv } from "./lib/config/env";

/** Immutable snapshot cached by the module system, once per server process.
 * Next.js loads .env.local first. Restart the app after changing configuration.
 * Never import this module from a Client Component or serialize it to the UI.
 */
export const env = parseEnv(process.env);
