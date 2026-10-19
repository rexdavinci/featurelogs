# FeatureLogs

**Make every update worth sharing.** An open-source product communication studio for apps, collections, courses, services, and communities.

Turn rough product notes into changelogs, X threads, LinkedIn posts, FAQs, and newsletters. Keep your voice consistent per project, revisit saved kits, and prepare monthly recaps. Review drafts before sharing them.

## Run locally

Use Node.js 20.9+ and npm.

```sh
npm ci
cp .env.example .env.local
# Fill DATABASE_URL and provision the tables before creating an account.
npm run db:migrate
npm run dev
```

Open [localhost:3000](http://localhost:3000). The example configuration uses Neon/Postgres storage and password authentication. Supply a Postgres connection string with the schema from `drizzle/`. `AI_PROVIDER=mock` creates deterministic offline drafts without AI credentials. It does not simulate authentication or storage.

## Choose your services

Set environment variables in `.env.local` or your hosting platform. [`.env.ts`](.env.ts) holds a server-only, immutable configuration snapshot in memory; restart the process after changing settings. No settings or keys are saved to the browser. Each server worker has its own snapshot.

| Service          | Setting          | Supported values                           |
| ---------------- | ---------------- | ------------------------------------------ |
| AI               | `AI_PROVIDER`    | `openrouter`, `openai`, `gemini`, `mock`   |
| Model            | `AI_MODEL`       | A model supported by the selected provider |
| Database         | `DB_PROVIDER`    | `neon`, `firestore`                        |
| Authentication   | `AUTH_PROVIDER`  | `neon`, `firebase`                         |
| Email (reserved) | `EMAIL_PROVIDER` | `none`, `resend`, `postmark`, `smtp`       |

**Email sending is not implemented.** Selecting an email provider only reserves configuration for a future transport. It does not send email, create accounts with a provider, or enable email authentication.

Examples:

```dotenv
AI_PROVIDER=openrouter
AI_MODEL=openai/gpt-4.1-mini
OPENROUTER_API_KEY=your-key
```

```dotenv
AI_PROVIDER=openai
AI_MODEL=gpt-4.1-mini
OPENAI_API_KEY=your-key
```

```dotenv
AI_PROVIDER=gemini
AI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=your-key
```

Blank `AI_MODEL` uses the selected provider's default. Models must support the adapter's text/JSON request format. Configured provider errors are reported as failures; they never silently become mock drafts. `mock` is a deliberate offline mode.

For existing installations without `AI_PROVIDER`, the old OpenRouter behavior is retained: `OPENROUTER_API_KEY`, or legacy `OPENAI_API_KEY`, selects OpenRouter; legacy `OPENAI_MODEL` remains recognized. With neither key, the default is `mock`. **Migrate to explicit provider selection and its matching key.** Explicit OpenRouter selection never uses an OpenAI key.

### Storage and authentication

- `DB_PROVIDER=neon`: set `DATABASE_URL` and run `npm run db:migrate`.
- `DB_PROVIDER=firestore`: set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_SERVICE_KEY`. Escaped `\n` characters in the private key are normalized. The old `NEXT_PUBLIC_FIREBASE_PROJECT_ID` name remains an alias.
- `AUTH_PROVIDER=neon`: app-managed password accounts and sessions stored in Postgres; this requires `DATABASE_URL` even with Firestore storage. This adapter is not the hosted Neon Auth product.
- `AUTH_PROVIDER=firebase`: verifies existing Firebase ID tokens or session cookies. Password signup/login and session creation are not implemented by this adapter.

Only the selected database/auth implementations load. A Neon-only installation needs no Firebase credentials. Choosing a provider does not migrate existing users or data. If selectors are omitted, legacy defaults remain `firestore` storage and `neon` auth.

### Other settings

- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`: shared rate limits. Existing behavior allows requests when unconfigured or unavailable; account usage credits are tracked separately.
- `SITE_URL`: canonical origin for metadata and the sitemap. `NEXT_PUBLIC_SITE_URL` (legacy, higher precedence) and `VERCEL_PROJECT_PRODUCTION_URL` are also accepted.
- `GOOGLE_SITE_VERIFICATION`: optional ownership verification.

## Architecture and contributing

Provider SDKs live in `lib/ai/adapters/`. Workflows, prompts, and response validation live outside those adapters. Both AI workflows return the same envelope:

```ts
{
  data: /* GenerationResult for kits, string for monthly recaps */,
  provider: "openai", // or openrouter, gemini, mock
  model: "gpt-4.1-mini",
  usage: { inputTokens: 100, outputTokens: 200 } // null when unknown
}
```

See [architecture and extension points](docs/architecture.md), the [0.2.2 release notes](CHANGELOG.md), and [launch suggestions](docs/launch.md).

```sh
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Tests mock provider HTTP responses; they do not call paid AI services or your database. `npm test` uses the `react-server` condition so Node can import server-only modules safely during tests. Keep provider-specific response shapes out of workflows and UI components. Include contract tests when adding a provider.

Generate schema migrations with `npm run db:generate`; apply them with `npm run db:migrate`. Next.js loads runtime `.env` values; the Drizzle CLI separately loads them with `@next/env` before reading its connection string.

Never commit `.env.local` or service-account credentials. For vulnerability reporting, see [SECURITY.md](SECURITY.md).
