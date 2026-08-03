import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "../components/Header";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "FeatureLogs terms of service and fair use policy.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-28 top-20 h-64 w-64 rounded-full bg-(--accent)/10 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-(--accent-strong)/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-4xl space-y-5">
        <Header />
        <section className="glass rounded-3xl border p-6 shadow-[0_18px_60px_rgba(44,30,11,0.16)] sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-(--accent-strong)">Terms of Service</p>
          <h1 className="mt-2 text-4xl font-semibold text-foreground">Fair use, clear boundaries</h1>
          <p className="mt-3 text-sm leading-7 text-zinc-700">
            FeatureLogs is an open-source writing assistant for product updates. By using the service, you agree to use it responsibly, respect the rights of others, and keep usage within the fair-use boundaries below.
          </p>

          <div className="mt-6 space-y-5 text-sm leading-7 text-zinc-700">
            <div className="rounded-2xl border bg-white/80 p-4">
              <h2 className="text-lg font-semibold text-foreground">Fair use policy</h2>
              <p className="mt-2">
                The service is rate-limited to protect shared infrastructure and prevent abuse. Do not automate repeated requests, scrape generated output at scale, or use the app in a way that degrades availability for other users.
              </p>
              <p className="mt-2">
                If your usage is unusually heavy, contact the project maintainers and we can discuss a more appropriate deployment pattern.
              </p>
            </div>

            <div className="rounded-2xl border bg-white/80 p-4">
              <h2 className="text-lg font-semibold text-foreground">Your content</h2>
              <p className="mt-2">
                You retain ownership of the notes, drafts, and output you submit. You are responsible for making sure the material you provide and publish does not infringe intellectual property, privacy, or other third-party rights.
              </p>
            </div>

            <div className="rounded-2xl border bg-white/80 p-4">
              <h2 className="text-lg font-semibold text-foreground">Acceptable use</h2>
              <p className="mt-2">
                Do not use FeatureLogs for unlawful, deceptive, abusive, or harmful activity. Do not attempt to bypass rate limits, access data you do not own, or interfere with service operation.
              </p>
            </div>

            <div className="rounded-2xl border bg-white/80 p-4">
              <h2 className="text-lg font-semibold text-foreground">Contact</h2>
              <p className="mt-2">
                Questions about these terms can be routed through the project repository or your deployment owner. See the <Link href="/privacy" className="font-semibold text-(--accent-strong) underline underline-offset-2">Privacy Policy</Link> for data handling details.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}