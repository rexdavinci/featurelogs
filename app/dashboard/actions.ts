"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import {
  FREE_LIMITS,
  PREMIUM_LIMITS,
  isoHoursAgo,
  monthStartIso,
} from "@/utils/tiers";
import {
  generateContent,
  generateMonthlyNewsletterFromChangelogs,
} from "@/utils/ai";
import {
  DEFAULT_STYLE_TEMPLATES,
  mergeTemplates,
  type StyleTemplates,
} from "@/utils/style-templates";

type GenerationPayload = {
  changelog: string;
  twitter: string;
  linkedin: string;
  helpFaq: string;
  emailNewsletter: string;
};

export type GenerationState = {
  ok: boolean;
  error?: string;
  payload?: GenerationPayload;
};

export type SaveTemplateState = {
  ok: boolean;
  error?: string;
};

export type OnboardProjectState = {
  ok: boolean;
  error?: string;
  projectId?: string;
};

export type MonthlyNewsletterState = {
  ok: boolean;
  error?: string;
  text?: string;
};

async function ensureProfile(userId: string, email: string | undefined) {
  const cookieStore = await cookies();
  const supabase = await createServerSupabaseClient(cookieStore);
  if (!email) return;
  await supabase
    .from("profiles")
    .upsert({ id: userId, email }, { onConflict: "id" });
}

export async function logout() {
  const cookieStore = await cookies();
  const supabase = await createServerSupabaseClient(cookieStore);
  await supabase.auth.signOut();
}

async function getUserAndTier() {
  try {
    const cookieStore = await cookies();
    const supabase = await createServerSupabaseClient(cookieStore);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        supabase,
        user: null,
        isSubscribed: false,
        error: "Please sign in again.",
      };
    }

    await ensureProfile(user.id, user.email);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_subscribed")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return {
        supabase,
        user,
        isSubscribed: false,
        error: "Could not load your billing tier. Please retry.",
      };
    }

    return { supabase, user, isSubscribed: Boolean(profile?.is_subscribed) };
  } catch {
    return {
      supabase: null,
      user: null,
      isSubscribed: false,
      error: "Authentication service is temporarily unavailable.",
    };
  }
}

async function loadStyleTemplates(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  userId: string,
) {
  try {
    const { data: templateRow, error } = await supabase
      .from("voice_templates")
      .select("settings")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return DEFAULT_STYLE_TEMPLATES;
    }

    return mergeTemplates(templateRow?.settings);
  } catch {
    return DEFAULT_STYLE_TEMPLATES;
  }
}

async function getOrCreateProjectId(params: {
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
  userId: string;
  projectName: string;
  isSubscribed: boolean;
  createIfMissing?: boolean;
}) {
  const {
    supabase,
    userId,
    projectName,
    isSubscribed,
    createIfMissing = true,
  } = params;

  const { data: existingProject, error: existingProjectError } = await supabase
    .from("projects")
    .select("id, project_name")
    .eq("user_id", userId)
    .eq("project_name", projectName)
    .maybeSingle();

  if (existingProjectError) {
    return {
      projectId: null,
      error: "Could not verify existing projects. Please retry.",
    };
  }

  const { count: projectCount, error: projectCountError } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (projectCountError) {
    return {
      projectId: null,
      error: "Could not load project usage. Please retry.",
    };
  }

  const maxProjects = isSubscribed
    ? PREMIUM_LIMITS.projectCap
    : FREE_LIMITS.projectCap;
  if (!existingProject && (projectCount ?? 0) >= maxProjects) {
    return {
      projectId: null,
      error: isSubscribed
        ? "Project limit reached (100)."
        : "Free tier supports only one project. Upgrade to add more.",
    };
  }

  if (existingProject?.id) {
    return { projectId: existingProject.id, error: undefined };
  }

  if (!createIfMissing) {
    return {
      projectId: null,
      error: "Select an onboarded project before generating.",
    };
  }

  const { data: insertedProject, error: projectInsertError } = await supabase
    .from("projects")
    .insert({ user_id: userId, project_name: projectName })
    .select("id")
    .single();

  if (projectInsertError || !insertedProject) {
    return {
      projectId: null,
      error: "Could not create project. Please try again.",
    };
  }

  return { projectId: insertedProject.id, error: undefined };
}

export async function saveStyleTemplates(
  input: StyleTemplates,
  projectId: string,
): Promise<SaveTemplateState> {
  const {
    supabase,
    user,
    isSubscribed,
    error: authError,
  } = await getUserAndTier();

  if (authError) {
    return { ok: false, error: authError };
  }

  if (!supabase || !user) {
    return { ok: false, error: "Please sign in again." };
  }

  if (!isSubscribed) {
    return {
      ok: false,
      error: "Tone & Style templates are available on Premium.",
    };
  }

  const safeTemplates = mergeTemplates(input);

  try {
    const { error } = await supabase.from("voice_templates").upsert(
      {
        project_id: projectId,
        user_id: user.id,
        settings: safeTemplates,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "project_id" },
    );

    if (error) {
      return { ok: false, error: "Could not save template preferences." };
    }

    revalidatePath("/dashboard");
    return { ok: true };
  } catch {
    return { ok: false, error: "Template service is temporarily unavailable." };
  }
}

export async function generateMonthlyNewsletter(): Promise<MonthlyNewsletterState> {
  const {
    supabase,
    user,
    isSubscribed,
    error: authError,
  } = await getUserAndTier();

  if (authError) {
    return { ok: false, error: authError };
  }

  if (!supabase || !user) {
    return { ok: false, error: "Please sign in again." };
  }

  if (!isSubscribed) {
    return {
      ok: false,
      error: "Monthly newsletter generation is premium-only.",
    };
  }

  try {
    const { data: logs, error: logsError } = await supabase
      .from("logs")
      .select("output_changelog")
      .eq("user_id", user.id)
      .gte("created_at", monthStartIso())
      .order("created_at", { ascending: true });

    if (logsError) {
      return {
        ok: false,
        error: "Could not load changelog history. Please retry.",
      };
    }

    const changelogEntries = (logs ?? [])
      .map((item) => item.output_changelog)
      .filter((item): item is string => Boolean(item));

    if (!changelogEntries.length) {
      return {
        ok: false,
        error: "No changelog entries found for this month yet.",
      };
    }

    const templates = await loadStyleTemplates(supabase, user.id);

    try {
      const text = await generateMonthlyNewsletterFromChangelogs({
        changelogEntries,
        templates,
      });
      return { ok: true, text };
    } catch {
      return {
        ok: false,
        error: "Monthly newsletter provider is unavailable. Try again shortly.",
      };
    }
  } catch {
    return {
      ok: false,
      error: "Monthly newsletter service is temporarily unavailable.",
    };
  }
}

export async function onboardProject(
  formData: FormData,
): Promise<OnboardProjectState> {
  const projectName = String(formData.get("projectName") ?? "").trim();

  if (!projectName) {
    return {
      ok: false,
      error: "Project name is required to onboard a project.",
    };
  }

  const {
    supabase,
    user,
    isSubscribed,
    error: authError,
  } = await getUserAndTier();

  if (authError) {
    return { ok: false, error: authError };
  }

  if (!supabase || !user) {
    return { ok: false, error: "Please sign in again." };
  }

  try {
    const { projectId, error } = await getOrCreateProjectId({
      supabase,
      userId: user.id,
      projectName,
      isSubscribed,
    });

    if (error || !projectId) {
      return { ok: false, error: error ?? "Could not onboard project." };
    }

    revalidatePath("/dashboard");
    return { ok: true, projectId };
  } catch {
    return {
      ok: false,
      error: "Project onboarding service is temporarily unavailable.",
    };
  }
}

export async function generatePackage(
  formData: FormData,
): Promise<GenerationState> {
  const projectName = String(formData.get("projectName") ?? "").trim();
  const rawInput = String(formData.get("rawInput") ?? "").trim();

  if (!projectName || !rawInput) {
    return { ok: false, error: "Project name and raw notes are required." };
  }

  const {
    supabase,
    user,
    isSubscribed,
    error: authError,
  } = await getUserAndTier();

  if (authError) {
    return { ok: false, error: authError };
  }

  if (!supabase || !user) {
    return { ok: false, error: "You need to sign in again." };
  }

  const templates = await loadStyleTemplates(supabase, user.id);

  const { projectId, error: projectError } = await getOrCreateProjectId({
    supabase,
    userId: user.id,
    projectName,
    isSubscribed,
    createIfMissing: false,
  });

  if (projectError || !projectId) {
    return {
      ok: false,
      error: projectError ?? "Could not create project. Please try again.",
    };
  }

  const since = isSubscribed ? isoHoursAgo(24) : monthStartIso();
  const limit = isSubscribed ? PREMIUM_LIMITS.periodCap : FREE_LIMITS.periodCap;

  const { count: usageCount, error: usageCountError } = await supabase
    .from("logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", since);

  if (usageCountError) {
    return {
      ok: false,
      error: "Could not validate usage limit. Please retry.",
    };
  }

  if ((usageCount ?? 0) >= limit) {
    return {
      ok: false,
      error: isSubscribed
        ? "Daily premium limit reached (50 in 24h)."
        : "Monthly limit reached (10).",
    };
  }

  let generated;
  try {
    generated = await generateContent({
      projectName,
      rawInput,
      isSubscribed,
      templates,
    });
  } catch {
    return {
      ok: false,
      error: "Content generation provider failed. Please try again.",
    };
  }

  const twitterCombined = generated.twitterMessages.join("\n\n---\n\n");

  try {
    const { error: insertError } = await supabase.from("logs").insert({
      user_id: user.id,
      project_id: projectId,
      raw_input: rawInput,
      output_changelog: generated.changelog,
      output_twitter: twitterCombined,
      output_linkedin: generated.linkedin,
      output_help_faq: generated.helpFaq,
      output_email_newsletter: generated.emailNewsletter,
    });

    if (insertError) {
      return { ok: false, error: "Could not save your generated package." };
    }
  } catch {
    return {
      ok: false,
      error: "Database write failed while saving generated content.",
    };
  }

  revalidatePath("/dashboard");

  return {
    ok: true,
    payload: {
      changelog: generated.changelog,
      twitter: twitterCombined,
      linkedin: generated.linkedin,
      helpFaq: generated.helpFaq,
      emailNewsletter: generated.emailNewsletter,
    },
  };
}
