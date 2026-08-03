"use server";

import { revalidatePath } from "next/cache";
import { FAIR_USE_LIMITS, monthStartIso } from "@/utils/tiers";
import {
  generateContent,
  generateMonthlyNewsletterFromChangelogs,
} from "@/utils/ai";
import { type StyleTemplates } from "@/utils/style-templates";
import {
  consumeUsage,
  countUsageSince,
  countProjects,
  ensureProject,
  findProjectByName,
  loadDashboardSnapshot,
  loadLogsSince,
  loadTemplates,
  saveLog,
  saveTemplates,
} from "@/utils/firestore";
import { getSessionUser } from "@/utils/session";
import { assertRateLimit } from "@/utils/rate-limit";

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

function getActionErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

async function assertUsageCapacity(userId: string, unitsNeeded: number) {
  const used = await countUsageSince(
    userId,
    new Date(
      Date.now() - FAIR_USE_LIMITS.periodHours * 60 * 60 * 1000,
    ).toISOString(),
  );

  const remaining = FAIR_USE_LIMITS.periodCap - used;
  if (remaining < unitsNeeded) {
    return {
      ok: false as const,
      error: `Fair-use limit reached (${used}/${FAIR_USE_LIMITS.periodCap} in last ${FAIR_USE_LIMITS.periodHours}h).`,
    };
  }

  return { ok: true as const };
}

export async function saveStyleTemplates(
  input: StyleTemplates,
  projectId: string,
): Promise<SaveTemplateState> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, error: "Authentication required." };
  }
  const userId = user.uid;

  if (!projectId) {
    return { ok: false, error: "Select a project before saving templates." };
  }

  try {
    const capacity = await assertUsageCapacity(userId, 1);
    if (!capacity.ok) {
      return { ok: false, error: capacity.error };
    }

    await saveTemplates(userId, projectId, input);
    await consumeUsage(userId, "save_templates", { projectId });
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: getActionErrorMessage(
        error,
        "Template service is temporarily unavailable.",
      ),
    };
  }
}

export async function generateMonthlyNewsletter(): Promise<MonthlyNewsletterState> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, error: "Authentication required." };
  }
  const userId = user.uid;

  const rateLimit = await assertRateLimit("newsletter", userId);

  if (!rateLimit.ok) {
    return { ok: false, error: rateLimit.error };
  }

  try {
    const capacity = await assertUsageCapacity(userId, 1);
    if (!capacity.ok) {
      return { ok: false, error: capacity.error };
    }

    const dashboard = await loadDashboardSnapshot(userId);
    const logs = await loadLogsSince(userId, monthStartIso());

    const changelogEntries = logs
      .map((item: unknown) => {
        if (
          typeof item === "object" &&
          item !== null &&
          "outputChangelog" in item
        ) {
          const value = (item as { outputChangelog?: unknown }).outputChangelog;
          return typeof value === "string" ? value : "";
        }
        return "";
      })
      .filter((item: string): item is string => Boolean(item));

    if (!changelogEntries.length) {
      return {
        ok: false,
        error: "No changelog entries found for this month yet.",
      };
    }

    try {
      const text = await generateMonthlyNewsletterFromChangelogs({
        changelogEntries,
        templates: dashboard.styleTemplates,
      });
      await consumeUsage(userId, "generate_monthly_newsletter_ai", {
        changelogCount: changelogEntries.length,
      });
      revalidatePath("/dashboard");
      return { ok: true, text };
    } catch {
      return {
        ok: false,
        error: "Monthly newsletter provider is unavailable. Try again shortly.",
      };
    }
  } catch (error) {
    return {
      ok: false,
      error: getActionErrorMessage(
        error,
        "Monthly newsletter service is temporarily unavailable.",
      ),
    };
  }
}

export async function onboardProject(
  formData: FormData,
): Promise<OnboardProjectState> {
  const projectName = String(formData.get("name") ?? "").trim();

  if (!projectName) {
    return {
      ok: false,
      error: "Project name is required to onboard a project.",
    };
  }

  const user = await getSessionUser();

  if (!user) {
    return { ok: false, error: "Authentication required." };
  }
  const userId = user.uid;

  const existingProject = await findProjectByName(userId, projectName);

  if (!existingProject) {
    const projectCount = await countProjects(userId);
    if (projectCount >= FAIR_USE_LIMITS.projectCap) {
      return {
        ok: false,
        error: `Fair-use limit reached (${FAIR_USE_LIMITS.projectCap} projects).`,
      };
    }
  }

  try {
    if (!existingProject) {
      const capacity = await assertUsageCapacity(userId, 1);
      if (!capacity.ok) {
        return { ok: false, error: capacity.error };
      }
    }

    const project =
      existingProject ?? (await ensureProject(userId, projectName));

    if (!existingProject) {
      await consumeUsage(userId, "create_project", {
        projectId: project.id,
        projectName,
      });
    }

    revalidatePath("/dashboard");
    return { ok: true, projectId: project.id };
  } catch (error) {
    return {
      ok: false,
      error: getActionErrorMessage(
        error,
        "Project onboarding service is temporarily unavailable.",
      ),
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

  const user = await getSessionUser();
  if (!user) {
    return { ok: false, error: "Authentication required." };
  }
  const userId = user.uid;

  const rateLimit = await assertRateLimit("generate", userId);

  if (!rateLimit.ok) {
    return { ok: false, error: rateLimit.error };
  }

  const existingProject = await findProjectByName(userId, projectName);
  if (!existingProject) {
    const projectCount = await countProjects(userId);

    if (projectCount >= FAIR_USE_LIMITS.projectCap) {
      return {
        ok: false,
        error: `Fair-use limit reached (${FAIR_USE_LIMITS.projectCap} projects).`,
      };
    }
  }

  const neededUnits = existingProject ? 2 : 3;
  const capacity = await assertUsageCapacity(userId, neededUnits);
  if (!capacity.ok) {
    return { ok: false, error: capacity.error };
  }

  const project = existingProject ?? (await ensureProject(userId, projectName));
  if (!existingProject) {
    await consumeUsage(userId, "create_project", {
      projectId: project.id,
      projectName,
    });
  }

  const projectId = project.id ?? "";
  const templates = await loadTemplates(userId, projectId);

  let generated;
  try {
    generated = await generateContent({
      projectName,
      rawInput,
      templates,
    });
    await consumeUsage(userId, "generate_marketing_kit_ai", {
      projectId,
      projectName,
    });
  } catch {
    return {
      ok: false,
      error: "Content generation provider failed. Please try again.",
    };
  }

  const twitterCombined = generated.twitterMessages.join("\n\n---\n\n");

  try {
    await saveLog({
      userId,
      projectId,
      projectName,
      rawInput,
      outputChangelog: generated.changelog,
      outputTwitter: twitterCombined,
      outputLinkedin: generated.linkedin,
      outputHelpFaq: generated.helpFaq,
      outputEmailNewsletter: generated.emailNewsletter,
    });
    await consumeUsage(userId, "save_log", {
      projectId,
      projectName,
    });
  } catch (error) {
    return {
      ok: false,
      error: getActionErrorMessage(
        error,
        "Firestore write failed while saving generated content.",
      ),
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
