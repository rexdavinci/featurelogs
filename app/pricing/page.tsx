import Script from "next/script";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronLeft,
  CreditCard,
  CircleCheckBig,
  ShieldCheck,
} from "lucide-react";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { monthStartIso } from "@/utils/tiers";
import Image from "next/image";

export default async function PricingPage() {
  const cookieStore = await cookies();
  const supabase = await createServerSupabaseClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_subscribed")
    .eq("id", user.id)
    .maybeSingle();

  const { count: monthlyRuns } = await supabase
    .from("logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", monthStartIso());

  const isSubscribed = Boolean(profile?.is_subscribed);
  const pricingTableId = process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const hasStripePricingConfig = Boolean(pricingTableId && publishableKey);

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-8 sm:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-28 top-20 h-64 w-64 rounded-full bg-(--accent)/10 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-(--accent-strong)/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl">
        <header className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <Image
                src="/feature-logs.svg"
                alt="FeatureLogs Logo"
                width={30}
                height={30}
              />
            </div>
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
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </Link>
            <span className="inline-flex items-center gap-1 rounded-full border bg-white/80 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-zinc-600">
              <CreditCard className="h-3.5 w-3.5" />
              Billing
            </span>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[1.35fr_0.95fr]">
          <article className="glass rounded-2xl border p-6 shadow-[0_18px_60px_rgba(44,30,11,0.2)] sm:p-8">
            <p className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-(--accent-strong)">
              <ShieldCheck className="h-3.5 w-3.5" />
              Subscription & Billing
            </p>
            <h1 className="mt-2 text-4xl font-semibold text-foreground">
              Upgrade to Premium
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-700">
              Unlock advanced generation workflows, persistent style templates,
              and premium content channels for serious build-in-public teams.
            </p>

            <div className="mt-6 rounded-2xl border bg-white/80 p-5">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
                Current Plan Snapshot
              </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-zinc-500">Membership</p>
                  <p className="text-3xl font-semibold text-(--accent-strong)">
                    {isSubscribed ? "Premium" : "Free Tier"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Monthly Run Count</p>
                  <p className="text-3xl font-semibold text-foreground">
                    {monthlyRuns ?? 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border bg-white/80 p-5">
              <h2 className="text-lg font-semibold text-foreground">
                Feature Comparison
              </h2>
              <div className="mt-4 overflow-hidden rounded-xl border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-(--surface-muted)">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Capability</th>
                      <th className="px-4 py-3 font-semibold">Free</th>
                      <th className="px-4 py-3 font-semibold">Premium</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/70">
                    <tr className="border-t">
                      <td className="px-4 py-3">Projects</td>
                      <td className="px-4 py-3">1</td>
                      <td className="px-4 py-3">100</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-4 py-3">Commit Analysis</td>
                      <td className="px-4 py-3">10 / month</td>
                      <td className="px-4 py-3">50 / day</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-4 py-3">History Retention</td>
                      <td className="px-4 py-3">7 days</td>
                      <td className="px-4 py-3">Unlimited</td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-4 py-3">Premium Channels</td>
                      <td className="px-4 py-3">
                        X Thread, Public Changelog, Help Center FAQ
                      </td>
                      <td className="px-4 py-3">
                        All in Free + LinkedIn post, FAQ, Email, Monthly
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="px-4 py-3">Voice Templates</td>
                      <td className="px-4 py-3">Not Included</td>
                      <td className="px-4 py-3">Custom + saved</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border bg-white/80 p-5">
              <h2 className="text-lg font-semibold text-foreground">
                Why Teams Upgrade
              </h2>
              <ul className="mt-3 grid gap-3 text-sm leading-6 text-zinc-700 sm:grid-cols-2">
                <li className="flex items-start gap-2">
                  <CircleCheckBig className="mt-0.5 h-4 w-4 text-(--accent-strong)" />
                  100 projects and 50 generations daily
                </li>
                <li className="flex items-start gap-2">
                  <CircleCheckBig className="mt-0.5 h-4 w-4 text-(--accent-strong)" />
                  Personalized Tone / Tone & Style templates
                </li>
                <li className="flex items-start gap-2">
                  <CircleCheckBig className="mt-0.5 h-4 w-4 text-(--accent-strong)" />
                  LinkedIn, Help FAQ, Email, and Monthly newsletter channels
                </li>
                <li className="flex items-start gap-2">
                  <CircleCheckBig className="mt-0.5 h-4 w-4 text-(--accent-strong)" />
                  Full history retention and advanced workflow depth
                </li>
              </ul>
            </div>
          </article>

          <aside className="glass rounded-2xl border p-5 shadow-[0_18px_60px_rgba(44,30,11,0.2)] lg:sticky lg:top-8 lg:h-fit">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Checkout
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full border bg-white px-2.5 py-1 text-[11px] font-semibold text-(--accent-strong)">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Secure Stripe
              </span>
            </div>

            <p className="mb-4 text-sm leading-7 text-zinc-700">
              Start your premium plan to unlock full channel coverage, advanced
              template controls, and high-frequency generation.
            </p>

            <div className="rounded-2xl border bg-white/80 p-3">
              {hasStripePricingConfig ? (
                <>
                  <stripe-pricing-table
                    pricing-table-id={pricingTableId}
                    publishable-key={publishableKey}
                    customer-email={user.email}
                  />
                  <Script
                    async
                    src="https://js.stripe.com/v3/pricing-table.js"
                  />
                </>
              ) : (
                <div className="rounded-xl border bg-(--surface-muted) p-6 text-sm text-zinc-700">
                  <p className="text-base font-semibold text-foreground">
                    Stripe checkout isn’t configured yet.
                  </p>
                  <p className="mt-2 leading-7">
                    Add NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID and
                    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment, then
                    reload this page.
                  </p>
                  <Link
                    href="/dashboard"
                    className="mt-4 inline-flex rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    Return to Dashboard
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
