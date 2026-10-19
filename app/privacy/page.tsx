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
    <main className="content-shell">
      <div className="space-y-8">
        <Header />
        <section className="glass rounded-3xl border p-6 shadow-[0_18px_60px_rgba(44,30,11,0.16)] sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-(--accent-strong)">
            Privacy Policy
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-foreground">
            Data stays close to the workspace
          </h1>
          <p className="mt-3 text-sm leading-7 text-(--text-secondary)">
            FeatureLogs is designed to store only what it needs to generate
            content: your projects, inputs, outputs, templates, and a session
            cookie that keeps the workspace stable.
          </p>

          <div className="mt-6 space-y-5 text-sm leading-7 text-(--text-secondary)">
            <div className="rounded-2xl border bg-(--surface) p-4">
              <h2 className="text-lg font-semibold text-foreground">
                What we collect
              </h2>
              <p className="mt-2">
                We store the content you submit, the generated drafts, template
                settings, and basic operational metadata such as timestamps and
                a session identifier. We do not add a billing profile or
                marketing account layer.
              </p>
            </div>

            <div className="rounded-2xl border bg-(--surface) p-4">
              <h2 className="text-lg font-semibold text-foreground">
                Why we collect it
              </h2>
              <p className="mt-2">
                Data is used to generate output, show recent history, save
                templates, and keep fair-use rate limits working. Depending on
                deployment settings, the app uses Redis for abuse prevention and
                Neon/Postgres or Firestore for storage.
              </p>
            </div>

            <div className="rounded-2xl border bg-(--surface) p-4">
              <h2 className="text-lg font-semibold text-foreground">
                Retention and control
              </h2>
              <p className="mt-2">
                For Neon storage and authentication, open Settings to download
                your data as JSON or permanently delete your account and live
                app data. Other provider combinations require help from the
                deployment owner. Backups and records retained independently by
                email or AI providers follow their own retention policies.
              </p>
            </div>

            <div className="rounded-2xl border bg-(--surface) p-4">
              <h2 className="text-lg font-semibold text-foreground">
                Questions
              </h2>
              <p className="mt-2">
                If you have questions about privacy or data handling, review the
                deployment configuration or link this page from your own support
                channel. Read the{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-(--accent-strong) underline underline-offset-2"
                >
                  Terms of Service
                </Link>{" "}
                for fair-use details.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
