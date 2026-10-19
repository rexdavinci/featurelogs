# Provider architecture

## Configuration

`lib/config/env.ts` is a pure parser. `.env.ts` reads `process.env` once, validates selectors, freezes the resulting sections, and guards the module with `server-only`. The configuration is cached by the module system for each server process, including each serverless worker. Restart after changing configuration. Do not serialize `env` into a response or import it from a Client Component.

Provider-specific credentials are checked when that provider is used. This allows public pages and Neon-only deployments to load without Firebase initialization. Unknown selector values fail with a useful error that does not echo the configured value. CLI/framework settings such as Drizzle's connection and Next's development watcher are read in their standalone tool configuration.

Email selections are reserved metadata. There is no email adapter or sending workflow yet.

## AI request path

```text
Dashboard server action
  -> utils/ai.ts (public entry points)
  -> provider.ts (cached, lazy provider selection)
  -> service.ts (shared workflow)
  -> prompts.ts + AiAdapter.generate(request)
  -> normalize.ts (validate every required field)
  -> AiResult<T> -> existing database/UI fields
```

`AiAdapter.generate()` accepts a task, its structured input, the shared prompt, and a text/JSON output format. Its response has `text`, `provider`, `model`, and `usage`. SDK response structures and token field names are translated inside the adapter.

`createAiService(adapter)` is injectable. It constructs prompts, validates the result, and returns an `AiResult<T>`:

- Kit `data`: `changelog`, `twitterMessages`, `linkedin`, `helpFaq`, `emailNewsletter`.
- Monthly recap `data`: a nonempty Markdown string.
- Metadata: `provider`, `model`, `usage.inputTokens`, `usage.outputTokens`.
- Unknown usage is `null`, not zero.

The JSON normalizer accepts plain JSON or a single Markdown JSON fence. All required kit fields must be nonempty strings. The X thread must be a nonempty array of nonempty strings. Responses are trimmed; objects and numbers are rejected instead of coerced. Every returned post is preserved. The shared prompt currently requests four posts; the normalizer does not impose a four-post limit.

Errors use `AiError` with `configuration`, `provider_error`, or `invalid_response` codes. Provider-specific exceptions are replaced with a safe error; their payloads and credentials are not exposed. Dashboard actions do not consume AI/save credits or persist a kit when generation or validation fails. Existing project creation charges, if applicable, happen before generation.

The mock adapter generates deterministic local drafts. It implements the same response contract and is never used as a silent recovery path for a configured provider.

### Add an AI provider

1. Implement `AiAdapter` in `lib/ai/adapters/<provider>.ts`. Keep client initialization inside its factory and secrets on the server. Map SDK text and token usage to the shared contract; set request timeouts.
2. Add the selector, key, and default model in `lib/config/env.ts`; extend `AiProvider` in `lib/ai/types.ts`.
3. Add a lazy factory branch in `lib/ai/provider.ts`.
4. Add an HTTP-mocked adapter contract test and update `.env.example` and README.

No dashboard or database schema changes are required when the canonical data contract stays the same. A model that cannot satisfy the requested format should fail validation rather than return partial data.

## Database and authentication

Database and auth interfaces are in `lib/db/types.ts` and `lib/auth/types.ts`. Their server entry points cache a promise for the selected implementation and import it on first use. Firestore and Firebase initialization is isolated from Neon.

Adding another implementation requires the interface, a selector, and a factory branch. Existing data and sessions are not migrated by changing a selector. Firebase authentication currently verifies existing tokens/cookies; password-based account creation and sessions remain implemented by the app's Neon/Postgres adapter.

## Verification

`npm test` covers selector validation, immutable/cached configuration, legacy configuration, both workflow result contracts, malformed output, safe failures, token normalization, offline generation, real SDK parsing with mocked HTTP responses, and Neon loading without Firebase credentials. It makes no external service calls. Paid model output quality and real database connectivity still need deployment-specific smoke tests.
