import { env } from "@/.env";
import Link from "next/link";
import * as Accordion from "@radix-ui/react-accordion";
import type { Metadata } from "next";
import { ChevronDown, CircleHelp, ShieldCheck } from "lucide-react";
import { Header } from "../components/Header";

const FAQ_ITEMS = [
  {
    id: "product-types",
    question: "Is FeatureLogs only for software products?",
    answer:
      "No. Use it for apps, physical products, courses, services, and communities. Describe what changed, who it helps, and what people can do next. The starting-point templates help you write the brief.",
  },
  {
    id: "workflow-agents",
    question: "Can I connect workflow agents today?",
    answer:
      "Not yet. Today you bring your notes and review the generated drafts. Connected sources and workflow agents are a direction we are exploring for future releases.",
  },
  {
    id: "item-1",
    question: "How does FeatureLogs generate content from raw notes?",
    answer:
      "Paste notes about a launch, a new collection, a course, or any product improvement in the studio. FeatureLogs analyzes the input and produces a changelog, X thread, LinkedIn draft, Help Center FAQ, and newsletter outputs.",
  },
  {
    id: "item-2",
    question: "Do I need to create a project first?",
    answer:
      "Yes. Create a project in your workspace, then select it when creating a kit. This keeps your drafts and voice settings organized.",
  },
  {
    id: "item-3",
    question: "What are the fair-use limits?",
    answer:
      "Each account has 50 credits per rolling 24 hours. Generating and saving an update kit uses 2 credits; creating a project or saving voice settings uses 1. The account limit is 100 projects.",
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
      "Yes. Save Your voice & style settings per project to shape tone, CTA style, and hashtags across future generations.",
  },
  {
    id: "item-6",
    question: "How is data stored?",
    answer:
      "Your projects, drafts, and voice settings are saved to your account so you can return to them. A secure session cookie keeps you signed in.",
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
  const siteUrl = env.site.url;
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
    <main className="content-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="space-y-8">
        <Header />

        <section className="glass rounded-2xl border p-6 shadow-[0_18px_60px_rgba(44,30,11,0.2)] sm:p-8">
          <p className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.18em] text-(--accent-strong)">
            <CircleHelp className="h-3.5 w-3.5" />
            Help Center
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-(--text-secondary)">
            A few answers to help you go from your first project to your next
            great update.
          </p>

          <div className="mt-5 rounded-2xl border bg-(--surface) p-4">
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-(--text-muted)">
              <ShieldCheck className="h-3.5 w-3.5" />
              Quick Tips
            </p>
            <ul className="mt-2 space-y-1 text-sm leading-7 text-(--text-secondary)">
              <li>Create your first project in the workspace.</li>
              <li>Use presets to quickly seed high-quality raw notes.</li>
              <li>
                Read the Terms page for fair-use guidance and rate limits.
              </li>
            </ul>
          </div>

          <Accordion.Root type="single" collapsible className="mt-6 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <Accordion.Item
                key={item.id}
                value={item.id}
                className="overflow-hidden rounded-xl border bg-(--surface)"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-foreground">
                    <span>{item.question}</span>
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="px-4 pb-4 text-sm leading-7 text-(--text-secondary)">
                  {item.answer}
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>

          <div className="mt-6 rounded-2xl border bg-(--surface) p-4">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-(--text-muted)">
              Related Use Cases
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Link
                href="/use-cases/ai-changelog-generator"
                className="rounded-xl border bg-(--surface) px-3 py-2 text-sm font-semibold text-(--text-secondary) hover:bg-(--surface-muted)"
              >
                AI Changelog Generator
              </Link>
              <Link
                href="/use-cases/release-notes-generator-for-startups"
                className="rounded-xl border bg-(--surface) px-3 py-2 text-sm font-semibold text-(--text-secondary) hover:bg-(--surface-muted)"
              >
                Release Notes Generator for Startups
              </Link>
              <Link
                href="/use-cases/social-content-from-git-commits"
                className="rounded-xl border bg-(--surface) px-3 py-2 text-sm font-semibold text-(--text-secondary) hover:bg-(--surface-muted)"
              >
                Social Content from Git Commits
              </Link>
              <Link
                href="/use-cases"
                className="rounded-xl border bg-(--surface) px-3 py-2 text-sm font-semibold text-(--text-secondary) hover:bg-(--surface-muted)"
              >
                Browse All Use Cases
              </Link>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
            <Link
              href="/terms"
              className="text-(--accent-strong) underline underline-offset-2"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="text-(--accent-strong) underline underline-offset-2"
            >
              Privacy Policy
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
