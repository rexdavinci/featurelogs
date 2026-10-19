import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/app/components/Header";
import { getSessionUser } from "@/utils/session";
import { supportsAccountManagement } from "@/lib/account/server";
import { AccountControls } from "./account-controls";

export const metadata: Metadata = {
  title: "Account settings",
  robots: { index: false, follow: false },
};
export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return (
    <main className="content-shell">
      <Header userEmail={user.email} />
      <div className="mx-auto max-w-3xl py-10 sm:py-16">
        <Link href="/dashboard" className="text-link text-sm">
          ← Back to workspace
        </Link>
        <p className="section-kicker mt-8">YOUR ACCOUNT</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Your data. Your choice.
        </h1>
        <p className="mt-3 mb-8 text-sm leading-6 text-(--text-secondary)">
          Manage your information and account for {user.email}.
        </p>
        <AccountControls
          email={user.email ?? "your account"}
          enabled={supportsAccountManagement}
        />
      </div>
    </main>
  );
}
