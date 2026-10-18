import { Github } from "./SocialIcons";
import { ArrowUpRight, Check, Circle } from "lucide-react";

const columns = [
  { title: "Available today", color: "#6d8863", items: ["AI marketing kits from your notes", "Project-specific voice and style", "Changelogs, social, email, and FAQs"] },
  { title: "Exploring next", color: "#cd9c4a", items: ["Bring updates straight from GitHub", "Make sharing your next step easier", "Build a consistent publishing habit"] },
  { title: "Shape what’s next", color: "#93978c", items: ["Share your everyday workflow", "Suggest an integration you’d love", "Contribute your first improvement"] },
];

export function RoadmapBoard() {
  return (
    <section className="roadmap-section" id="roadmap">
      <div className="section-heading"><div><p className="section-kicker">A PRODUCT THAT GROWS WITH YOU</p><h2>Building in public. Just like you.</h2></div><a className="text-link roadmap-link" href="https://github.com/rexdavinci/featurelogs/issues" target="_blank" rel="noreferrer"><Github size={14} /> Join the conversation <ArrowUpRight size={14} /></a></div>
      <div className="roadmap-grid">{columns.map((column, index) => <article className="roadmap-column" key={column.title}><h3 className="roadmap-status"><span className="status-dot" style={{ background: column.color }} />{column.title}</h3><ul>{column.items.map((item) => <li key={item}>{index === 0 ? <Check size={13} /> : <Circle size={11} />}{item}</li>)}</ul></article>)}</div>
      <p className="roadmap-hint">Future ideas are a conversation, not a promise. Help us decide what matters.</p>
    </section>
  );
}
