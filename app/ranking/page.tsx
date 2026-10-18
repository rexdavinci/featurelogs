import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { loadPublicRanking } from "@/lib/db/server";
import { getSessionUser } from "@/utils/session";
import { Trophy, ArrowRight, Sparkles, Flame, Medal } from "lucide-react";

export const metadata: Metadata = {
  title: "Project Ranking",
  description:
    "Discover the most active projects building in public using FeatureLogs in the last 30 days.",
};

export default async function RankingPage() {
  const user = await getSessionUser();
  const ranking = await loadPublicRanking();

  return (
    <main className="content-shell">
      <div className="flex w-full flex-col gap-8">
        <Header userEmail={user?.email} />

        <div className="mx-auto w-full max-w-3xl space-y-6">
          <div className="text-center space-y-3 animate-rise">
            <div className="inline-flex items-center gap-2 rounded-full border bg-(--surface) px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-(--accent-strong)">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              Build In Public Leaderboard
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-foreground md:text-5xl">
              Most Active Projects
            </h1>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-(--text-secondary) md:text-base">
              The top projects by number of generated marketing kits in the last 30 days.
            </p>
          </div>

          <div className="glass rounded-3xl border border-(--border) p-5 shadow-[0_24px_80px_rgba(44,30,11,0.12)] sm:p-6 animate-rise-delayed">
            {ranking.length === 0 ? (
              <div className="text-center py-10 space-y-4">
                <Sparkles className="mx-auto h-8 w-8 text-(--text-quiet)" />
                <p className="text-sm font-semibold text-foreground">No project activity recorded yet this month.</p>
                <p className="text-xs text-(--text-muted) max-w-md mx-auto">
                  Be the first to appear on the leaderboard! Log in, onboard your project, and generate a changelog package.
                </p>
                <Link
                  href={user ? "/dashboard" : "/login?mode=signup"}
                  className="inline-flex items-center gap-2 rounded-xl bg-(--accent) px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-(--accent-strong)"
                >
                  Onboard Your Project
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-[50px_1fr_120px] items-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-(--text-muted) border-b pb-2">
                  <span>Rank</span>
                  <span>Project Name</span>
                  <span className="text-right">Kits (30d)</span>
                </div>

                <div className="divide-y divide-(--border)">
                  {ranking.map((project, index) => {
                    const rank = index + 1;
                    const isTopThree = rank <= 3;
                    
                    return (
                      <div
                        key={project.projectId}
                        className="grid grid-cols-[50px_1fr_120px] items-center px-4 py-3.5 hover:bg-(--surface-muted) transition rounded-xl"
                      >
                        <div className="flex items-center font-mono text-sm font-semibold">
                          {rank === 1 && <Trophy className="h-5 w-5 text-amber-500" />}
                          {rank === 2 && <Medal className="h-5 w-5 text-(--text-quiet)" />}
                          {rank === 3 && <Medal className="h-5 w-5 text-amber-700" />}
                          {!isTopThree && <span className="pl-1.5 text-(--text-muted)">{rank}</span>}
                        </div>

                        <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                          {project.projectName}
                          {rank === 1 && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200">
                              <Flame className="h-3 w-3 text-amber-600 fill-amber-500" />
                              Leader
                            </span>
                          )}
                        </div>

                        <div className="text-right font-mono text-sm font-semibold text-(--accent-strong)">
                          {project.count}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
