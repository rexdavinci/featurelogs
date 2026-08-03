import Link from "next/link";
import * as Accordion from "@radix-ui/react-accordion";
import type { Metadata } from "next";
import { ChevronDown, CircleHelp, ShieldCheck } from "lucide-react";
import { Header } from "../components/Header";

const FAQ_ITEMS = [
  {
    id: "item-1",
    question: "How does FeatureLogs generate content from raw notes?",
    answer:
      "Paste your release notes, commits, or rough update text in the generator panel. FeatureLogs analyzes the input and produces a changelog, X thread, LinkedIn draft, Help Center FAQ, and newsletter outputs.",
  },
  {
    id: "item-2",
    question: "Do I need to onboard a project first?",
    answer:
      "Yes. Every generation is tied to an onboarded project. Use the project setup card on the dashboard, then select that project from the Project Name dropdown in the generator.",
  },
  {
    id: "item-3",
    question: "What are the fair-use limits?",
    answer:
      "The app is rate-limited to 50 generations in 24 hours and 100 projects per visitor session to keep the shared service usable.",
  },
  {
    id: "item-4",
    question: "Which outputs are available?",
    answer:
      "All output types are available: changelog, X thread, LinkedIn post, FAQ, email newsletter, and monthly recap.",
  },
  {
    id: "item-5",
    question: "Can I customize the writing voice?",
    answer:
      "Yes. Save Tone & Style templates per project to shape tone, CTA style, and hashtags across future generations.",
  },
  {
    id: "item-6",
    question: "How is data stored?",
    answer:
      "Projects, drafts, and templates are stored in Firestore under your session cookie. There is no Supabase layer in this version.",
  },
];

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about FeatureLogs fair use, generation limits, onboarding, and style templates.",
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
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-28 top-20 h-64 w-64 rounded-full bg-(--accent)/10 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-(--accent-strong)/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl space-y-5">
        <Header />

        <section className="glass rounded-2xl border p-6 shadow-[0_18px_60px_rgba(44,30,11,0.2)] sm:p-8">
          <p className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em] text-(--accent-strong)">
            <CircleHelp className="h-3.5 w-3.5" />
            Help Center
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-foreground">Frequently Asked Questions</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-700">
            Everything you need to onboard projects, generate consistent updates, and keep the workflow open-source friendly.
          </p>

          <div className="mt-5 rounded-2xl border bg-white/75 p-4">
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5" />
              Quick Tips
            </p>
            <ul className="mt-2 space-y-1 text-sm leading-7 text-zinc-700">
              <li>Create at least one project in Dashboard before generation.</li>
              <li>Use presets to quickly seed high-quality raw notes.</li>
              <li>Read the Terms page for fair-use guidance and rate limits.</li>
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

          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/terms" className="text-(--accent-strong) underline underline-offset-2">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-(--accent-strong) underline underline-offset-2">
              Privacy Policy
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
