import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Bolt,
  CalendarClock,
  Megaphone,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Header } from "./components/Header";
import { AuthCard } from "./components/AuthCard";
import { RoadmapBoard } from "./components/RoadmapBoard";
import { getSiteUrl } from "@/utils/seo";
import { getSessionUser } from "@/utils/session";

export const metadata: Metadata = {
  title: "FeatureLogs",
  description:
    "Open-source release note and social content generator with Neon-ready storage and fair-use rate limits.",
  alternates: {
    canonical: "/",
  },
};

const OPEN_SOURCE_VALUES = [
  {
    title: "Practical over hype",
    body: "Shippable tools for teams posting real updates, not vanity metrics.",
    icon: BadgeCheck,
  },
  {
    title: "Community roadmap",
    body: "Feature priorities evolve through issues and contributor feedback.",
    icon: Megaphone,
  },
  {
    title: "Built to iterate",
    body: "Adapter-driven architecture to swap infra without rewriting product logic.",
    icon: Bolt,
  },
];

const FLOW_STEPS = [
  {
    title: "Capture your progress",
    body: "Paste rough release notes, commits, or bullet points right after shipping.",
  },
  {
    title: "Generate multi-channel updates",
    body: "Create changelog, social, FAQ, and newsletter drafts in one run.",
  },
  {
    title: "Publish consistently",
    body: "Keep your audience in sync and maintain your build-in-public momentum.",
  },
];

export default async function Home() {
  const siteUrl = getSiteUrl();
  const user = await getSessionUser();

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FeatureLogs",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: siteUrl,
    description:
      "Turn rough product updates into polished changelogs, social posts, and help docs.",
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 sm:py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-28 top-16 h-72 w-72 rounded-full bg-(--accent)/10 blur-3xl" />
        <div className="absolute bottom-8 right-0 h-80 w-80 rounded-full bg-(--accent-strong)/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6">
        <Header userEmail={user?.email} />

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-(--accent-strong)">
              <Sparkles className="h-3.5 w-3.5" />
              Build-in-public command center
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] text-foreground md:text-6xl">
                Turn shipping updates
                <br />
                into a <span className="text-gradient">growth habit.</span>
              </h1>
              <p className="max-w-2xl text-base leading-7 text-zinc-700 md:text-lg">
                FeatureLogs helps builders stay visible after every release with changelog,
                social, and support-ready content — designed for teams building in public.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={user ? "/dashboard" : "#auth-card"}
                className="inline-flex items-center gap-2 rounded-xl bg-(--accent) px-4 py-3 text-sm font-semibold text-white transition hover:bg-(--accent-strong)"
              >
                {user ? "Open Dashboard" : "Start Writing Better Updates"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="https://github.com/rexdavinci/featurelogs/issues"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white/80 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-white"
              >
                Shape the roadmap
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {OPEN_SOURCE_VALUES.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border bg-white/75 p-4 shadow-[0_12px_40px_rgba(57,74,126,0.1)]"
                  >
                    <div className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                      <Icon className="h-3.5 w-3.5 text-(--accent)" />
                      {item.title}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-700">{item.body}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {user ? (
              <article className="glass gradient-card rounded-3xl border p-5 shadow-[0_24px_80px_rgba(44,30,11,0.16)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
                  Welcome back
                </p>
                <p className="mt-2 text-base leading-7 text-zinc-700">
                  You are signed in as <strong className="text-zinc-900">{user.email}</strong>. Ready to turn this week’s commits into updates your audience can actually understand.
                </p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--accent) px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-(--accent-strong)"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    href="/ranking"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                  >
                    View ranking
                  </Link>
                </div>
              </article>
            ) : (
              <div id="auth-card">
                <AuthCard />
              </div>
            )}

            <article className="rounded-2xl border bg-white/85 p-4 shadow-[0_12px_40px_rgba(57,74,126,0.1)]">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                <CalendarClock className="h-3.5 w-3.5 text-(--accent)" />
                Weekly publishing rhythm
              </div>
              <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                {FLOW_STEPS.map((step, index) => (
                  <li key={step.title} className="rounded-xl border bg-white px-3 py-2">
                    <p className="font-semibold text-zinc-900">{index + 1}. {step.title}</p>
                    <p className="mt-1 text-zinc-600">{step.body}</p>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <RoadmapBoard />

        <section className="grid gap-3 sm:grid-cols-3">
          {[
            {
              title: "Release notes",
              body: "Convert rough notes into concise public changelog entries.",
              icon: Wand2,
            },
            {
              title: "Audience updates",
              body: "Generate social posts and email-ready summaries in one pass.",
              icon: Megaphone,
            },
            {
              title: "Help content",
              body: "Spin release notes into support FAQ and onboarding snippets.",
              icon: BadgeCheck,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border bg-white/80 p-4 shadow-[0_12px_40px_rgba(57,74,126,0.1)]"
              >
                <div className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                  <Icon className="h-3.5 w-3.5 text-(--accent)" />
                  {item.title}
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-700">{item.body}</p>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
