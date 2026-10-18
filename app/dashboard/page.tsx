import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";
import { loadDashboardSnapshot } from "@/lib/db/server";
import { getSessionUser } from "@/utils/session";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }


  const snapshot = await loadDashboardSnapshot(user.uid);

  return (
    <DashboardClient
      userEmail={user.email}
      usageCount={snapshot.usageCount}
      logs={snapshot.logs}
      projects={snapshot.projects}
      styleTemplates={snapshot.styleTemplates}
    />
  );
}
