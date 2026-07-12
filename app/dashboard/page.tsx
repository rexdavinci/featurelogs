import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { isoHoursAgo, monthStartIso } from "@/utils/tiers";
import { mergeTemplates } from "@/utils/style-templates";

export default async function DashboardPage() {
  const pageSize = 10;
  const from = 0;
  const to = pageSize - 1;
  const cookieStore = await cookies();

  const supabase = await createServerSupabaseClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  await supabase.from("profiles").upsert({ id: user.id, email: user.email }, { onConflict: "id" });

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_subscribed, email")
    .eq("id", user.id)
    .maybeSingle();

  const isSubscribed = Boolean(profile?.is_subscribed);
  const usageWindow = isSubscribed ? isoHoursAgo(24) : monthStartIso();

  const { count: usageCount } = await supabase
    .from("logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", usageWindow);

  let logsQuery = supabase
    .from("logs")
    .select("id, created_at, raw_input, project_id, output_changelog, output_twitter, output_linkedin, output_help_faq, output_email_newsletter, projects(project_name)", {
      count: "exact",
    })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (!isSubscribed) {
    logsQuery = logsQuery.gte("created_at", isoHoursAgo(24 * 7));
  }

  const { data: logs } = await logsQuery;

  const { data: projects } = await supabase
    .from("projects")
    .select("id, project_name, created_at")
    .eq("user_id", user.id)
    .order("project_name", { ascending: true });

  const { data: styleTemplateRow } = await supabase
    .from("voice_templates")
    .select("settings")
    .eq("user_id", user.id)
    .maybeSingle();

  const styleTemplates = mergeTemplates(styleTemplateRow?.settings);

  return (
    <DashboardClient
      email={profile?.email ?? user.email ?? "Unknown"}
      isSubscribed={isSubscribed}
      usageCount={usageCount ?? 0}
      logs={logs ?? []}
      projects={projects ?? []}
      styleTemplates={styleTemplates}
    />
  );
}
