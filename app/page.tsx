import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Sparkles, Rocket, Gem } from "lucide-react";
import Image from "next/image";
import { signIn, signUp } from "./login/actions";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Header } from "./components/Header";

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const cookieStore = await cookies();
  const params = await searchParams;
  const supabase = await createServerSupabaseClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-8 sm:px-10">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-28 top-20 h-64 w-64 rounded-full bg-(--accent)/10 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-(--accent-strong)/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col">
        <Header />
        {/* <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-(--accent) text-white">
              <Image
                src="/feature-logs.svg"
                alt="FeatureLogs Logo"
                // className="h-5 w-5"
                width={50}
                height={50}
              />
            </div>
            <div>
              <p className="text-lg font-semibold">FeatureLogs</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Build In Public Engine
              </p>
            </div>
          </div>
          <span className="rounded-full border bg-white/80 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-zinc-600">
            SaaS Dashboard v1.0
          </span>
        </header> */}

        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="animate-rise">
            <p className="mb-5 inline-flex items-center gap-1.5 rounded-full border bg-white/70 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-(--accent-strong)">
              Designed For Founders & Product Teams
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] text-foreground md:text-6xl">
              Ship updates.
              <br />
              Stay visible.
              <br />
              Grow faster.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-700">
              FeatureLogs transforms rough git commits into polished public updates, social posts, newsletters, documentation and more.
            </p>

            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border bg-white/75 p-4">
                <p className="mb-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <Rocket className="h-3.5 w-3.5" />
                  Usage
                </p>
                <p className="text-3xl font-semibold text-(--accent-strong)">
                  10/mo
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Free usage for fast validation
                </p>
              </div>
              <div className="rounded-2xl border bg-white/75 p-4">
                <p className="mb-2 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <Gem className="h-3.5 w-3.5" />
                  Premium
                </p>
                <p className="text-3xl font-semibold text-(--accent-strong)">
                  100
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  Projects on Premium
                </p>
              </div>
            </div>
          </div>

          <div className="animate-rise-delayed glass rounded-3xl border p-7 shadow-[0_26px_80px_rgba(44,30,11,0.2)] sm:p-8">
            <h2 className="text-3xl font-semibold">Welcome Back</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Sign in to access your release workspace.
            </p>

            {params.error ? (
              <p className="mt-4 rounded-xl border border-(--danger)/40 bg-(--danger)/10 p-3 text-sm text-(--danger)">
                {params.error}
              </p>
            ) : null}

            <form className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-(--accent)"
                  placeholder="you@startup.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-(--accent)"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                formAction={signIn}
                className="w-full rounded-xl bg-(--accent) px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-(--accent-strong)"
              >
                Sign In
              </button>
              <button
                type="submit"
                formAction={signUp}
                className="w-full rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
              >
                Create Account
              </button>
            </form>

            {/* <p className="mt-6 text-xs text-zinc-500">
              Need details on plan limits and sharing features?
              <Link href="/faq" className="ml-1 text-(--accent-strong) underline underline-offset-2">
                Read FAQ
              </Link>
            </p> */}
          </div>
        </section>
      </div>
    </main>
  );
}
