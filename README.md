# FeatureLogs

FeatureLogs is an open-source release workspace for founders and product teams.

It turns raw product updates into:
- Public changelog markdown
- X thread drafts
- LinkedIn post drafts
- Help Center FAQ entries
- Email newsletter drafts
- Monthly recap copy

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- Google Firestore for workspace storage
- Upstash Redis for abuse prevention
- OpenAI generation (with fallback mode when API key is missing)

## Environment Variables

Copy `.env.example` to `.env.local` and fill values:

```bash
cp .env.example .env.local
```

Recommended SEO variables:

- `NEXT_PUBLIC_SITE_URL=https://your-domain.com`
- `GOOGLE_SITE_VERIFICATION=your-google-verification-token`

Required backend variables:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` (path to your local service account JSON, for example `./firebase-service-account.json`)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `OPENAI_API_KEY`
- `OPENROUTER_API_KEY` (when using OpenRouter provider)

Required client Firebase variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Production Check

```bash
npm run build
```

## Firebase and Redis Setup

1. Create a Google Cloud project with Firestore enabled.
2. Provide a service account via `FIREBASE_SERVICE_ACCOUNT_KEY` or the individual Firestore env vars.
3. Create an Upstash Redis database and add the REST URL and token.
4. Set `OPENAI_API_KEY` and optionally `OPENROUTER_API_KEY`.
5. Deploy with `NEXT_PUBLIC_SITE_URL` and `GOOGLE_SITE_VERIFICATION` configured.
6. Submit this sitemap URL:

```text
https://your-domain.com/sitemap.xml
```

7. Monitor Indexing, Core Web Vitals, and Coverage reports for improvements.

## Security Checklist (Before Push)

- Never commit `.env.local` or service-account JSON files.
- Keep `.env.example` as placeholders only.
- Rotate any key immediately if it was ever exposed in logs, screenshots, or commits.
- Verify Firebase rules and indexes are deployed:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

- Verify production build locally:

```bash
npm run lint
npm run build
```

## Contributing

- Use feature branches and open PRs with a short test plan.
- Keep secrets out of commits and issue threads.
- Prefer focused changes that avoid unrelated refactors.

## Fair Use

The app enforces fair-use rate limits in Redis. See [Terms of Service](app/terms/page.tsx) for the policy text.
