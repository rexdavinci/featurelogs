# Changelog

## 0.2.2 — 2026-10-19

FeatureLogs is easier to configure, extend, and self-host.

- Added interchangeable AI adapters for OpenAI, OpenRouter, Gemini, and offline development drafts.
- Standardized update-kit and monthly-recap responses, including provider, model, and token-usage metadata.
- Added strict response validation so malformed or incomplete AI output is rejected before saving; all generated X posts are preserved.
- Introduced a server-only `.env.ts` configuration snapshot with validated provider selections, explicit credentials, and documented legacy compatibility.
- Isolated database and auth initialization so Neon deployments no longer need Firebase credentials.
- Reserved email-provider configuration for a future release; email sending is not implemented yet.
- Added provider contract tests, clearer setup instructions, and contributor documentation.

Existing provider configurations have a documented compatibility path. Restart the app after changing environment settings. Changing storage or auth selectors does not migrate existing data or accounts.
