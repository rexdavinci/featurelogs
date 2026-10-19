import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FileText,
  Sparkles,
  MessagesSquare,
  Package,
  GraduationCap,
  Users,
  Workflow,
} from "lucide-react";
import { Github } from "./components/SocialIcons";
import { BrandMark } from "./components/Brand";
import { Header } from "./components/Header";
import { KitPreview } from "./components/KitPreview";
import { RoadmapBoard } from "./components/RoadmapBoard";
import { getSiteUrl } from "@/utils/seo";
import { getSessionUser } from "@/utils/session";

export const metadata: Metadata = {
  title: "Make every update worth sharing",
  description:
    "Your product keeps moving. Bring people with you. Turn product notes into on-brand changelogs, social posts, newsletters, and FAQs with FeatureLogs.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const user = await getSessionUser();
  const startHref = user ? "/dashboard" : "/login?mode=signup";
  return (
    <main className="landing-shell brand-evolution">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "FeatureLogs",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: getSiteUrl(),
            description:
              "A product communication studio that turns product notes into changelogs, social posts, newsletters, and FAQs.",
          }).replace(/</g, "\\u003c"),
        }}
      />
      <Header userEmail={user?.email} />
      <section className="release-hero">
        <div className="release-hero-copy animate-rise">
          <p className="release-eyebrow">
            <span className="status-dot" /> THE PRODUCT COMMUNICATION STUDIO
          </p>
          <h1>
            Your product
            <br />
            moves forward.
            <br />
            <span>
              Bring people
              <br />
              with you.
            </span>
          </h1>
          <p className="release-hero-description">
            You made something better. Let’s make sure people know. Turn
            everyday progress into clear, on-brand updates for every place your
            audience is.
          </p>
          <div className="hero-actions">
            <Link href={startHref} className="button button-accent">
              {user ? "Open your studio" : "Create your first update"}
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-reassurance">
            <span>
              <Check size={13} /> Free to start
            </span>
            <span>
              <Check size={13} /> No credit card
            </span>
            <span>
              <Github size={13} /> Open source
            </span>
          </div>
          <div className="hero-principle">
            <span>LESS BLANK PAGE.</span>
            <span>MORE MOMENTUM.</span>
          </div>
        </div>
        <div className="release-hero-demo animate-rise-delayed">
          <KitPreview />
        </div>
      </section>
      <section className="audience-ribbon" aria-label="Who FeatureLogs is for">
        <span>
          IF YOU HAVE A PRODUCT,
          <br />
          <strong>you have a story to tell.</strong>
        </span>
        <p>
          <Package size={17} /> Products & services
        </p>
        <p>
          <GraduationCap size={18} /> Courses & resources
        </p>
        <p>
          <MessagesSquare size={18} /> Apps & software
        </p>
        <p>
          <Users size={18} /> Communities
        </p>
      </section>
      <section className="communication-section" id="how-it-works">
        <div className="section-heading">
          <div>
            <p className="section-kicker">
              FROM WHAT CHANGED TO WHY IT MATTERS
            </p>
            <h2>
              One update.
              <br />A little more possibility.
            </h2>
          </div>
          <p>
            A launch, a useful fix, a small improvement.
            <br />
            Give every step forward a voice.
          </p>
        </div>
        <div className="communication-steps">
          <article>
            <span className="communication-number">01 / CAPTURE</span>
            <FileText size={24} />
            <h3>Start with the real work.</h3>
            <p>
              A few notes, a customer-inspired change, or your next launch. No
              polished brief required.
            </p>
            <span className="step-example">
              “We added a way to book in one click.”
            </span>
          </article>
          <article>
            <span className="communication-number">02 / SHAPE</span>
            <Sparkles size={24} />
            <h3>Find the story in it.</h3>
            <p>
              AI helps explain the benefit. Your saved voice keeps each project
              sounding like you.
            </p>
            <span className="step-example">
              Less setup. More getting started.
            </span>
          </article>
          <article>
            <span className="communication-number">03 / SHARE</span>
            <ArrowUpRight size={24} />
            <h3>Meet your audience.</h3>
            <p>
              Review your kit, make it yours, and copy or download drafts for
              the channels you use.
            </p>
            <span className="step-example">
              Changelog · Social · Email · FAQ
            </span>
          </article>
        </div>
      </section>
      <section className="editorial-story">
        <div className="story-statement">
          <p className="section-kicker">PROGRESS DESERVES AN AUDIENCE</p>
          <h2>
            The release is
            <br />
            just the beginning<span>.</span>
          </h2>
        </div>
        <div className="story-details">
          <p>
            Customers don’t see your roadmap, your late nights, or the care
            behind a small improvement. They see what you share.
          </p>
          <p>
            FeatureLogs helps connect the work you do with the people it’s for.
            One home for your products, your voice, and the updates that keep
            people coming back.
          </p>
          <Link href={startHref} className="text-link">
            Give your next update a voice <ArrowRight size={16} />
          </Link>
          <div className="story-attributes">
            <span>Your voice, per project</span>
            <span>Five ready-to-edit formats</span>
            <span>Every draft, saved</span>
          </div>
        </div>
      </section>
      <section className="agent-horizon" aria-labelledby="horizon-title">
        <div>
          <span className="horizon-label">
            <Workflow size={14} /> THE NEXT CHAPTER · EXPLORING
          </span>
          <h2 id="horizon-title">
            Closer to your work.
            <br />
            Further from the busywork.
          </h2>
          <p>
            Today, bring your notes. In future releases, we want to bring
            FeatureLogs into your workflow—with agents that help capture
            progress and prepare updates for your review.
          </p>
          <a
            href="https://github.com/rexdavinci/featurelogs/issues"
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            Help shape what comes next <ArrowUpRight size={15} />
          </a>
          <small>
            Workflow agents and connected sources are not available yet.
          </small>
        </div>
        <div className="workflow-sketch" aria-label="Proposed future workflow">
          <span className="workflow-caption">A DIRECTION WE’RE EXPLORING</span>
          <div className="workflow-source">
            Your tools <span>Where the work happens</span>
          </div>
          <div className="workflow-line" />
          <div className="workflow-agent">
            <BrandMark />
            <span>
              FeatureLogs agents<small>Capture · Shape · Prepare</small>
            </span>
          </div>
          <div className="workflow-line" />
          <div className="workflow-review">
            <Check size={17} />
            <span>
              Your review.
              <br />
              <strong>Your voice. Your call.</strong>
            </span>
          </div>
        </div>
      </section>
      <RoadmapBoard />
      <section className="closing-cta">
        <span className="closing-mark">
          <BrandMark />
        </span>
        <p className="section-kicker">MAKE EVERY UPDATE WORTH SHARING</p>
        <h2>
          Something changed.
          <br />
          Start a conversation.
        </h2>
        <p>Your next great update starts with a few rough notes.</p>
        <Link href={startHref} className="button button-accent">
          {user ? "Open your studio" : "Create your first update"}
          <ArrowRight size={17} />
        </Link>
        <span className="closing-note">
          For the big launches. And everything in between.
        </span>
      </section>
    </main>
  );
}
