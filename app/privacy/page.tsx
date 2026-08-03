import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "../components/Header";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "FeatureLogs privacy policy and data handling details.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-28 top-20 h-64 w-64 rounded-full bg-(--accent)/10 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-(--accent-strong)/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-4xl space-y-5">
        <Header />
        <section className="glass rounded-3xl border p-6 shadow-[0_18px_60px_rgba(44,30,11,0.16)] sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-(--accent-strong)">Privacy Policy</p>
          <h1 className="mt-2 text-4xl font-semibold text-foreground">Data stays close to the workspace</h1>
          <p className="mt-3 text-sm leading-7 text-zinc-700">
            FeatureLogs is designed to store only what it needs to generate content: your projects, inputs, outputs, templates, and a session cookie that keeps the workspace stable.
          </p>

          <div className="mt-6 space-y-5 text-sm leading-7 text-zinc-700">
            <div className="rounded-2xl border bg-white/80 p-4">
              <h2 className="text-lg font-semibold text-foreground">What we collect</h2>
              <p className="mt-2">
                We store the content you submit, the generated drafts, template settings, and basic operational metadata such as timestamps and a session identifier. We do not add a billing profile or marketing account layer.
              </p>
            </div>

            <div className="rounded-2xl border bg-white/80 p-4">
              <h2 className="text-lg font-semibold text-foreground">Why we collect it</h2>
              <p className="mt-2">
                Data is used to generate output, show recent history, save templates, and keep fair-use rate limits working. The app also uses Redis for abuse prevention and Firestore for workspace storage.
              </p>
            </div>

            <div className="rounded-2xl border bg-white/80 p-4">
              <h2 className="text-lg font-semibold text-foreground">Retention and control</h2>
              <p className="mt-2">
                Because the project is open source, retention is controlled by the deployment owner. You can delete the backing Firestore data at any time from your own infrastructure.
              </p>
            </div>

            <div className="rounded-2xl border bg-white/80 p-4">
              <h2 className="text-lg font-semibold text-foreground">Questions</h2>
              <p className="mt-2">
                If you have questions about privacy or data handling, review the deployment configuration or link this page from your own support channel. Read the <Link href="/terms" className="font-semibold text-(--accent-strong) underline underline-offset-2">Terms of Service</Link> for fair-use details.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}