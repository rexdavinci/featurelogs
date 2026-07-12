import Link from "next/link";
import Image from "next/image";
import * as Accordion from "@radix-ui/react-accordion";
import type { Metadata } from "next";
import { ChevronDown, CircleHelp, CreditCard, Home, ShieldCheck } from "lucide-react";

const FAQ_ITEMS = [
  {
    id: "item-1",
    question: "How does FeatureLogs generate content from raw notes?",
    answer:
      "Paste your release notes, commits, or rough update text in the generator panel. FeatureLogs analyzes the input and produces a changelog, X thread, LinkedIn draft, Help Center FAQ, and optional newsletter outputs depending on your plan.",
  },
  {
    id: "item-2",
    question: "Do I need to onboard a project first?",
    answer:
      "Yes. Every generation is tied to an onboarded project. Use the Project Onboarding form on the dashboard sidebar, then select that project from the Project Name dropdown in the generator.",
  },
  {
    id: "item-3",
    question: "What are the free tier limits?",
    answer:
      "Free tier supports 1 project and 10 generations per month. Premium supports up to 100 projects and 50 generations per 24-hour period.",
  },
  {
    id: "item-4",
    question: "Which channels are premium-only?",
    answer:
      "LinkedIn post, Email newsletter, and Monthly newsletter flows are premium. Free users can still generate core changelog and limited social output.",
  },
  {
    id: "item-5",
    question: "Can I customize the writing voice?",
    answer:
      "Yes. Premium users can configure Tone & Style templates for tone, CTA style, and hashtags, and save them to reuse across future generations.",
  },
  {
    id: "item-6",
    question: "How is data stored?",
    answer:
      "Generated outputs and source notes are stored in your authenticated workspace so your team can track history and repurpose content later. Access is protected with row-level security.",
  },
];

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about FeatureLogs pricing, generation limits, onboarding, premium channels, and style templates.",
  alternates: {
    canonical: "/faq",
  },
};

export default function FAQPage() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
    url: `${siteUrl}/faq`,
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-8 sm:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-28 top-20 h-64 w-64 rounded-full bg-(--accent)/10 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-(--accent-strong)/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl">
        <header className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/feature-logs.svg" alt="FeatureLogs Logo" width={30} height={30} />
            <div>
              <p className="text-lg font-semibold">FeatureLogs</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Build In Public Engine
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 rounded-full border bg-white/80 px-3 py-1 text-xs font-semibold text-zinc-700 hover:bg-white"
            >
              <Home className="h-3.5 w-3.5" />
              Dashboard
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 rounded-full border bg-white/80 px-3 py-1 text-xs font-semibold text-zinc-700 hover:bg-white"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Pricing
            </Link>
          </div>
        </header>

        <section className="glass rounded-2xl border p-6 shadow-[0_18px_60px_rgba(44,30,11,0.2)] sm:p-8">
          <p className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em] text-(--accent-strong)">
            <CircleHelp className="h-3.5 w-3.5" />
            Help Center
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-foreground">Frequently Asked Questions</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-700">
            Everything you need to onboard projects, generate consistent updates, and scale your build-in-public workflow.
          </p>

          <div className="mt-5 rounded-2xl border bg-white/75 p-4">
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5" />
              Quick Tips
            </p>
            <ul className="mt-2 space-y-1 text-sm leading-7 text-zinc-700">
              <li>Onboard at least one project in Dashboard before generation.</li>
              <li>Use presets to quickly seed high-quality raw notes.</li>
              <li>Upgrade on Pricing for premium channels and higher limits.</li>
            </ul>
          </div>

          <Accordion.Root type="single" collapsible className="mt-6 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <Accordion.Item key={item.id} value={item.id} className="overflow-hidden rounded-xl border bg-white/80">
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-zinc-800">
                    <span>{item.question}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="px-4 pb-4 text-sm leading-7 text-zinc-700">
                  {item.answer}
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>

          <div className="mt-6 rounded-2xl border bg-white/75 p-4">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
              Related Use Cases
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Link
                href="/use-cases/ai-changelog-generator"
                className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                AI Changelog Generator
              </Link>
              <Link
                href="/use-cases/release-notes-generator-for-startups"
                className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Release Notes Generator for Startups
              </Link>
              <Link
                href="/use-cases/social-content-from-git-commits"
                className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Social Content from Git Commits
              </Link>
              <Link
                href="/use-cases"
                className="rounded-xl border bg-white px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Browse All Use Cases
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
