import type { Metadata } from "next";
import { Header } from "@/app/components/Header";
import { ResetPasswordCard } from "@/app/components/ResetPasswordCard";

export const metadata: Metadata = {
  title: "Reset your password",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ResetPasswordPage() {
  return (
    <main className="auth-shell">
      <Header />
      <div className="flex justify-center px-5 py-16">
        <ResetPasswordCard />
      </div>
    </main>
  );
}
