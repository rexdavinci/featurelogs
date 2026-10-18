import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { AuthCard } from "../components/AuthCard";
import { Header } from "../components/Header";
import { getSessionUser } from "@/utils/session";

export const metadata: Metadata = { title: "Your next update starts here", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  if (await getSessionUser()) redirect("/dashboard");
  const { mode } = await searchParams;
  return <main className="auth-shell"><Header /><div className="auth-content"><section className="auth-story"><p className="section-kicker">MAKE PROGRESS VISIBLE</p><h1>You did the building.<br /><span>Let’s do the sharing.</span></h1><p>A home for your projects, your voice, and your next great update.</p><ul><li><Check size={15} /> Turn rough notes into ready-to-edit drafts</li><li><Check size={15} /> Keep your voice consistent across channels</li><li><Check size={15} /> Free credits to get you started</li></ul><Link href="/" className="text-link"><ArrowLeft size={14} /> Back to FeatureLogs</Link></section><AuthCard key={mode ?? "login"} initialMode={mode === "signup" ? "signup" : "login"} /></div></main>;
}
