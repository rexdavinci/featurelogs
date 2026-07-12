"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import * as Tabs from "@radix-ui/react-tabs";
import {
  CalendarRange,
  CircleHelp,
  Copy,
  CreditCard,
  Link2,
  LogOut,
  Mail,
  Megaphone,
  MessageCircle,
  Newspaper,
  Rocket,
  ScrollText,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { PREMIUM_LIMITS } from "@/utils/tiers";
import {
  generateMonthlyNewsletter,
  generatePackage,
  logout,
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

type LogRow = {
  id: string;
  project_id: string;
  created_at: string;
  raw_input: string;
  output_changelog: string;
  output_twitter: string;
  output_linkedin: string;
  output_help_faq: string | null;
  output_email_newsletter: string | null;
  projects: Array<{ project_name: string }> | null;
};

type ProjectOption = {
  id: string;
  project_name: string;
  created_at: string;
};

type Props = {
  email: string;
  isSubscribed: boolean;
  usageCount: number;
  logs: LogRow[];
  projects: ProjectOption[];
  styleTemplates: StyleTemplates;
};

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
      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
    >
      <Copy className="h-3.5 w-3.5" />
      {done ? "Copied" : "Copy"}
    </button>
  );
}

export default function DashboardClient({
  email,
  isSubscribed,
  usageCount,
  logs,
  projects,
  styleTemplates,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [isMonthlyPending, startMonthly] = useTransition();
  const [isOnboarding, startOnboarding] = useTransition();

  const [state, setState] = useState<GenerationState>({ ok: false });
  const [panel, setPanel] = useState<"generator" | "voice" | "planner">(
    "generator",
  );
  const [templates, setTemplates] = useState<StyleTemplates>(styleTemplates);
  const [activeTemplate, setActiveTemplate] =
    useState<TemplateKey>("changelog");
  const [templateFeedback, setTemplateFeedback] = useState("");
  const [monthlyText, setMonthlyText] = useState("");
  const [monthlyError, setMonthlyError] = useState("");

  const [selectedProject, setSelectedProject] = useState(
    projects[0]?.project_name ?? "",
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
          changelog: newest.output_changelog,
          twitter: newest.output_twitter,
          linkedin: newest.output_linkedin,
          helpFaq: newest.output_help_faq ?? "",
          emailNewsletter: newest.output_email_newsletter ?? "",
        }
      : null);

  const tweets = useMemo(
    () => splitToTweets(output?.twitter ?? "", isSubscribed ? 10 : 1),
    [output?.twitter, isSubscribed],
  );

  const latestThree = logs.slice(0, 3);
  const currentTemplate = templates[activeTemplate];
  const isTemplatePremiumOnly = Boolean(currentTemplate?.premiumOnly);

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

  function switchPanel(nextPanel: "generator" | "voice" | "planner") {
    setPanel(nextPanel);
  }

  const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const DATETIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  function formatDate(dateString: string) {
    return DATE_FORMATTER.format(new Date(dateString));
  }

  function formatDateTime(dateString: string) {
    return DATETIME_FORMATTER.format(new Date(dateString));
  }

  return (
    <main className="relative overflow-hidden px-6 py-8 sm:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-28 top-20 h-64 w-64 rounded-full bg-(--accent)/10 blur-3xl" />
        <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-(--accent-strong)/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl">
        <Header isSubscribed={isSubscribed} usageCount={usageCount} />
        {/* <header className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/feature-logs.svg"
              alt="FeatureLogs Logo"
              width={30}
              height={30}
              style={{ height: "auto" }}
            />
            <div>
              <p className="text-lg font-semibold">FeatureLogs</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Build In Public Engine
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border bg-white/80 px-3 py-1 text-xs font-semibold text-zinc-700">
              {formatUsageText(isSubscribed, usageCount)}
            </span>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1 rounded-full border bg-white/80 px-3 py-1 cursor-pointer text-xs font-semibold text-zinc-700 hover:bg-white/20"
            >
              <CreditCard className="h-3.5 w-3.5" />
              Billing
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center gap-1 rounded-full border bg-white/80 px-3 py-1 cursor-pointer text-xs font-semibold text-zinc-700 hover:bg-white/20"
            >
              <CircleHelp className="h-3.5 w-3.5" />
              FAQ
            </Link>
            <button
              type="button"
              onClick={() => {
                startTransition(async () => {
                  await logout();
                  window.location.href = "/";
                });
              }}
              className="inline-flex items-center gap-1 rounded-full border bg-white/80 px-3 cursor-pointer py-1 text-xs font-semibold text-zinc-700 hover:bg-white/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </header> */}

        <div className="relative z-10 mb-5 flex flex-wrap items-center gap-2 border-b border-zinc-300/70 pb-3">
          <button
            type="button"
            onClick={() => switchPanel("generator")}
            onTouchEnd={() => switchPanel("generator")}
            className={`inline-flex items-center gap-1 cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-semibold ${
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
            onClick={() => switchPanel("voice")}
            onTouchEnd={() => switchPanel("voice")}
            className={`inline-flex items-center gap-1 cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-semibold ${
              panel === "voice"
                ? "bg-(--surface-muted) text-(--accent-strong)"
                : "bg-white/40 text-zinc-600 hover:bg-white/70"
            }`}
          >
            <WandSparkles className="h-3.5 w-3.5" />
            Tone & Style Templates
          </button>
          {/* <button
            type="button"
            onClick={() => setPanel("planner")}
            className={`inline-flex items-center gap-1 cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-semibold ${
              panel === "planner"
                ? "bg-(--surface-muted) text-(--accent-strong)"
                : "bg-white/40 text-zinc-600 hover:bg-white/70"
            }`}
          >
            <CalendarRange className="h-3.5 w-3.5" />
            Content Release Planner
          </button> */}
          <span className="ml-auto text-xs text-zinc-500">
            Signed in as {email}
          </span>
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

                  {!hasProjects ? (
                    <p className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                      You need at least one onboarded project before generating
                      content.{" "}
                      <a href="#onboard" className="font-semibold underline">
                        Onboard a project
                      </a>{" "}
                      to get started.
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
                          window.location.reload();
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
                          <option key={project.id} value={project.project_name}>
                            {project.project_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                          Inspiration Preset
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
                        <Sparkles className="h-3.5 w-3.5" />
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
                        placeholder="Paste git logs, feature notes, and bug fixes..."
                        className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-(--accent)"
                      />
                    </div>

                    {state.error ? (
                      <p className="rounded-xl border border-(--danger)/40 bg-(--danger)/10 p-3 text-sm text-(--danger)">
                        {state.error}
                      </p>
                    ) : null}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-zinc-500">
                        {isSubscribed ? "Premium Usage" : "Free Usage"}:{" "}
                        {usageCount} runs in current window
                      </p>
                      <button
                        type="submit"
                        disabled={isPending || !hasProjects || !selectedProject}
                        className="rounded-xl bg-(--accent) px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-(--accent-strong) cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
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
                      <div className="surface-muted min-h-44 rounded-xl border p-4 text-sm whitespace-pre-wrap h-55 overflow-y-auto">
                        {output?.changelog ??
                          "Generate content to preview your changelog here."}
                      </div>
                      <CopyButton value={output?.changelog ?? ""} />
                    </Tabs.Content>

                    <Tabs.Content value="twitter" className="space-y-3">
                      <div className="space-y-2 h-55 overflow-y-auto">
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
                    </Tabs.Content>
                    <Tabs.Content value="twitter">
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
                      {!isSubscribed ? (
                        <p className="text-xs text-zinc-500 mt-3">
                          Free tier exports one Twitter message. Premium unlocks
                          up to 4 meaningful threads.
                        </p>
                      ) : null}
                    </Tabs.Content>

                    <Tabs.Content value="linkedin" className="space-y-3">
                      <div className="relative overflow-hidden rounded-xl border overflow-y-auto h-55">
                        <div
                          className={`surface-muted p-4 text-sm whitespace-pre-wrap ${isSubscribed ? "" : "blur-sm select-none"}`}
                        >
                          {isSubscribed
                            ? output?.linkedin
                            : "Generate content to preview your LinkedIn post here."}
                        </div>
                        {!isSubscribed ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/55">
                            <Link
                              href="/pricing"
                              className="rounded-xl bg-(--accent) px-4 py-2 text-sm font-semibold text-white hover:bg-(--accent-strong)"
                            >
                              Premium Required
                            </Link>
                          </div>
                        ) : null}
                      </div>
                      {isSubscribed ? (
                        <CopyButton value={output?.linkedin ?? ""} />
                      ) : null}
                    </Tabs.Content>

                    <Tabs.Content value="faq" className="space-y-3">
                      <div className="relative overflow-hidden rounded-xl border overflow-y-auto h-55">
                        <div
                          className={`surface-muted p-4 text-sm whitespace-pre-wrap ${isSubscribed ? "" : "blur-sm select-none"}`}
                        >
                          {isSubscribed
                            ? output?.helpFaq
                            : "Generate a marketing kit to produce Help Center FAQ content."}
                        </div>
                        {!isSubscribed ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/55">
                            <Link
                              href="/pricing"
                              className="rounded-xl bg-(--accent) px-4 py-2 text-sm font-semibold text-white hover:bg-(--accent-strong)"
                            >
                              Premium Required
                            </Link>
                          </div>
                        ) : null}
                      </div>
                      {isSubscribed ? (
                        <CopyButton value={output?.helpFaq ?? ""} />
                      ) : null}
                    </Tabs.Content>

                    <Tabs.Content value="email" className="space-y-3">
                      <div
                        className={`relative overflow-hidden rounded-xl border h-55 ${isSubscribed ? "overflow-y-auto" : ""}`}
                      >
                        <div
                          className={`surface-muted p-4 text-sm whitespace-pre-wrap ${isSubscribed ? "" : "blur-sm select-none"}`}
                        >
                          {isSubscribed
                            ? output?.emailNewsletter
                            : "Generate a marketing kit to produce Email Newsletter content."}
                        </div>
                        {!isSubscribed ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/55">
                            <Link
                              href="/pricing"
                              className="rounded-xl bg-(--accent) px-4 py-2 text-sm font-semibold text-white hover:bg-(--accent-strong)"
                            >
                              Premium Required
                            </Link>
                          </div>
                        ) : null}
                      </div>
                      {isSubscribed ? (
                        <CopyButton value={output?.emailNewsletter ?? ""} />
                      ) : null}
                    </Tabs.Content>

                    <Tabs.Content value="monthly" className="space-y-3">
                      <div className="relative rounded-xl border h-55 overflow-y-auto">
                        <div
                          className={`surface-muted min-h-44 p-4 text-sm whitespace-pre-wrap ${isSubscribed ? "" : "blur-sm select-none"}`}
                        >
                          {isSubscribed
                            ? monthlyText
                            : "Generate your month-end newsletter from all changelogs with one click."}
                        </div>
                        {!isSubscribed ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/55">
                            <Link
                              href="/pricing"
                              className="rounded-xl bg-(--accent) px-4 py-2 text-sm font-semibold text-white hover:bg-(--accent-strong)"
                            >
                              Premium Required
                            </Link>
                          </div>
                        ) : isSubscribed && !monthlyText ? (
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
                        <p className="rounded-xl border border-(--danger)/40 bg-(--danger)/10 p-3 text-sm text-(--danger)">
                          {monthlyError}
                        </p>
                      ) : null}
                      {isSubscribed && monthlyText ? (
                        <CopyButton value={monthlyText} />
                      ) : null}
                    </Tabs.Content>
                  </Tabs.Root>
                </article>
              </>
            ) : null}

            {panel === "voice" ? (
              <article className="surface rounded-2xl border p-5 shadow-[0_12px_40px_rgba(59,45,28,0.08)]">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">
                      Tone & Style Templates
                    </p>
                    <h2 className="mt-1 text-2xl font-semibold">
                      Style Guides & Custom Templates
                    </h2>
                    <p className="mt-1 text-sm text-zinc-600">
                      Fine-tune voice, CTA, and hashtags for every output type.
                    </p>
                  </div>
                  {projects.length >= 1 && (
                    <div>
                      <select
                        name="projectName"
                        value={selectedProject}
                        onChange={(event) =>
                          setSelectedProject(event.target.value)
                        }
                        disabled={!hasProjects}
                        // className="rounded-lg border bg-white px-3 py-2 text-xs font-semibold"
                        className="w-full rounded-xl border bg-white px-3 py-2 font-semibold text-xs outline-none focus:border-(--accent) disabled:cursor-not-allowed disabled:bg-zinc-100"
                      >
                        {projects.map((project) => (
                          <option key={project.id} value={project.project_name}>
                            {project.project_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
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

                {!isSubscribed ? (
                  <div className="mb-4 rounded-xl border border-(--danger)/25 bg-(--danger)/10 p-3 text-sm text-(--danger)">
                    Premium required. Upgrade to save and apply custom voice
                    templates.
                  </div>
                ) : null}

                <div className="grid gap-5 lg:grid-cols-[0.9fr_1.6fr]">
                  <div className="space-y-2">
                    {TEMPLATE_ORDER.map((key) => {
                      const item = templates[key];
                      const locked = Boolean(item.premiumOnly) && !isSubscribed;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setActiveTemplate(key)}
                          className={`w-full rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
                            activeTemplate === key
                              ? "bg-(--surface-muted) text-(--accent-strong)"
                              : "bg-white text-zinc-700 hover:bg-zinc-50"
                          } ${locked ? "opacity-70" : ""}`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{item.label}</span>
                            {locked ? (
                              <span className="text-[10px] uppercase tracking-wider">
                                Pro
                              </span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                    <div className="rounded-xl border bg-(--surface-muted)/80 p-3 text-xs leading-6 text-zinc-600">
                      Your saved style guides are injected into generation
                      prompts for consistent tone.
                    </div>
                  </div>

                  <div className="relative rounded-2xl border bg-white p-4">
                    <div
                      className={`space-y-4 ${isTemplatePremiumOnly && !isSubscribed ? "blur-sm select-none" : ""}`}
                    >
                      <p className="font-mono text-xs uppercase tracking-[0.18em] text-(--accent-strong)">
                        {currentTemplate.label} Settings
                      </p>

                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                          Style Guide & Tone Instructions
                        </label>
                        <textarea
                          value={currentTemplate.tone}
                          onChange={(event) =>
                            updateTemplateField("tone", event.target.value)
                          }
                          rows={4}
                          className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-(--accent)"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                          Call To Action (CTA)
                        </label>
                        <textarea
                          value={currentTemplate.cta}
                          onChange={(event) =>
                            updateTemplateField("cta", event.target.value)
                          }
                          rows={3}
                          className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-(--accent)"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                          Preferred Hashtags
                        </label>
                        <span className="mb-1 block text-xs text-zinc-500">
                          List hashtags to include. Separate with spaces
                          (applicable mainly to LinkedIn and Twitter/X threads).
                        </span>
                        <input
                          value={currentTemplate.hashtags}
                          onChange={(event) =>
                            updateTemplateField("hashtags", event.target.value)
                          }
                          className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-(--accent)"
                        />
                      </div>

                      {templateFeedback ? (
                        <p className="text-xs text-zinc-600">
                          {templateFeedback}
                        </p>
                      ) : null}

                      <div className="flex justify-end">
                        <button
                          type="button"
                          disabled={isSaving || !isSubscribed}
                          onClick={() => {
                            setTemplateFeedback("");
                            startSaving(async () => {
                              const result = await saveStyleTemplates(
                                templates,
                                projects.find(
                                  (p) => p.project_name === selectedProject,
                                )?.id ?? "",
                              );
                              if (!result.ok) {
                                setTemplateFeedback(
                                  result.error ?? "Could not save templates.",
                                );
                                return;
                              }
                              setTemplateFeedback(
                                "Style template configuration saved.",
                              );
                            });
                          }}
                          className="rounded-xl bg-(--accent) px-4 py-2 text-sm font-semibold text-white hover:bg-(--accent-strong) disabled:opacity-60"
                        >
                          {isSaving ? "Saving..." : "Save Configurations"}
                        </button>
                      </div>
                    </div>

                    {isTemplatePremiumOnly && !isSubscribed ? (
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70">
                        <Link
                          href="/pricing"
                          className="rounded-xl bg-(--accent) px-4 py-2 text-sm font-semibold text-white hover:bg-(--accent-strong)"
                        >
                          Upgrade To Edit Premium Template
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            ) : null}

            {/* {panel === "planner" ? (
              <article className="surface rounded-2xl border p-5 shadow-[0_12px_40px_rgba(59,45,28,0.08)]">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">
                  Content Release Planner
                </p>
                <h2 className="mt-1 text-2xl font-semibold">
                  Schedule, Upgrade, and Publish
                </h2>
                <p className="mt-2 text-sm leading-7 text-zinc-600">
                  Premium unlocks LinkedIn, FAQ, Email, Monthly newsletter, and
                  full Tone & Style template customization.
                </p>
                <Link
                  href="/pricing"
                  className="mt-5 inline-flex rounded-xl bg-(--accent) px-4 py-2 text-sm font-semibold text-white hover:bg-(--accent-strong)"
                >
                  Open Billing Portal
                </Link>
              </article>
            ) : null} */}
          </div>

          <aside className="space-y-5">
            <article
              id="onboard"
              className="surface rounded-2xl border p-5 shadow-[0_12px_40px_rgba(59,45,28,0.08)]"
            >
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-zinc-500">
                Project Onboarding
              </p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setOnboardingError("");
                  setOnboardingMessage("");

                  const formData = new FormData();
                  formData.append("projectName", onboardingProjectName);

                  startOnboarding(async () => {
                    const result = await onboardProject(formData);
                    if (!result.ok) {
                      setOnboardingError(
                        result.error ?? "Could not onboard project.",
                      );
                      return;
                    }
                    setOnboardingProjectName("");
                    setOnboardingMessage(
                      "Project onboarded successfully. Refreshing list...",
                    );
                    window.location.reload();
                  });
                }}
                className="mt-3 space-y-3"
              >
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-xl border bg-(--surface-muted)/70 p-3 text-sm text-zinc-600"
                  >
                    <div className="flex justify-between">
                      <p className="flex flex-col justify-items-center justify-center font-bold">
                        {project.project_name}{" "}
                      </p>
                      <div className="flex flex-col">
                        <span className="text-xs text-center">Added on</span>
                        <span className="float-right text-sm">{`${formatDate(project.created_at)}`}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {(isSubscribed &&
                  projects.length <= PREMIUM_LIMITS.projectCap) ||
                (!isSubscribed && projects.length === 0) ? (
                  <>
                    <input
                      name="projectName"
                      required
                      placeholder="My SaaS Project"
                      value={onboardingProjectName}
                      onChange={(event) =>
                        setOnboardingProjectName(event.target.value)
                      }
                      className="w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:border-(--accent)"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 rounded-xl bg-(--accent) px-4 py-2 text-sm font-semibold text-white hover:bg-(--accent-strong) disabled:opacity-60"
                    >
                      <Rocket className="h-3.5 w-3.5" />
                      {isOnboarding ? "Onboarding..." : "Onboard Project"}
                    </button>
                  </>
                ) : !isSubscribed ? (
                  <div>
                    {projects.length === 1 ? (
                      <p className="mt-1 text-xs text-zinc-600 text-center">
                        You have reached the limit of onboarded projects.
                      </p>
                    ) : null}
                    <div className="flex justify-center items-center">
                      <Link
                        href="/pricing"
                        className="border mt-2 items-center gap-1 rounded-xl bg-(--accent) px-4 py-2 text-sm font-semibold text-white hover:bg-(--accent-strong) disabled:opacity-60"
                      >
                        Upgrade to Onboard More
                      </Link>
                    </div>
                  </div>
                ) : null}
              </form>
              {onboardingError ? (
                <p className="mt-3 rounded-xl border border-(--danger)/40 bg-(--danger)/10 p-3 text-sm text-(--danger)">
                  {onboardingError}
                </p>
              ) : null}
              {onboardingMessage ? (
                <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  {onboardingMessage}
                </p>
              ) : null}
            </article>
            <article className="surface rounded-2xl border p-5 shadow-[0_12px_40px_rgba(59,45,28,0.08)]">
              <div className="mb-4 flex items-center justify-between gap-2">
                <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
                  History Log
                </p>
                <span className="rounded-full border bg-(--surface-muted) px-2.5 py-1 text-[11px] font-semibold text-zinc-600">
                  {logs.length} Saved
                </span>
              </div>

              {latestThree.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-(--surface-muted)/70 p-6 text-center text-sm text-zinc-500">
                  No saved generations yet. Your updates appear here once you
                  generate your first marketing kit.
                </div>
              ) : (
                <div className="space-y-3">
                  {latestThree.map((log) => {
                    return (
                      <article
                        key={log.id}
                        className="rounded-xl border bg-white p-3"
                      >
                        <p className="text-sm font-semibold">
                          [
                          {projects.find(
                            (project) => project.id === log.project_id,
                          )?.project_name ?? "Untitled Project"}
                          ]
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-600">
                          {log.raw_input}
                        </p>
                        <p className="mt-2 font-mono text-[11px] text-zinc-500">
                          {formatDateTime(log.created_at)}
                        </p>
                      </article>
                    );
                  })}
                </div>
              )}

              <p className="mt-4 text-xs text-zinc-500">
                Synced securely with your FeatureLogs workspace.
              </p>
            </article>

            {/* <article className="surface rounded-2xl border p-5 shadow-[0_12px_40px_rgba(59,45,28,0.08)]">
              <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-zinc-500">
                History Log
              </p>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {logs.length === 0 ? (
                  <p className="text-sm text-zinc-600">
                    No logs yet. Generate your first marketing kit above.
                  </p>
                ) : null}
                {logs.map((log) => (
                  <article
                    key={log.id}
                    className="rounded-xl border bg-white p-3"
                  >
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold">
                        {log.projects?.[0]?.project_name ?? "Untitled Project"}
                      </p>
                      <p className="font-mono text-[11px] text-zinc-500">
                        {formatDate(log.created_at)}
                      </p>
                    </div>
                    <p className="line-clamp-2 text-xs text-zinc-600">
                      {log.raw_input}
                    </p>
                  </article>
                ))}
              </div>
            </article> */}
          </aside>
        </section>
      </div>
    </main>
  );
}
