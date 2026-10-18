"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import {
  ArrowUpRight,
  Check,
  Copy,
  Download,
  FileText,
  Loader2,
  Mail,
  MessageCircle,
  Newspaper,
  Sparkles,
  CircleHelp,
} from "lucide-react";
import { Linkedin } from "./SocialIcons";
import type { LogRecord } from "@/lib/types";
import { splitThread } from "@/utils/twitter";

export type KitOutput = {
  changelog: string;
  twitter: string;
  linkedin: string;
  helpFaq: string;
  emailNewsletter: string;
  monthlyRecap?: string;
};

export function kitFromLog(log: LogRecord): KitOutput {
  return {
    changelog: log.outputChangelog,
    twitter: log.outputTwitter,
    linkedin: log.outputLinkedin,
    helpFaq: log.outputHelpFaq,
    emailNewsletter: log.outputEmailNewsletter,
    monthlyRecap: log.outputMonthlyRecap,
  };
}

const channels = [
  {
    key: "changelog",
    label: "Changelog",
    icon: FileText,
    description: "A clear record of what’s new, improved, and fixed.",
  },
  {
    key: "twitter",
    label: "X thread",
    icon: MessageCircle,
    description: "A story in small parts. Copy or share each post below.",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    description:
      "Bring your audience behind the scenes of your latest release.",
  },
  {
    key: "emailNewsletter",
    label: "Newsletter",
    icon: Mail,
    description: "A personal update, ready for your subscribers.",
  },
  {
    key: "helpFaq",
    label: "Help & FAQ",
    icon: CircleHelp,
    description: "Help your users get the most out of what you shipped.",
  },
] as const;

export function CopyButton({
  value,
  label = "Copy text",
  description,
}: {
  value: string;
  label?: string;
  description?: string;
}) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  useEffect(() => {
    if (status === "idle") return;
    const timeout = setTimeout(() => setStatus("idle"), 2400);
    return () => clearTimeout(timeout);
  }, [status]);

  return (
    <button
      type="button"
      className="kit-action"
      disabled={!value.trim()}
      aria-label={
        status === "copied"
          ? description?.replace(/^Copy/, "Copied")
          : status === "error"
            ? "Copy failed, try again"
            : description
      }
      aria-live="polite"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setStatus("copied");
        } catch {
          setStatus("error");
        }
      }}
    >
      {status === "copied" ? <Check size={14} /> : <Copy size={14} />}
      {status === "copied"
        ? "Copied!"
        : status === "error"
          ? "Copy failed — try again"
          : label}
    </button>
  );
}

function inlineText(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={index}>{part.slice(1, -1)}</code>;
    return <Fragment key={index}>{part}</Fragment>;
  });
}

/** Render the generated text as React elements; never execute model-generated HTML. */
export function KitText({ text }: { text: string }) {
  const blocks = text.replace(/\r\n?/g, "\n").split(/\n\s*\n/);
  return (
    <div className="kit-prose">
      {blocks.map((block, index) => {
        const lines = block.trim().split("\n");
        if (!block.trim()) return null;
        if (lines.every((line) => /^[-*•]\s/.test(line))) {
          return (
            <ul key={index}>
              {lines.map((line, i) => (
                <li key={i}>{inlineText(line.replace(/^[-*•]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((line) => /^\d+[.)]\s/.test(line))) {
          return (
            <ol key={index}>
              {lines.map((line, i) => (
                <li key={i}>{inlineText(line.replace(/^\d+[.)]\s+/, ""))}</li>
              ))}
            </ol>
          );
        }
        return (
          <div key={index}>
            {lines.map((line, i) => {
              if (/^#{1,3}\s/.test(line))
                return (
                  <h3 key={i}>{inlineText(line.replace(/^#{1,3}\s+/, ""))}</h3>
                );
              if (/^#{4,6}\s/.test(line))
                return (
                  <h4 key={i}>{inlineText(line.replace(/^#{4,6}\s+/, ""))}</h4>
                );
              if (/^---+$/.test(line)) return <hr key={i} />;
              return <p key={i}>{inlineText(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

type MonthlyProps = {
  text: string;
  error: string;
  pending: boolean;
  disabled: boolean;
  onGenerate: () => void;
};

type Props = {
  output: KitOutput | null;
  projectName: string;
  createdAt?: string;
  pending?: boolean;
  monthly?: MonthlyProps;
};

export function MarketingKit({
  output,
  projectName,
  createdAt,
  pending = false,
  monthly,
}: Props) {
  const posts = splitThread(output?.twitter ?? "");
  const hasMonthly = Boolean(monthly || output?.monthlyRecap);
  const [downloadError, setDownloadError] = useState("");

  function downloadKit() {
    if (!output) return;
    try {
      const sections = channels.map(
        (channel) => `## ${channel.label}\n\n${output![channel.key]}`,
      );
      if (output.monthlyRecap)
        sections.push(`## Monthly recap\n\n${output.monthlyRecap}`);
      const url = URL.createObjectURL(
        new Blob(
          [
            `# ${projectName} — Marketing kit\n\n${sections.join("\n\n---\n\n")}`,
          ],
          { type: "text/markdown;charset=utf-8" },
        ),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `${projectName.replace(/[^a-z0-9_-]/gi, "-").slice(0, 70) || "featurelogs"}-marketing-kit.md`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDownloadError("");
    } catch {
      setDownloadError(
        "Couldn’t download this kit. You can still copy each channel’s text.",
      );
    }
  }

  return (
    <article className="kit-panel" aria-busy={pending}>
      <header className="kit-heading">
        <div>
          <span className="workspace-eyebrow">
            <Sparkles size={13} /> THE WORDS TO GO WITH YOUR WORK
          </span>
          <h2>Your marketing kit</h2>
          <p>
            {output ? (
              <>
                {projectName}
                {createdAt && (
                  <>
                    {" "}
                    <span aria-hidden="true">·</span>{" "}
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                    }).format(new Date(createdAt))}
                  </>
                )}
              </>
            ) : (
              "One update, ready for every channel."
            )}
          </p>
        </div>
        {output && !pending && (
          <button type="button" className="kit-action" onClick={downloadKit}>
            <Download size={14} /> Download kit
          </button>
        )}
      </header>
      {downloadError && (
        <p role="alert" className="workspace-feedback error">
          {downloadError}
        </p>
      )}
      {pending ? (
        <div className="kit-loading" role="status">
          <span className="loading-orbit">
            <Sparkles size={25} />
          </span>
          <h3>Finding the words for your work…</h3>
          <p>
            Putting together your changelog, social posts, newsletter, and FAQ.
          </p>
          <div className="kit-skeleton">
            <span />
            <span />
            <span />
          </div>
        </div>
      ) : !output ? (
        <div className="kit-empty">
          <span className="empty-icon">
            <FileText size={27} strokeWidth={1.4} />
          </span>
          <h3>Your next story starts with a few notes.</h3>
          <p>
            Tell us what you shipped. Your ready-to-review drafts will appear
            here, organized by channel.
          </p>
          <div className="empty-channels">
            {channels.map((channel) => (
              <span key={channel.key}>
                <channel.icon size={14} />
                {channel.label}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <Tabs.Root defaultValue="changelog" className="kit-tabs-root">
          <Tabs.List className="kit-tabs" aria-label="Marketing kit channels">
            {channels.map((channel) => (
              <Tabs.Trigger value={channel.key} key={channel.key}>
                <channel.icon size={16} />
                <span>{channel.label}</span>
                {channel.key === "twitter" && posts.length > 0 && (
                  <span className="tab-count">{posts.length}</span>
                )}
              </Tabs.Trigger>
            ))}
            {hasMonthly && (
              <Tabs.Trigger value="monthly">
                <Newspaper size={16} />
                <span>Monthly recap</span>
              </Tabs.Trigger>
            )}
          </Tabs.List>
          {channels.map((channel) => (
            <Tabs.Content
              value={channel.key}
              key={channel.key}
              className="kit-content"
            >
              <div className="kit-channel-heading">
                <div>
                  <h3>
                    {channel.label === "X thread"
                      ? "A conversation, one post at a time."
                      : channel.label}
                  </h3>
                  <p>{channel.description}</p>
                </div>
                <CopyButton
                  value={output[channel.key]}
                  label={
                    channel.key === "twitter" ? "Copy full thread" : "Copy text"
                  }
                />
              </div>
              {channel.key === "twitter" ? (
                <>
                  <div className="thread-posts">
                    {posts.map((post, index) => (
                      <section
                        className="thread-post"
                        key={`${index}-${post}`}
                        aria-label={`Thread post ${index + 1}`}
                      >
                        <div className="thread-post-heading">
                          <span className="post-avatar">
                            {projectName.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <strong>{projectName}</strong>
                            <span>
                              Post {index + 1} of {posts.length}
                            </span>
                          </div>
                          <span className="post-character-count">
                            {Array.from(post).length} characters
                          </span>
                        </div>
                        <p className="thread-post-text">{post}</p>
                        <div className="thread-post-actions">
                          <CopyButton
                            value={post}
                            label="Copy post"
                            description={`Copy post ${index + 1}`}
                          />
                          <a
                            href={`https://x.com/intent/tweet?text=${encodeURIComponent(post)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="kit-action"
                            aria-label={`Share post ${index + 1} on X`}
                          >
                            Share on X <ArrowUpRight size={14} />
                          </a>
                          {Array.from(post).length > 280 && (
                            <span className="length-note">
                              Review length on X
                            </span>
                          )}
                        </div>
                      </section>
                    ))}
                  </div>
                  <p className="kit-footnote">
                    Each share opens X for review. Add subsequent posts to your
                    thread there.
                  </p>
                </>
              ) : output[channel.key].trim() ? (
                <div className="kit-document">
                  <KitText text={output[channel.key]} />
                </div>
              ) : (
                <p className="kit-missing">
                  No {channel.label.toLowerCase()} content was saved for this
                  draft.
                </p>
              )}
            </Tabs.Content>
          ))}
          {hasMonthly && (
            <Tabs.Content value="monthly" className="kit-content">
              <MonthlyRecap monthly={monthly} savedText={output.monthlyRecap} />
            </Tabs.Content>
          )}
        </Tabs.Root>
      )}
      {!output && monthly && (!monthly.disabled || monthly.text) && (
        <section className="kit-content">
          <MonthlyRecap monthly={monthly} />
        </section>
      )}
      <footer className="kit-panel-footer">
        <span>
          <span className="status-dot" />{" "}
          {pending
            ? "Working on your drafts"
            : output
              ? "Drafts, ready for your finishing touch"
              : "Built around your voice"}
        </span>
        <span>Review before sharing</span>
      </footer>
    </article>
  );
}

function MonthlyRecap({
  monthly,
  savedText = "",
}: {
  monthly?: MonthlyProps;
  savedText?: string;
}) {
  return (
    <>
      <div className="kit-channel-heading">
        <div>
          <h3>Your month, in perspective.</h3>
          <p>
            {monthly
              ? "A recap of this month’s updates across all your projects."
              : "The monthly recap saved with this draft."}
          </p>
        </div>
        <CopyButton value={monthly?.text || savedText || ""} />
      </div>
      {monthly?.text || savedText ? (
        <div className="kit-document">
          <KitText text={monthly?.text || savedText || ""} />
        </div>
      ) : (
        <div className="monthly-empty">
          <Newspaper size={30} strokeWidth={1.4} />
          <h3>Connect the dots of your month.</h3>
          <p>
            Turn your saved changelogs into a newsletter that tells the bigger
            story.
          </p>
          <button
            type="button"
            className="button button-accent"
            disabled={monthly?.pending || monthly?.disabled}
            onClick={monthly?.onGenerate}
          >
            {monthly?.pending ? (
              <Loader2 className="spin" size={16} />
            ) : (
              <Sparkles size={16} />
            )}
            {monthly?.pending
              ? "Writing your recap…"
              : "Generate monthly recap"}
          </button>
        </div>
      )}
      {monthly?.error && (
        <p className="workspace-feedback error" role="alert">
          {monthly.error}
        </p>
      )}
    </>
  );
}
