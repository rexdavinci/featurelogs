import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "../../components/Header";

export const metadata: Metadata = {
  title: "Product Changelog Examples and Release Notes Templates",
  description:
    "See practical product changelog examples and use a clear release notes template for launches, improvements, and bug fixes.",
  keywords: [
    "product changelog examples",
    "release notes template",
    "product update examples",
    "software changelog template",
  ],
  alternates: { canonical: "/resources/product-changelog-examples" },
};

export default function ProductChangelogExamplesPage() {
  return (
    <main className="content-shell">
      <div className="space-y-8">
        <Header />
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-(--text-muted)">
          Product communication resource
        </p>
        <h1 className="mt-2 max-w-4xl text-4xl font-semibold text-foreground">
          Product changelog examples and a release notes template
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-(--text-secondary)">
          A good product update explains what changed, why it matters, and what
          people can do next. Use these examples as a starting point, then turn
          your own rough notes into a complete communication kit with
          FeatureLogs.
        </p>

        <section className="grid gap-4 sm:grid-cols-3" aria-label="Changelog examples">
          {[
            ["New feature", "You can now invite teammates to a project with one link. Set permissions during setup, then start collaborating immediately."],
            ["Improvement", "Projects now load faster on slower connections. We reduced the first screen load and added clearer empty states."],
            ["Bug fix", "Fixed an issue that could hide saved drafts after switching projects. Your drafts now remain available from the project history."],
          ].map(([title, body]) => (
            <article key={title} className="rounded-2xl border bg-(--surface) p-5">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-(--accent-strong)">{title}</p>
              <p className="mt-3 text-sm leading-7 text-(--text-secondary)">{body}</p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border bg-(--surface) p-6">
          <h2 className="text-2xl font-semibold text-foreground">Simple release notes template</h2>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-xl bg-(--surface-muted) p-4 font-mono text-sm leading-7 text-(--text-secondary)">{`## [Update name]\n\n### What changed\nDescribe the feature, improvement, or fix in plain language.\n\n### Why it matters\nExplain the problem this solves for customers.\n\n### How to use it\nInclude the next step, if the user needs to take one.`}</pre>
        </section>

        <div className="rounded-2xl border bg-(--surface-muted) p-5 text-sm leading-7 text-(--text-secondary)">
          Need to create more than a changelog entry? FeatureLogs turns one set
          of product notes into a changelog, social posts, FAQ, and newsletter.
          <Link href="/login?mode=signup" className="ml-1 font-semibold text-(--accent-strong) underline underline-offset-2">
            Create your first kit →
          </Link>
        </div>
      </div>
    </main>
  );
}
