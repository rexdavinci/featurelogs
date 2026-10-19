type Source = Record<string, string | undefined>;

function value(source: Source, name: string) {
  return source[name]?.trim() || undefined;
}

function choice<const T extends string>(
  source: Source,
  name: string,
  choices: readonly T[],
  fallback: T,
): T {
  const selected = value(source, name)?.toLowerCase() ?? fallback;
  if (!choices.includes(selected as T)) {
    throw new Error(`${name} must be one of: ${choices.join(", ")}.`);
  }
  return selected as T;
}

function siteUrl(source: Source) {
  const raw =
    value(source, "NEXT_PUBLIC_SITE_URL") ??
    value(source, "SITE_URL") ??
    value(source, "VERCEL_PROJECT_PRODUCTION_URL") ??
    "http://localhost:3000";
  try {
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) && !/^https?:\/\//i.test(raw))
      throw new Error();
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      throw new Error();
    return url.origin;
  } catch {
    throw new Error(
      "SITE_URL must be a valid HTTP(S) origin without credentials.",
    );
  }
}

/** Pure parser: tests can validate configuration without loading real credentials. */
export function parseEnv(source: Source) {
  const provider = choice(
    source,
    "AI_PROVIDER",
    ["openrouter", "openai", "gemini", "mock"],
    value(source, "OPENROUTER_API_KEY") || value(source, "OPENAI_API_KEY")
      ? "openrouter"
      : "mock",
  );
  // Previous releases used OPENAI_API_KEY for OpenRouter. Keep that path only
  // when AI_PROVIDER is absent; explicit choices always use their own key.
  const legacyOpenRouter =
    provider === "openrouter" && !value(source, "AI_PROVIDER");
  const keys = {
    openrouter:
      value(source, "OPENROUTER_API_KEY") ??
      (legacyOpenRouter ? value(source, "OPENAI_API_KEY") : undefined),
    openai: value(source, "OPENAI_API_KEY"),
    gemini: value(source, "GEMINI_API_KEY"),
    mock: undefined,
  };
  const models = {
    openrouter: "openai/gpt-4.1-mini",
    openai: "gpt-4.1-mini",
    gemini: "gemini-2.5-flash",
    mock: "local-template",
  };
  return Object.freeze({
    ai: Object.freeze({
      provider,
      apiKey: keys[provider],
      model:
        value(source, "AI_MODEL") ??
        (legacyOpenRouter ? value(source, "OPENAI_MODEL") : undefined) ??
        models[provider],
    }),
    database: Object.freeze({
      provider: choice(
        source,
        "DB_PROVIDER",
        ["firestore", "neon"],
        "firestore",
      ),
      url: value(source, "DATABASE_URL"),
    }),
    auth: Object.freeze({
      provider: choice(source, "AUTH_PROVIDER", ["neon", "firebase"], "neon"),
    }),
    // Reserved configuration only. No provider sends email in this release.
    email: Object.freeze({
      provider: choice(
        source,
        "EMAIL_PROVIDER",
        ["none", "resend", "postmark", "smtp"],
        "none",
      ),
      from: value(source, "EMAIL_FROM"),
      implemented: false as const,
    }),
    firebase: Object.freeze({
      projectId:
        value(source, "FIREBASE_PROJECT_ID") ??
        value(source, "NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
      privateKey: value(source, "FIREBASE_SERVICE_KEY")?.replace(/\\n/g, "\n"),
      clientEmail: value(source, "FIREBASE_CLIENT_EMAIL"),
    }),
    rateLimit: Object.freeze({
      url: value(source, "UPSTASH_REDIS_REST_URL"),
      token: value(source, "UPSTASH_REDIS_REST_TOKEN"),
    }),
    site: Object.freeze({
      url: siteUrl(source),
      googleVerification: value(source, "GOOGLE_SITE_VERIFICATION"),
    }),
    production: source.NODE_ENV === "production",
  });
}

export type AppEnv = ReturnType<typeof parseEnv>;
