"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  FileText,
  Folder,
  Loader2,
  Plus,
  RotateCcw,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import type { LogRecord, Project } from "@/lib/types";
import { FAIR_USE_LIMITS, formatUsageText } from "@/utils/tiers";
import {
  DEFAULT_STYLE_TEMPLATES,
  TEMPLATE_ORDER,
  type StyleTemplates,
  type TemplateKey,
} from "@/utils/style-templates";
import { PRESETS } from "@/utils/presets";
import { Header } from "../components/Header";
import {
  MarketingKit,
  kitFromLog,
  type KitOutput,
} from "../components/MarketingKit";
import { DraftModal } from "../components/DraftModal";
import { ProjectPicker } from "../components/ProjectPicker";
import {
  generateMonthlyNewsletter,
  generatePackage,
  loadProjectStyleTemplates,
  onboardProject,
  saveStyleTemplates,
} from "./actions";

type Props = {
  userEmail?: string | null;
  usageCount: number;
  logs: LogRecord[];
  projects: Project[];
  styleTemplates: StyleTemplates;
};

function displayDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export default function DashboardClient({
  userEmail,
  usageCount,
  logs,
  projects,
  styleTemplates,
}: Props) {
  const router = useRouter();
  const [isPending, startGeneration] = useTransition();
  const [isSaving, startSaving] = useTransition();
  const [isMonthlyPending, startMonthly] = useTransition();
  const [isOnboarding, startOnboarding] = useTransition();
  const [isLoadingTemplates, startLoadingTemplates] = useTransition();
  const [panel, setPanel] = useState<"generator" | "templates">("generator");
  const [selectedProjectId, setSelectedProjectId] = useState(
    projects[0]?.id ?? "",
  );
  const selectedIdRef = useRef(selectedProjectId);
  const [templateCache, setTemplateCache] = useState<
    Record<string, StyleTemplates>
  >(() => (projects[0] ? { [projects[0].id]: styleTemplates } : {}));
  const [activeTemplate, setActiveTemplate] =
    useState<TemplateKey>("changelog");
  const [templateFeedback, setTemplateFeedback] = useState("");
  const [templateError, setTemplateError] = useState("");
  const [rawNotes, setRawNotes] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [projectName, setProjectName] = useState("");
  const [showProjectForm, setShowProjectForm] = useState(projects.length === 0);
  const [projectError, setProjectError] = useState("");
  const [generationError, setGenerationError] = useState("");
  const [generated, setGenerated] = useState<{
    projectId: string;
    output: KitOutput;
    createdAt: string;
  } | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<LogRecord | null>(null);
  const [monthlyText, setMonthlyText] = useState("");
  const [monthlyError, setMonthlyError] = useState("");
  const kitRef = useRef<HTMLDivElement>(null);

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId,
  );
  const newest = logs.find((log) => log.projectId === selectedProjectId);
  const currentGenerated =
    generated?.projectId === selectedProjectId ? generated : null;
  const output =
    currentGenerated?.output ?? (newest ? kitFromLog(newest) : null);
  const templates = templateCache[selectedProjectId] ?? DEFAULT_STYLE_TEMPLATES;
  const currentTemplate = templates[activeTemplate];
  const remainingCredits = Math.max(FAIR_USE_LIMITS.periodCap - usageCount, 0);
  const projectLogs = logs.filter((log) => log.projectId === selectedProjectId);

  function selectProject(id: string) {
    selectedIdRef.current = id;
    setSelectedProjectId(id);
    setGenerationError("");
    setTemplateFeedback("");
    setTemplateError("");
    if (!id || templateCache[id]) return;
    startLoadingTemplates(async () => {
      try {
        const result = await loadProjectStyleTemplates(id);
        if (result.ok)
          setTemplateCache((cache) => ({ ...cache, [id]: result.templates }));
        else if (selectedIdRef.current === id) setTemplateError(result.error);
      } catch {
        if (selectedIdRef.current === id)
          setTemplateError(
            "Couldn’t load your voice settings. Select the project again to retry.",
          );
      }
    });
  }

  function updateTemplate(field: "tone" | "cta" | "hashtags", value: string) {
    setTemplateCache((cache) => ({
      ...cache,
      [selectedProjectId]: {
        ...templates,
        [activeTemplate]: { ...currentTemplate, [field]: value },
      },
    }));
    setTemplateFeedback("You have unsaved changes.");
  }

  return (
    <main className="workspace-shell workspace-v2">
      <Header usageCount={usageCount} userEmail={userEmail} />
      <div className="workspace-heading-row">
        <div className="workspace-heading">
          <p className="workspace-eyebrow">YOUR BUILD-IN-PUBLIC STUDIO</p>
          <h1>Make your progress visible.</h1>
          <p>
            A little less staring at a blank page. A little more sharing what
            you shipped.
          </p>
        </div>
        <span className="workspace-date">
          <span className="status-dot" /> Ready when you are
        </span>
      </div>

      <div className="studio-layout">
        <aside className="studio-sidebar">
          <section className="studio-project-panel">
            <div className="sidebar-section-heading">
              <h2>Your project</h2>
              <button
                type="button"
                className="icon-button"
                aria-label={
                  showProjectForm
                    ? "Hide new project form"
                    : "Create a new project"
                }
                aria-expanded={showProjectForm}
                onClick={() => setShowProjectForm(!showProjectForm)}
                disabled={isPending}
              >
                <Plus size={17} />
              </button>
            </div>
            <ProjectPicker
              projects={projects}
              value={selectedProjectId}
              disabled={
                !projects.length || isPending || isSaving || isOnboarding
              }
              onChange={selectProject}
            />
            {showProjectForm && (
              <form
                className="new-project-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!projectName.trim()) return;
                  const formData = new FormData();
                  formData.set("name", projectName.trim());
                  setProjectError("");
                  startOnboarding(async () => {
                    try {
                      const result = await onboardProject(formData);
                      if (!result.ok) {
                        setProjectError(
                          result.error ?? "Couldn’t create your project.",
                        );
                        return;
                      }
                      if (result.projectId) selectProject(result.projectId);
                      setProjectName("");
                      setShowProjectForm(false);
                      router.refresh();
                    } catch {
                      setProjectError(
                        "Couldn’t create your project. Please try again.",
                      );
                    }
                  });
                }}
              >
                <label htmlFor="new-project">Project name</label>
                <input
                  id="new-project"
                  required
                  maxLength={120}
                  autoComplete="off"
                  placeholder="Your next big thing"
                  value={projectName}
                  disabled={isOnboarding}
                  onChange={(event) => setProjectName(event.target.value)}
                />
                <button
                  className="button button-dark"
                  disabled={
                    isOnboarding || !projectName.trim() || remainingCredits < 1
                  }
                >
                  {isOnboarding ? (
                    <Loader2 className="spin" size={14} />
                  ) : (
                    <Plus size={14} />
                  )}
                  {isOnboarding ? "Creating…" : "Create project"}
                </button>
                <p className="field-hint">
                  Creating a new project uses 1 credit.
                </p>
              </form>
            )}
            {projectError && (
              <p className="workspace-feedback error" role="alert">
                {projectError}
              </p>
            )}
            <nav className="studio-navigation" aria-label="Workspace sections">
              <button
                type="button"
                aria-pressed={panel === "generator"}
                onClick={() => setPanel("generator")}
              >
                <Sparkles size={17} /> Create a kit <ArrowRight size={14} />
              </button>
              <button
                type="button"
                aria-pressed={panel === "templates"}
                onClick={() => setPanel("templates")}
              >
                <WandSparkles size={17} /> Voice & style{" "}
                <ArrowRight size={14} />
              </button>
            </nav>
          </section>

          <section className="draft-history">
            <div className="sidebar-section-heading">
              <h2>Latest drafts</h2>
              <span className="subtle-count">{logs.length}</span>
            </div>
            <p className="sidebar-description">Pick up where you left off.</p>
            {logs.length ? (
              <div className="draft-list">
                {logs.slice(0, 6).map((draft) => (
                  <button
                    type="button"
                    className="draft-item"
                    key={draft.id}
                    onClick={() => setSelectedDraft(draft)}
                    aria-label={`Open ${draft.projectName} draft from ${displayDate(draft.createdAt)}`}
                  >
                    <span className="draft-icon">
                      <FileText size={17} />
                    </span>
                    <span className="draft-item-copy">
                      <strong>{draft.projectName}</strong>
                      <span>{draft.rawInput}</span>
                      <small>
                        <Clock3 size={11} />
                        {displayDate(draft.createdAt)}{" "}
                        <span aria-hidden="true">·</span> Marketing kit
                      </small>
                    </span>
                    <ArrowUpRight size={14} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="draft-history-empty">
                <FileText size={22} strokeWidth={1.3} />
                <p>Your first kit will find a home here.</p>
              </div>
            )}
          </section>

          <section className="studio-usage">
            <div>
              <span>Daily credits</span>
              <strong>
                {remainingCredits}
                <span> / {FAIR_USE_LIMITS.periodCap}</span>
              </strong>
            </div>
            <div
              className="usage-track"
              role="meter"
              aria-label="Credits remaining"
              aria-valuenow={remainingCredits}
              aria-valuemin={0}
              aria-valuemax={FAIR_USE_LIMITS.periodCap}
            >
              <span
                style={{
                  width: `${(remainingCredits / FAIR_USE_LIMITS.periodCap) * 100}%`,
                }}
              />
            </div>
            <p>{formatUsageText(usageCount)}</p>
            {remainingCredits < 2 && (
              <p className="credit-warning">
                A kit needs 2 credits. Credits return as usage leaves the
                rolling 24-hour window.
              </p>
            )}
          </section>
          <Link href="/faq" className="sidebar-help">
            A little guidance <ArrowUpRight size={13} />
          </Link>
        </aside>

        <div className="studio-main">
          {panel === "generator" ? (
            <>
              <section className="studio-composer">
                <div className="composer-heading">
                  <span className="composer-step">01</span>
                  <div>
                    <h2>What did you ship?</h2>
                    <p>Rough notes in. A story worth sharing out.</p>
                  </div>
                  <span className="composer-draft-badge">
                    {selectedProject?.name ?? "Your next project"}
                  </span>
                </div>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (
                      !selectedProject ||
                      !rawNotes.trim() ||
                      remainingCredits < 2
                    )
                      return;
                    const id = selectedProject.id;
                    const formData = new FormData();
                    formData.set("projectName", selectedProject.name);
                    formData.set("rawInput", rawNotes);
                    setGenerationError("");
                    startGeneration(async () => {
                      try {
                        const result = await generatePackage(formData);
                        if (!result.ok || !result.payload) {
                          setGenerationError(
                            result.error ??
                              "Couldn’t create your kit. Your notes are still here — try again.",
                          );
                          return;
                        }
                        setGenerated({
                          projectId: id,
                          output: result.payload,
                          createdAt: new Date().toISOString(),
                        });
                        router.refresh();
                        kitRef.current?.scrollIntoView({
                          behavior: window.matchMedia(
                            "(prefers-reduced-motion: reduce)",
                          ).matches
                            ? "instant"
                            : "smooth",
                          block: "start",
                        });
                      } catch {
                        setGenerationError(
                          "The connection was interrupted. Your notes are still here — please try again.",
                        );
                      }
                    });
                  }}
                >
                  <label htmlFor="release-notes" className="sr-only">
                    What did you ship? Release notes
                  </label>
                  <textarea
                    id="release-notes"
                    className="notes-editor"
                    required
                    rows={7}
                    value={rawNotes}
                    disabled={isPending}
                    onChange={(event) => setRawNotes(event.target.value)}
                    placeholder={
                      "Added dark mode for late-night builders\nMade the dashboard twice as fast\nFixed that one bug everyone kept reporting…\n\nThe small stuff counts, too."
                    }
                  />
                  <div className="composer-helpers">
                    <span>
                      <span className="status-dot" /> Commits, bullet points, or
                      a brain dump.
                    </span>
                    <span>
                      {rawNotes.trim().length.toLocaleString()} characters
                    </span>
                  </div>
                  <div className="composer-bottom">
                    <div className="preset-picker">
                      <label htmlFor="notes-preset">
                        Need a starting point?
                      </label>
                      <select
                        id="notes-preset"
                        value={selectedPreset}
                        disabled={isPending}
                        onChange={(event) => {
                          const label = event.target.value;
                          setSelectedPreset(label);
                          const preset = PRESETS.find(
                            (item) => item.label === label,
                          );
                          if (preset) setRawNotes(preset.text);
                        }}
                      >
                        <option value="">Try an example</option>
                        {PRESETS.map((preset) => (
                          <option key={preset.label} value={preset.label}>
                            {preset.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="generate-action">
                      <span>5 channels · 2 credits</span>
                      <button
                        type="submit"
                        className="button button-accent"
                        disabled={
                          isPending ||
                          !selectedProject ||
                          !rawNotes.trim() ||
                          remainingCredits < 2
                        }
                      >
                        {isPending ? (
                          <Loader2 className="spin" size={16} />
                        ) : (
                          <Sparkles size={16} />
                        )}
                        {isPending
                          ? "Creating your kit…"
                          : "Generate marketing kit"}
                        {!isPending && <ArrowRight size={16} />}
                      </button>
                    </div>
                  </div>
                  {!projects.length && (
                    <p className="workspace-feedback">
                      First, give your project a name in the sidebar. Then let’s
                      write its story.
                    </p>
                  )}
                  {generationError && (
                    <p className="workspace-feedback error" role="alert">
                      {generationError}
                    </p>
                  )}
                </form>
              </section>
              <div ref={kitRef} className="studio-kit-anchor">
                <MarketingKit
                  key={`${selectedProjectId}-${currentGenerated?.createdAt ?? newest?.id ?? "empty"}`}
                  output={output}
                  projectName={selectedProject?.name ?? "Your project"}
                  createdAt={currentGenerated?.createdAt ?? newest?.createdAt}
                  pending={isPending}
                  monthly={{
                    text: monthlyText,
                    error: monthlyError,
                    pending: isMonthlyPending,
                    disabled: !logs.length || remainingCredits < 1,
                    onGenerate: () => {
                      setMonthlyError("");
                      startMonthly(async () => {
                        try {
                          const result = await generateMonthlyNewsletter();
                          if (!result.ok) {
                            setMonthlyError(
                              result.error ?? "Couldn’t create your recap.",
                            );
                            return;
                          }
                          setMonthlyText(result.text ?? "");
                          router.refresh();
                        } catch {
                          setMonthlyError(
                            "Couldn’t create your recap. Please try again.",
                          );
                        }
                      });
                    },
                  }}
                />
              </div>
              {output && (
                <p className="studio-saved-note">
                  <Check size={14} />
                  {projectLogs.length
                    ? "Your saved kits are always a click away in Latest drafts."
                    : "Your kit has been saved. Keep building."}
                </p>
              )}
            </>
          ) : (
            <section className="voice-studio">
              <div className="voice-studio-heading">
                <span className="workspace-eyebrow">
                  <WandSparkles size={13} /> YOUR WORDS, WITH YOUR PERSONALITY
                </span>
                <h2>Make it sound like you.</h2>
                <p>
                  A consistent voice for{" "}
                  {selectedProject?.name ?? "your project"}, from the smallest
                  fix to the biggest launch.
                </p>
              </div>
              {!selectedProject ? (
                <div className="kit-empty">
                  <Folder size={28} />
                  <h3>A voice needs a project.</h3>
                  <p>Create your first project to make its voice your own.</p>
                </div>
              ) : isLoadingTemplates ? (
                <p className="workspace-feedback" role="status">
                  <Loader2 className="spin" size={16} /> Loading your project’s
                  voice…
                </p>
              ) : templateError ? (
                <p className="workspace-feedback error" role="alert">
                  {templateError}
                </p>
              ) : (
                <>
                  <div
                    className="voice-channel-picker"
                    aria-label="Voice settings channels"
                  >
                    {TEMPLATE_ORDER.map((key) => (
                      <button
                        type="button"
                        key={key}
                        aria-pressed={activeTemplate === key}
                        onClick={() => setActiveTemplate(key)}
                      >
                        {key === "twitter" ? "X thread" : templates[key].label}
                      </button>
                    ))}
                  </div>
                  <div className="voice-form">
                    <div className="voice-form-heading">
                      <div>
                        <h3>
                          {activeTemplate === "twitter"
                            ? "X thread"
                            : currentTemplate.label}
                        </h3>
                        <p>
                          Give the AI a direction. Keep the personality yours.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="kit-action"
                        disabled={isSaving}
                        onClick={() => {
                          setTemplateCache((cache) => ({
                            ...cache,
                            [selectedProjectId]: {
                              ...templates,
                              [activeTemplate]:
                                DEFAULT_STYLE_TEMPLATES[activeTemplate],
                            },
                          }));
                          setTemplateFeedback(
                            "Default values restored for this channel. Save to apply them.",
                          );
                        }}
                      >
                        <RotateCcw size={13} /> Reset channel
                      </button>
                    </div>
                    <label htmlFor="voice-tone">
                      Writing tone<span>How should your updates feel?</span>
                    </label>
                    <textarea
                      id="voice-tone"
                      rows={3}
                      disabled={isSaving}
                      value={currentTemplate.tone}
                      onChange={(event) =>
                        updateTemplate("tone", event.target.value)
                      }
                    />
                    <label htmlFor="voice-cta">
                      Call to action
                      <span>What would you like your audience to do next?</span>
                    </label>
                    <textarea
                      id="voice-cta"
                      rows={2}
                      disabled={isSaving}
                      value={currentTemplate.cta}
                      onChange={(event) =>
                        updateTemplate("cta", event.target.value)
                      }
                    />
                    <label htmlFor="voice-hashtags">
                      Your go-to hashtags
                      <span>
                        Optional. A little discoverability goes a long way.
                      </span>
                    </label>
                    <input
                      id="voice-hashtags"
                      disabled={isSaving}
                      value={currentTemplate.hashtags ?? ""}
                      onChange={(event) =>
                        updateTemplate("hashtags", event.target.value)
                      }
                    />
                    <div className="voice-save-row">
                      <p>Applies to future kits. Saving uses 1 credit.</p>
                      <button
                        type="button"
                        className="button button-accent"
                        disabled={isSaving || remainingCredits < 1}
                        onClick={() => {
                          const id = selectedProjectId;
                          setTemplateFeedback("");
                          startSaving(async () => {
                            try {
                              const result = await saveStyleTemplates(
                                templates,
                                id,
                              );
                              setTemplateFeedback(
                                result.ok
                                  ? "Voice settings saved. Your next kit will use them."
                                  : (result.error ??
                                      "Couldn’t save your settings."),
                              );
                              if (result.ok) router.refresh();
                            } catch {
                              setTemplateFeedback(
                                "Couldn’t save your settings. Please try again.",
                              );
                            }
                          });
                        }}
                      >
                        {isSaving ? (
                          <Loader2 className="spin" size={15} />
                        ) : (
                          <Check size={15} />
                        )}
                        {isSaving ? "Saving…" : "Save voice settings"}
                      </button>
                    </div>
                    {templateFeedback && (
                      <p className="workspace-feedback" role="status">
                        {templateFeedback}
                      </p>
                    )}
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      </div>
      {selectedDraft && (
        <DraftModal
          key={selectedDraft.id}
          draft={selectedDraft}
          onClose={() => setSelectedDraft(null)}
        />
      )}
    </main>
  );
}
