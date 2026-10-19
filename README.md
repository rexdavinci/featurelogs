# FeatureLogs

**Make every update worth sharing.** An open-source product communication studio for apps, collections, courses, services, and communities.

Turn rough product notes into changelogs, X threads, LinkedIn posts, FAQs, and newsletters. Keep your voice consistent per project, revisit saved kits, and prepare monthly recaps. Review drafts before sharing them.

## Run locally

Use Node.js 20.9+ and npm.

```sh
npm ci
cp .env.example .env.local
# Fill DATABASE_ADMIN_URL with the owner connection for initial setup.
npm run db:migrate
npm run db:secure
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
| Email | `EMAIL_PROVIDER` | `none`, `resend`, `postmark`, `smtp`       |

**Resend is the default email adapter.** Set `RESEND_API_KEY`, `EMAIL_FROM` (a sender on a verified Resend domain), and `SITE_URL` (the public app origin). Other email selections are placeholders and fail explicitly until implemented. Never use a public environment variable for the API key.

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

- `DB_PROVIDER=neon`: migrate with `DATABASE_ADMIN_URL`, then run `npm run db:secure` to provision a restricted runtime connection in `.env.local`. Restart the app.
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

### Password recovery

Registration requires matching password confirmation. All password fields have show/hide controls.
The login screen includes **Forgot password?**; the link opens `/reset-password` to choose and confirm a new password.

Run `npm run db:migrate` before deploying to create `auth_password_resets`. Links expire after 15 minutes,
are stored only as SHA-256 hashes, and are consumed atomically with the password update and session revocation.
Only one link per email is active; requests have a persistent one-minute cooldown. Configure Upstash for an
additional shared IP limit (5 requests per 15 minutes); without Upstash, the database email cooldown still applies.
Request responses do not reveal whether an account exists. Delivery/configuration failures are logged generically on the server.
Reset tokens travel in a URL fragment, keeping them out of HTTP access logs and referrers. Keep the reset page open until completion.

The current `neon` auth adapter uses app-managed password/session tables in Neon Postgres. It is **not**
Neon's managed Better Auth service. The server-action reset flow preserves existing accounts; switching to
managed Better Auth would require a separate migration. Resend setup requires both an API key and a verified sender.

### Account data and row-level security

Signed-in users can open **Settings** to download all their stored data as JSON, then choose whether
to delete their account. Deletion requires the current password and typing `DELETE`. Both operations
currently require Neon storage **and** Neon auth; mixed/Firebase deployments show an explicit limitation
instead of performing a partial wipe. Exports omit password hashes and session/reset token hashes.

RLS is enabled and forced on all eight application tables. Runtime connections must be a non-owner,
non-superuser role without BYPASSRLS or CREATEROLE. Each query runs inside a transaction with a fixed
role and transaction-local user context derived from the server-verified session. Auth operations use
a separate auth-only role. Public ranking uses a fixed aggregate function; raw private drafts stay protected.
The runtime still trusts the server and its secret connection string. This does not expose Postgres directly to browsers
or configure a client-facing Neon Data API/JWT authorization system.

For existing installations:

1. Keep the current owner URL as `DATABASE_ADMIN_URL` in your migration environment.
2. Run `npm run db:migrate`, then `npm run db:secure` locally. The provisioning script writes a restricted
   `DATABASE_URL` into your ignored `.env.local` and generates a new runtime password. Running it again rotates that password.
3. Deploy the restricted `DATABASE_URL` to the app. Keep `DATABASE_ADMIN_URL` out of the runtime deployment.
4. Restart all app instances. Never run the app using an owner connection; the client refuses it.

Use migrations for schema changes. `db:push` is disabled because schema introspection does not preserve
this custom SQL security migration. Apply migrations before deploying the new app code. Security policies and
new auth foreign keys do not delete existing data; legacy orphan rows are preserved with `NOT VALID` constraints.

Account deletion removes the user's live profile, projects, logs, templates, usage history, password-reset records,
sessions, and auth account in one transaction. All workspace writes serialize against deletion; removed accounts
cannot recreate data through an in-flight generation request. Password checks have a persistent five-attempt
limit per 15 minutes, with optional Upstash rate limits too. Deletion does not purge deployment backups or
records independently retained by email/AI providers; deployment owners must define those retention policies.
