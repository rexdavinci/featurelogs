"use client";
import type { Project, LogRecord } from "@/lib/types";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
import {
  BookOpen,
  Check,
  CircleHelp,
  Clock3,
  Copy,
  Link2,
  Mail,
  Megaphone,
  MessageCircle,
  Newspaper,
  Plus,
  Rocket,
  ScrollText,
  WandSparkles,
} from "lucide-react";
import { FAIR_USE_LIMITS, formatUsageText } from "@/utils/tiers";
import {
  generateMonthlyNewsletter,
  generatePackage,
  onboardProject,
  saveStyleTemplates,
  type GenerationState,
} from "./actions";
import {
  DEFAULT_STYLE_TEMPLATES,
  TEMPLATE_ORDER,
  type StyleTemplates,
  type TemplateKey,
} from "@/utils/style-templates";
import { PRESETS } from "@/utils/presets";
import { Header } from "../components/Header";

type Props = {
  userEmail?: string | null;
  usageCount: number;
  logs: LogRecord[];
  projects: Project[];
  styleTemplates: StyleTemplates;
};

const BUILD_IN_PUBLIC_CHECKLIST = [
  "Post one changelog update",
  "Share one social thread",
  "Capture one user-facing lesson",
];

function splitToTweets(input: string, maxMessages: number) {
  const customBlocks = input
    .split("\n\n---\n\n")
    .map((item) => item.trim())
    .filter(Boolean);

  if (customBlocks.length > 0) {
    return customBlocks.slice(0, maxMessages);
  }

  const maxLen = 280;
  const words = input.split(/\s+/);
  const parts: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxLen) {
      current = candidate;
    } else {
      if (current) parts.push(current);
      current = word;
    }
  }

  if (current) parts.push(current);
  return (parts.length ? parts : [input]).slice(0, maxMessages);
}

function CopyButton({ value }: { value: string }) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
    >
      <Copy className="h-3.5 w-3.5" />
      {done ? "Copied" : "Copy"}
    </button>
  );
}

export default function DashboardClient({
  userEmail,
  usageCount,
  logs,
  projects,
  styleTemplates,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [isMonthlyPending, startMonthly] = useTransition();
  const [isOnboarding, startOnboarding] = useTransition();
  const [state, setState] = useState<GenerationState>({ ok: false });
  const [panel, setPanel] = useState<"generator" | "templates">("generator");
  const [templates, setTemplates] = useState<StyleTemplates>(styleTemplates);
  const [activeTemplate, setActiveTemplate] =
    useState<TemplateKey>("changelog");
  const [templateFeedback, setTemplateFeedback] = useState("");
  const [monthlyText, setMonthlyText] = useState("");
  const [monthlyError, setMonthlyError] = useState("");
  const [selectedProject, setSelectedProject] = useState(
    projects[0]?.name ?? "",
  );
  const [rawNotes, setRawNotes] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [onboardingProjectName, setOnboardingProjectName] = useState("");
  const [onboardingMessage, setOnboardingMessage] = useState("");
  const [onboardingError, setOnboardingError] = useState("");

  const hasProjects = projects.length > 0;
  const newest = logs[0];
  const output =
    state.payload ??
    (newest
      ? {
          changelog: newest.outputChangelog,
          twitter: newest.outputTwitter,
          linkedin: newest.outputLinkedin,
          helpFaq: newest.outputHelpFaq,
          emailNewsletter: newest.outputEmailNewsletter,
        }
      : null);

  const tweets = useMemo(
    () => splitToTweets(output?.twitter ?? "", 4),
    [output?.twitter],
  );
  const latestThree = logs.slice(0, 3);
  const currentTemplate = templates[activeTemplate];
  const remainingCredits = Math.max(FAIR_USE_LIMITS.periodCap - usageCount, 0);
  const usageRatio = Math.min(
    100,
    Math.round((usageCount / FAIR_USE_LIMITS.periodCap) * 100),
  );
  const selectedProjectRecord = projects.find(
    (project) => project.name === selectedProject,
  );
  const checklistCompleted = Math.min(logs.length, BUILD_IN_PUBLIC_CHECKLIST.length);

  function updateTemplateField(
    field: "tone" | "cta" | "hashtags",
    value: string,
  ) {
    setTemplates((prev) => ({
      ...prev,
      [activeTemplate]: {
        ...prev[activeTemplate],
        [field]: value,
      },
    }));
  }

  function applyPreset() {
    const preset = PRESETS.find((item) => item.label === selectedPreset);
    if (!preset) return;
    setRawNotes(preset.text);
  }

  function switchPanel(nextPanel: "generator" | "templates") {
    setPanel(nextPanel);
  }

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  function formatDate(dateString: string) {
    return dateFormatter.format(new Date(dateString));
  }

  return (
    <main className="relative overflow-hidden px-4 py-6 sm:px-6 sm:py-8">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-28 top-20 h-64 w-64 rounded-full bg-(--accent)/10 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-(--accent-strong)/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl space-y-5">
        <Header usageCount={usageCount} userEmail={userEmail} />

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="gradient-card rounded-2xl border p-4 shadow-[0_12px_40px_rgba(59,45,28,0.09)] sm:col-span-2 lg:col-span-2">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  Credits
                </p>
                <p className="mt-1 text-2xl font-semibold text-(--accent-strong)">
                  {remainingCredits} left
                </p>
                <p className="text-xs text-zinc-600">{formatUsageText(usageCount)}</p>
              </div>
              <p className="rounded-full border border-white/80 bg-white/70 px-3 py-1 text-xs font-semibold text-zinc-600">
                {remainingCredits > 0
                  ? "You still have room to ship more updates today."
                  : "Daily cap reached — refreshes within 24h."}
              </p>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/70">
              <div
                className="h-full rounded-full bg-(--accent)"
                style={{ width: `${usageRatio}%` }}
              />
            </div>
          </div>
          <div className="rounded-2xl border bg-white/75 p-4 shadow-[0_12px_40px_rgba(59,45,28,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Projects
            </p>
            <p className="mt-2 text-2xl font-semibold text-(--accent-strong)">
              {projects.length}
            </p>
          </div>
          <div className="rounded-2xl border bg-white/75 p-4 shadow-[0_12px_40px_rgba(59,45,28,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Recent drafts
            </p>
            <p className="mt-2 text-2xl font-semibold text-(--accent-strong)">
              {logs.length}
            </p>
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-2xl border bg-white/80 p-4 shadow-[0_12px_40px_rgba(57,74,126,0.1)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Build-in-public momentum
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              This week&apos;s publishing checklist
            </h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {BUILD_IN_PUBLIC_CHECKLIST.map((item, index) => {
                const done = index < checklistCompleted;
                return (
                  <div
                    key={item}
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      done
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-zinc-200 bg-white text-zinc-600"
                    }`}
                  >
                    <p className="font-semibold">{done ? "Done" : "Pending"}</p>
                    <p className="mt-1">{item}</p>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="gradient-card rounded-2xl border p-4 shadow-[0_12px_40px_rgba(57,74,126,0.12)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
              Open-source roadmap
            </p>
            <p className="mt-2 text-sm text-zinc-700">
              Help shape FeatureLogs by proposing workflow improvements for builders shipping in public.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href="https://github.com/rexdavinci/featurelogs/issues"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-indigo-700"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Propose feature
              </Link>
              <Link
                href="https://github.com/rexdavinci/featurelogs/pulls"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-indigo-700"
              >
                <Rocket className="h-3.5 w-3.5" />
                Explore PRs
              </Link>
            </div>
          </article>
        </section>

        <div className="relative z-10 flex flex-wrap items-center gap-2 border-b border-zinc-300/70 pb-3">
          <button
            type="button"
            onClick={() => switchPanel("generator")}
            className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
              panel === "generator"
                ? "bg-(--surface-muted) text-(--accent-strong)"
                : "bg-white/40 text-zinc-600 hover:bg-white/70"
            }`}
          >
            <Megaphone className="h-3.5 w-3.5" />
            Marketing Generator
          </button>
          <button
            type="button"
            onClick={() => switchPanel("templates")}
            className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
              panel === "templates"
                ? "bg-(--surface-muted) text-(--accent-strong)"
                : "bg-white/40 text-zinc-600 hover:bg-white/70"
            }`}
          >
            <WandSparkles className="h-3.5 w-3.5" />
            Tone & Style Templates
          </button>
        </div>

        <section className="grid gap-5 lg:grid-cols-[1.8fr_0.9fr]">
          <div className="space-y-5">
            {panel === "generator" ? (
              <>
                <article className="surface rounded-2xl border p-5 shadow-[0_12px_40px_rgba(59,45,28,0.08)]">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="mt-1 text-2xl font-semibold">
                        What did you build?
                      </h2>
                      <p className="mt-1 text-sm text-zinc-600">
                        Convert rough commits and notes into polished
                        distribution content.
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 rounded-2xl border bg-white/80 p-4">
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (!onboardingProjectName.trim()) return;

                        const formData = new FormData();
                        formData.append(
                          "name",
                          onboardingProjectName.trim(),
                        );
                        startOnboarding(async () => {
                          const result = await onboardProject(formData);
                          setOnboardingMessage(
                            result.ok ? "Project ready." : "",
                          );
                          setOnboardingError(
                            result.ok
                              ? ""
                              : (result.error ?? "Could not create project."),
                          );
                          if (result.ok) {
                            setOnboardingProjectName("");
                            router.refresh();
                          }
                        });
                      }}
                      className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
                    >
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                          New Project
                        </label>
                        <input
                          value={onboardingProjectName}
                          onChange={(event) =>
                            setOnboardingProjectName(event.target.value)
                          }
                          placeholder="Launch notes, product updates, internal name"
                          className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-(--accent)"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isOnboarding || !onboardingProjectName.trim()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--accent) px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-(--accent-strong) disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {isOnboarding ? "Creating..." : "Create Project"}
                      </button>
                    </form>
                    {onboardingMessage ? (
                      <p className="mt-3 text-sm text-(--accent-strong)">
                        {onboardingMessage}
                      </p>
                    ) : null}
                    {onboardingError ? (
                      <p className="mt-3 text-sm text-(--danger)">
                        {onboardingError}
                      </p>
                    ) : null}
                  </div>

                  {!hasProjects ? (
                    <p className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                      Add a project above, then generate your first changelog
                      package.
                    </p>
                  ) : null}

                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      const formData = new FormData();
                      formData.append("projectName", selectedProject);
                      formData.append("rawInput", rawNotes);
                      setState({ ok: false });

                      startTransition(async () => {
                        const result = await generatePackage(formData);
                        setState(result);
                        if (result.ok) {
                          setRawNotes("");
                          setSelectedPreset("");
                          router.refresh();
                        }
                      });
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Project Name
                      </label>
                      <select
                        name="projectName"
                        value={selectedProject}
                        onChange={(event) =>
                          setSelectedProject(event.target.value)
                        }
                        disabled={!hasProjects}
                        className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-(--accent) disabled:cursor-not-allowed disabled:bg-zinc-100"
                      >
                        {projects.map((project) => (
                          <option key={project.id} value={project.name}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                          Inspiration Preset <span className="text-zinc-400 lowercase">(optional)</span>
                        </label>
                        <select
                          value={selectedPreset}
                          onChange={(event) =>
                            setSelectedPreset(event.target.value)
                          }
                          className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-(--accent)"
                        >
                          <option value="">Select a preset...</option>
                          {PRESETS.map((preset) => (
                            <option key={preset.label} value={preset.label}>
                              {preset.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={applyPreset}
                        disabled={!selectedPreset}
                        className="inline-flex items-center justify-center gap-1 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {/* <Sparkles className="h-3.5 w-3.5" /> */}
                        Apply Preset
                      </button>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Raw Notes
                      </label>
                      <textarea
                        name="rawInput"
                        required
                        rows={8}
                        value={rawNotes}
                        onChange={(event) => setRawNotes(event.target.value)}
                        placeholder="Paste git logs, feature notes, bug fixes, and release bullets..."
                        className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-(--accent)"
                      />
                    </div>

                    {state.error ? (
                      <p className="max-h-40 overflow-y-auto rounded-xl border border-(--danger)/40 bg-(--danger)/10 p-3 text-sm text-(--danger) break-all whitespace-pre-wrap">
                        {state.error}
                      </p>
                    ) : null}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {/* <p className="text-xs text-zinc-500">Fair-use window: {formatUsageText(usageCount)}.</p> */}
                      <button
                        type="submit"
                        disabled={isPending || !hasProjects || !selectedProject}
                        className="rounded-xl bg-(--accent) px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-(--accent-strong) disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isPending
                          ? "Analyzing Pipeline..."
                          : "Generate Marketing Kit"}
                      </button>
                    </div>
                  </form>
                </article>

                <article className="surface max-h-[72vh] overflow-y-auto rounded-2xl border p-5 shadow-[0_12px_40px_rgba(59,45,28,0.08)]">
                  <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Distribution Hub
                  </p>
                  <Tabs.Root defaultValue="changelog" className="space-y-4">
                    <Tabs.List className="grid grid-cols-2 gap-2 rounded-xl border p-1 md:grid-cols-3">
                      <Tabs.Trigger
                        value="changelog"
                        className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold data-[state=active]:bg-(--surface-muted)"
                      >
                        <ScrollText className="h-3.5 w-3.5" />
                        Public Changelog
                      </Tabs.Trigger>
                      <Tabs.Trigger
                        value="twitter"
                        className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold data-[state=active]:bg-(--surface-muted)"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        Twitter Thread
                      </Tabs.Trigger>
                      <Tabs.Trigger
                        value="linkedin"
                        className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold data-[state=active]:bg-(--surface-muted)"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        LinkedIn Post
                      </Tabs.Trigger>
                      <Tabs.Trigger
                        value="faq"
                        className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold data-[state=active]:bg-(--surface-muted)"
                      >
                        <CircleHelp className="h-3.5 w-3.5" />
                        Help Center FAQ
                      </Tabs.Trigger>
                      <Tabs.Trigger
                        value="email"
                        className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold data-[state=active]:bg-(--surface-muted)"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Email Newsletter
                      </Tabs.Trigger>
                      <Tabs.Trigger
                        value="monthly"
                        className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold data-[state=active]:bg-(--surface-muted)"
                      >
                        <Newspaper className="h-3.5 w-3.5" />
                        Monthly Newsletter
                      </Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="changelog" className="space-y-3">
                      <div className="surface-muted min-h-44 rounded-xl border p-4 text-sm whitespace-pre-wrap">
                        {output?.changelog ??
                          "Generate content to preview your changelog here."}
                      </div>
                      <CopyButton value={output?.changelog ?? ""} />
                    </Tabs.Content>

                    <Tabs.Content value="twitter" className="space-y-3">
                      <div className="space-y-2 max-h-55 overflow-y-auto">
                        {tweets.map((tweet, idx) => (
                          <div
                            key={idx}
                            className="surface-muted rounded-xl border p-3 text-sm"
                          >
                            <p className="mb-2 font-mono text-xs text-zinc-500">
                              Message {idx + 1}/{tweets.length}
                            </p>
                            <p className="whitespace-pre-wrap">{tweet}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <CopyButton value={output?.twitter ?? ""} />
                        <a
                          href={`https://x.com/intent/tweet?text=${encodeURIComponent(tweets[0] ?? "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                        >
                          Share On X
                        </a>
                      </div>
                    </Tabs.Content>

                    <Tabs.Content value="linkedin" className="space-y-3">
                      <div className="rounded-xl border overflow-y-auto h-55">
                        <div className="surface-muted p-4 text-sm whitespace-pre-wrap">
                          {output?.linkedin ??
                            "Generate content to preview your LinkedIn post here."}
                        </div>
                      </div>
                      <CopyButton value={output?.linkedin ?? ""} />
                    </Tabs.Content>

                    <Tabs.Content value="faq" className="space-y-3">
                      <div className="rounded-xl border overflow-y-auto h-55">
                        <div className="surface-muted p-4 text-sm whitespace-pre-wrap">
                          {output?.helpFaq ??
                            "Generate a marketing kit to produce Help Center FAQ content."}
                        </div>
                      </div>
                      <CopyButton value={output?.helpFaq ?? ""} />
                    </Tabs.Content>

                    <Tabs.Content value="email" className="space-y-3">
                      <div className="rounded-xl border h-55 overflow-y-auto">
                        <div className="surface-muted p-4 text-sm whitespace-pre-wrap">
                          {output?.emailNewsletter ??
                            "Generate a marketing kit to produce Email Newsletter content."}
                        </div>
                      </div>
                      <CopyButton value={output?.emailNewsletter ?? ""} />
                    </Tabs.Content>

                    <Tabs.Content value="monthly" className="space-y-3">
                      <div className="relative rounded-xl border h-55 overflow-y-auto">
                        <div className="surface-muted min-h-44 p-4 text-sm whitespace-pre-wrap">
                          {monthlyText ||
                            "Generate your month-end newsletter from all changelogs with one click."}
                        </div>
                        {!monthlyText ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/55">
                            <button
                              type="button"
                              onClick={() => {
                                setMonthlyError("");
                                startMonthly(async () => {
                                  const result =
                                    await generateMonthlyNewsletter();
                                  if (!result.ok) {
                                    setMonthlyError(
                                      result.error ??
                                        "Could not generate monthly newsletter.",
                                    );
                                    return;
                                  }
                                  setMonthlyText(result.text ?? "");
                                  router.refresh();
                                });
                              }}
                              className="rounded-lg bg-(--accent) px-3 py-2 text-xs font-semibold text-white hover:bg-(--accent-strong) disabled:opacity-60"
                              disabled={isMonthlyPending}
                            >
                              {isMonthlyPending
                                ? "Generating Monthly Recap..."
                                : "Generate Monthly Newsletter"}
                            </button>
                          </div>
                        ) : null}
                      </div>
                      {monthlyError ? (
                        <p className="max-h-40 overflow-y-auto rounded-xl border border-(--danger)/40 bg-(--danger)/10 p-3 text-sm text-(--danger) break-all whitespace-pre-wrap">
                          {monthlyError}
                        </p>
                      ) : null}
                      {monthlyText ? <CopyButton value={monthlyText} /> : null}
                    </Tabs.Content>
                  </Tabs.Root>
                </article>
              </>
            ) : (
              <article className="surface rounded-2xl border p-5 shadow-[0_12px_40px_rgba(59,45,28,0.08)]">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">
                      Tone & Style Templates
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold">
                      Style guides and reusable voice
                    </h2>
                    <p className="mt-1 text-sm text-zinc-600">
                      Fine-tune tone, CTA, and hashtags for each output type.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTemplates(DEFAULT_STYLE_TEMPLATES);
                      setTemplateFeedback("Restored default template values.");
                    }}
                    className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    Restore Defaults
                  </button>
                </div>

                <div className="grid gap-5 lg:grid-cols-[0.9fr_1.6fr]">
                  <div className="space-y-2">
                    {TEMPLATE_ORDER.map((key) => {
                      const item = templates[key];
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setActiveTemplate(key)}
                          className={`w-full rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
                            activeTemplate === key
                              ? "bg-(--surface-muted) text-(--accent-strong)"
                              : "bg-white/70 text-zinc-700 hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 cursor-pointer">
                            <span>{item.label}</span>
                            {/* <span className="rounded-full bg-(--surface-muted) px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-600">
                              Editable
                            </span> */}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border bg-white/80 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">
                            {currentTemplate.label}
                          </p>
                          <p className="text-xs text-zinc-500">
                            Selected template
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setTemplateFeedback(
                              `Loaded ${currentTemplate.label}.`,
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Focus Template
                        </button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <label className="space-y-2 text-sm">
                          <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                            Tone
                          </span>
                          <textarea
                            rows={5}
                            value={currentTemplate.tone}
                            onChange={(event) =>
                              updateTemplateField("tone", event.target.value)
                            }
                            className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-(--accent)"
                          />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                            CTA
                          </span>
                          <textarea
                            rows={5}
                            value={currentTemplate.cta}
                            onChange={(event) =>
                              updateTemplateField("cta", event.target.value)
                            }
                            className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-(--accent)"
                          />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                            Hashtags
                          </span>
                          <textarea
                            rows={5}
                            value={currentTemplate.hashtags}
                            onChange={(event) =>
                              updateTemplateField(
                                "hashtags",
                                event.target.value,
                              )
                            }
                            className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-(--accent)"
                          />
                        </label>
                      </div>

                      {templateFeedback ? (
                        <p className="mt-4 rounded-xl border border-(--accent)/30 bg-(--accent)/10 p-3 text-sm text-(--accent-strong)">
                          {templateFeedback}
                        </p>
                      ) : null}

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <p className="text-xs text-zinc-500">
                          Save reusable template settings for the selected
                          project.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedProject) return;
                            startSaving(async () => {
                              const result = await saveStyleTemplates(
                                templates,
                                selectedProjectRecord?.id ?? "",
                              );
                              setTemplateFeedback(
                                result.ok
                                  ? "Saved template settings for this project."
                                  : (result.error ??
                                      "Could not save templates."),
                              );
                              if (result.ok) router.refresh();
                            });
                          }}
                          disabled={isSaving || !selectedProject}
                          className="rounded-xl bg-(--accent) px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-(--accent-strong) disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isSaving ? "Saving..." : "Save Templates"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-8 lg:h-fit">
            <article className="surface rounded-2xl border p-5 shadow-[0_12px_40px_rgba(59,45,28,0.08)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  Workspace note
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full border bg-white px-2.5 py-1 text-[11px] font-semibold text-(--accent-strong)">
                  <Plus className="h-3.5 w-3.5" />
                  Local workspace
                </span>
              </div>

              <p className="text-sm leading-7 text-zinc-700">
                Create a project, generate release copy, and save reusable voice
                settings without signing in.
              </p>

              <div className="mt-4 rounded-2xl border bg-(--surface-muted) p-4 text-sm text-zinc-700">
                <p className="font-semibold text-foreground">
                  How it stores data
                </p>
                <p className="mt-2 leading-7">
                  Your projects, drafts, and templates are stored in Firestore
                  under your local visitor session.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href="/faq"
                    className="inline-flex rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                    FAQ
                  </Link>
                  <Link
                    href="/terms"
                    className="inline-flex rounded-lg border bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    <Rocket className="mr-1.5 h-3.5 w-3.5" />
                    Terms
                  </Link>
                </div>
              </div>
            </article>

            <article className="surface rounded-2xl border p-5 shadow-[0_12px_40px_rgba(59,45,28,0.08)]">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
                Recent projects
              </p>
              <div className="mt-3 space-y-2">
                {projects.length ? (
                  projects.slice(0, 4).map((project) => (
                    <div
                      key={project.id}
                      className="rounded-xl border bg-white px-3 py-2 text-sm text-zinc-700"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{project.name}</span>
                        <span className="text-xs text-zinc-500">
                          {formatDate(project.updatedAt)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-600">
                    Add your first project to get started.
                  </p>
                )}
              </div>
            </article>

            <article className="surface rounded-2xl border p-5 shadow-[0_12px_40px_rgba(59,45,28,0.08)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Latest drafts
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">Recent outputs</h3>
                </div>
                <Clock3 className="h-4 w-4 text-(--accent-strong)" />
              </div>
              <div className="space-y-3">
                {latestThree.length ? (
                  latestThree.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border bg-white/80 p-3 text-sm text-zinc-700"
                    >
                      <p className="font-semibold text-foreground">
                        {item.projectName}
                      </p>
                      <p className="mt-1 line-clamp-3 text-zinc-600">
                        {item.rawInput}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-600">
                    Generated content will show up here.
                  </p>
                )}
              </div>
            </article>
          </aside>
        </section>
      </div>
    </main>
  );
}
