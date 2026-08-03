import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, Bolt, BookOpen, Sparkles, Wand2 } from "lucide-react";
import { Header } from "./components/Header";
import { AuthCard } from "./components/AuthCard";
import { getSiteUrl } from "@/utils/seo";
import { getSessionUser } from "@/utils/session";

export const metadata: Metadata = {
  title: "FeatureLogs",
  description:
    "Open-source release note and social content generator with Firestore storage and fair-use rate limits.",
  alternates: {
    canonical: "/",
  },
};

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

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white/75 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-(--accent-strong)">
              <Sparkles className="h-3.5 w-3.5" />
              Open-source release
            </div>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] text-foreground md:text-6xl">
                Ship updates.
                <br />
                Write less.
                <br />
                Stay visible.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-zinc-700 md:text-lg">
                FeatureLogs turns raw release notes into changelogs, social posts, help docs, and newsletters. It stores your workspace in Firestore, rate-limits abuse with Redis, and keeps the flow simple enough to self-host.
              </p>
            </div>

            {/* <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-(--accent) px-4 py-3 text-sm font-semibold text-white transition hover:bg-(--accent-strong)"
              >
                Open Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 rounded-xl border bg-white/80 px-4 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-white"
              >
                <BookOpen className="h-4 w-4" />
                Read FAQ
              </Link>
            </div> */}

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Secure Login", "Manage your own projects, changelogs, and content templates safely."],
                ["Fair use", "Upstash-backed rate limits keep the service healthy."],
                ["Firestore storage", "Projects, templates, and drafts stay in Google Firestore."],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border bg-white/75 p-4 shadow-[0_12px_40px_rgba(59,45,28,0.06)]">
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            {user ? (
              <div className="glass rounded-3xl border p-5 shadow-[0_24px_80px_rgba(44,30,11,0.16)] sm:p-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="mt-4 rounded-2xl border bg-(--surface-muted) p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Logged In</p>
                  <p className="mt-2 text-sm leading-7 text-zinc-700">
                    Welcome back, <strong className="text-zinc-900">{user.email}</strong>! You can now access your control center.
                  </p>
                  <Link
                    href="/dashboard"
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-(--accent) px-4 py-2 text-xs font-semibold text-white transition hover:bg-(--accent-strong)"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                  <div className="rounded-2xl border bg-white/80 p-4">
                    <div className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      <Wand2 className="h-3.5 w-3.5" />
                      What it makes
                    </div>
                    <div className="mt-3 space-y-2 text-sm leading-6 text-zinc-700">
                      <p className="flex items-start gap-2">
                        <BadgeCheck className="mt-1 h-4 w-4 text-(--accent-strong) shrink-0" />
                        Public changelog markdown
                      </p>
                      <p className="flex items-start gap-2">
                        <BadgeCheck className="mt-1 h-4 w-4 text-(--accent-strong) shrink-0" />
                        X thread drafts
                      </p>
                      <p className="flex items-start gap-2">
                        <BadgeCheck className="mt-1 h-4 w-4 text-(--accent-strong) shrink-0" />
                        LinkedIn and newsletter copy
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border bg-white/80 p-4">
                    <div className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      <Bolt className="h-3.5 w-3.5" />
                      How it works
                    </div>
                    <div className="mt-3 space-y-2 text-sm leading-6 text-zinc-700">
                      <p>1. Add a project.</p>
                      <p>2. Paste raw release notes.</p>
                      <p>3. Copy polished output.</p>
                    </div>
                  </div>
                </div>

                
              </div>
            ) : (
              <AuthCard />
            )}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          {[
            ["Release notes", "Convert notes into concise public changelogs."],
            ["Audience updates", "Generate social posts and email-friendly summaries."],
            ["Help content", "Spin release notes into FAQ and support drafts."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border bg-white/75 p-4 shadow-[0_12px_40px_rgba(59,45,28,0.06)]">
              <p className="text-base font-semibold text-foreground">{title}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{body}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
