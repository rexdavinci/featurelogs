import { CheckCircle2, CircleDashed, GitPullRequest, Rocket } from "lucide-react";

const ROADMAP_COLUMNS = [
  {
    title: "Now shipping",
    icon: CheckCircle2,
    items: [
      "Neon-backed auth + pluggable auth adapter",
      "DB adapter for Firestore ↔ Neon portability",
      "Public project leaderboard",
    ],
  },
  {
    title: "Next up",
    icon: Rocket,
    items: [
      "One-click social scheduling export (X/LinkedIn)",
      "Contributor templates marketplace",
      "Project activity streaks for build-in-public consistency",
    ],
  },
  {
    title: "Community ideas",
    icon: CircleDashed,
    items: [
      "GitHub issue-to-update auto drafting",
      "Weekly OSS progress digest",
      "Badge system for public shipping milestones",
    ],
  },
];

export function RoadmapBoard() {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">
            Open roadmap
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-foreground">
            Built in public, with the community
          </h2>
        </div>
        <a
          href="https://github.com/rexdavinci/featurelogs/issues"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white/80 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-white"
        >
          <GitPullRequest className="h-3.5 w-3.5" />
          Suggest a feature on GitHub
        </a>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {ROADMAP_COLUMNS.map((column) => {
          const Icon = column.icon;
          return (
            <article
              key={column.title}
              className="glass rounded-2xl border border-white/70 p-4 shadow-[0_12px_40px_rgba(57,74,126,0.14)]"
            >
              <div className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                <Icon className="h-3.5 w-3.5" />
                {column.title}
              </div>
              <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                {column.items.map((item) => (
                  <li key={item} className="rounded-lg bg-white/70 px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
