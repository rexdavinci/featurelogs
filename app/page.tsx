import { Github } from "./components/SocialIcons";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  Heart,

  MessageSquare,
  Sparkles,
  Terminal,
  WandSparkles,
} from "lucide-react";
import { BrandMark } from "./components/Brand";
import { Header } from "./components/Header";
import { KitPreview } from "./components/KitPreview";
import { RoadmapBoard } from "./components/RoadmapBoard";
import { getSiteUrl } from "@/utils/seo";
import { getSessionUser } from "@/utils/session";

export const metadata: Metadata = {
  title: "Build something. Tell the world.",
  description:
    "Turn your commits and release notes into a marketing kit with AI. Create changelogs, social posts, and newsletters. Open source. Built for builders.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const user = await getSessionUser();
  const startHref = user ? "/dashboard" : "/login?mode=signup";
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "FeatureLogs",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: getSiteUrl(),
    description:
      "Turn rough product updates into polished changelogs, social posts, and newsletters.",
  };

  return (
    <main className="landing-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareSchema).replace(/</g, "\\u003c"),
        }}
      />
      <Header userEmail={user?.email} />
      <section className="hero">
        <div className="hero-copy animate-rise">
          <Link href="#roadmap" className="eyebrow-pill">
            <span className="status-dot" /> OPEN SOURCE. OPEN POSSIBILITIES.{" "}
            <ArrowUpRight size={13} />
          </Link>
          <h1>
            You build it.
            <br />
            We help you
            <br />
            <span>tell the world.</span>
          </h1>
          <p className="hero-description">
            Great products deserve to be seen. Turn your everyday progress into
            changelogs, social posts, and newsletters. Without the blank page.
          </p>
          <div className="hero-actions">
            <Link href={startHref} className="button button-accent">
              {user ? "Back to your workspace" : "Create your first kit"}
              <ArrowRight size={17} />
            </Link>
            <Link href="#example" className="text-link">
              See it in action <ArrowDownIcon />
            </Link>
          </div>
          <div className="hero-reassurance">
            <span>
              <Check size={13} /> Free to get started
            </span>
            <span>
              <Check size={13} /> No credit card
            </span>
            <span>
              <Github size={13} /> Open source
            </span>
          </div>
          <div className="hero-footnote">
            <span className="footnote-line" />
            <span>LESS TIME WRITING. MORE TIME BUILDING.</span>
          </div>
        </div>
        <div className="hero-preview animate-rise-delayed">
          <div className="preview-floating-note">
            <span className="handdrawn-arrow" aria-hidden="true">
              ↘
            </span>{" "}
            Your next release, already a story.
          </div>
          <KitPreview />
          <div className="preview-caption">
            <span className="status-dot" /> One update. A whole lot of
            possibilities.
          </div>
        </div>
      </section>
      <section className="channel-strip" aria-label="Content formats">
        <p>One idea. Every channel.</p>
        <div>
          <span>
            <Terminal size={17} />
            Changelog
          </span>
          <span className="channel-x">
            𝕏 <span>X / Twitter</span>
          </span>
          <span>
            <span className="linkedin-mark">in</span>LinkedIn
          </span>
          <span>
            <MailIcon />
            Newsletter
          </span>
          <span>
            <MessageSquare size={17} />
            Help & FAQ
          </span>
        </div>
      </section>
      <section className="how-section" id="how-it-works">
        <div className="section-heading">
          <div>
            <p className="section-kicker">YOUR NEW POST-SHIP RITUAL</p>
            <h2>From “just shipped” to “just shared.”</h2>
          </div>
          <p>
            Keep the momentum.
            <br />
            We’ll help with the words.
          </p>
        </div>
        <div className="steps-grid">
          {[
            {
              number: "01",
              icon: Code2,
              title: "Drop in what you built",
              body: "Commits, messy notes, a few bullet points. Start with what you already have.",
              note: "No perfect prompts needed.",
            },
            {
              number: "02",
              icon: WandSparkles,
              title: "Make it sound like you",
              body: "AI turns your updates into a complete kit. Set your tone, then make it your own.",
              note: "Your work. Your voice.",
            },
            {
              number: "03",
              icon: ArrowUpRight,
              title: "Share. Build. Repeat.",
              body: "Copy your drafts to the channels you love. Give your next release an audience.",
              note: "Small updates build big momentum.",
            },
          ].map((step) => (
            <article className="step-card" key={step.number}>
              <div className="step-card-top">
                <span className="step-icon">
                  <step.icon size={22} strokeWidth={1.6} />
                </span>
                <span className="step-number">{step.number}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
              <span className="step-note">{step.note}</span>
            </article>
          ))}
        </div>
      </section>
      <section className="value-grid">
        <article className="voice-card">
          <div className="section-kicker">
            <Sparkles size={14} /> AN ASSISTANT, WITH YOUR PERSONALITY
          </div>
          <h2>
            Sounds like you.
            <br />
            Just on a good writing day.
          </h2>
          <p>
            Save your tone, calls to action, and hashtags for each project. Get
            a consistent starting point, whether you’re sharing a tiny fix or
            your biggest launch.
          </p>
          <Link href={startHref} className="text-link">
            Find your voice <ArrowRight size={16} />
          </Link>
          <div className="voice-chips">
            <span>
              <span /> A little conversational
            </span>
            <span>
              <span /> Clear, never corporate
            </span>
            <span>
              <span /> Always yours
            </span>
          </div>
        </article>
        <article className="opensource-card">
          <div className="open-card-top">
            <Github size={27} strokeWidth={1.5} />
            <span>BUILT IN THE OPEN</span>
            <ArrowUpRight size={20} />
          </div>
          <h2>
            For builders.
            <br />
            By builders.
          </h2>
          <p>
            We’re building in public, too. Explore the code, share an idea, or
            help shape what FeatureLogs becomes next.
          </p>
          <a
            href="https://github.com/rexdavinci/featurelogs"
            target="_blank"
            rel="noreferrer"
            className="button button-light"
          >
            Explore on GitHub <ArrowUpRight size={16} />
          </a>
          <div className="opensource-footer">
            <Heart size={14} /> Open source is a feature, not a footnote.
          </div>
        </article>
      </section>
      <RoadmapBoard />
      <section className="closing-cta">
        <span className="closing-mark">
          <BrandMark />
        </span>
        <h2>Your next update is already in your commits.</h2>
        <p>Let’s turn it into something worth sharing.</p>
        <Link href={startHref} className="button button-accent">
          {user ? "Open your workspace" : "Create your first kit"}
          <ArrowRight size={17} />
        </Link>
        <span className="closing-note">
          Made for the work between the big launches.
        </span>
      </section>
    </main>
  );
}

function ArrowDownIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M12 4v16m-6-6 6 6 6-6" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 6 9 7 9-7" />
    </svg>
  );
}
