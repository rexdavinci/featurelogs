# FeatureLogs

FeatureLogs is a build-in-public micro SaaS for founders.

It turns raw product updates into:
- Public changelog markdown
- X thread drafts
- LinkedIn post drafts (premium-only output visibility)

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- Supabase Auth + PostgreSQL + RLS
- Stripe Pricing Table + Webhook sync
- OpenAI generation (with fallback mode when API key is missing)

## Environment Variables

Copy `.env.example` to `.env.local` and fill values:

```bash
cp .env.example .env.local
```

Recommended SEO variables:

- `NEXT_PUBLIC_SITE_URL=https://your-domain.com`
- `GOOGLE_SITE_VERIFICATION=your-google-verification-token`

## SQL Setup

Run SQL files in the `sql` folder in ascending order.

Each file contains exactly one SQL command.

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

## Google Search Console Setup

1. Deploy with `NEXT_PUBLIC_SITE_URL` and `GOOGLE_SITE_VERIFICATION` configured.
2. Open Google Search Console and add your property (domain or URL-prefix).
3. Verify ownership (the app now outputs the Google verification meta tag automatically).
4. Submit this sitemap URL:

```text
https://your-domain.com/sitemap.xml
```

5. Monitor Indexing, Core Web Vitals, and Coverage reports for improvements.

## Tier Logic Implemented

- Free: 1 project, 10/month, 7-day history, LinkedIn blurred
- Premium: 100 projects, 50/24h, full history, LinkedIn unlocked
