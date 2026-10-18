"use client";

import { Linkedin } from "./SocialIcons";
import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { ArrowDown, Check, Copy, FileText, GitCommitHorizontal, Mail, Sparkles } from "lucide-react";

const EXAMPLES = {
  changelog: { label: "Changelog", icon: FileText, title: "Small updates. A better everyday.", body: "A few things we shipped this week:\n\n✦ Dark mode, for your late-night ideas.\n✦ A faster dashboard. Less waiting, more doing.\n✦ CSV exports. Your data, wherever you need it.\n\nBuilt with your feedback. Keep it coming." },
  x: { label: "X / Twitter", icon: GitCommitHorizontal, title: "Another week, another little leap.", body: "Shipped dark mode, a faster dashboard, and CSV exports this week.\n\nNone of these were on our original roadmap. All of them came from listening to the people using our product.\n\nWhat’s one small feature that made a big difference for you?\n\n#buildinpublic #indiehacker" },
  linkedin: { label: "LinkedIn", icon: Linkedin, title: "The best roadmap starts with listening.", body: "This week, we turned three pieces of user feedback into shipped features: dark mode, a faster dashboard, and CSV exports.\n\nSmall improvements add up. Our goal is simple: make the product a little more useful every time you open it.\n\nWhat have you learned from your users this week?" },
  email: { label: "Email", icon: Mail, title: "A little update from the workshop", body: "Hey there,\n\nWe’ve been busy making your everyday workflow a little smoother. Dark mode is here, the dashboard loads faster, and you can now take your data with you using CSV exports.\n\nTry them out and let us know what you think. Your feedback helps us decide what to build next.\n\nSee you in the next update!" },
};

export function KitPreview() {
  const [active, setActive] = useState<keyof typeof EXAMPLES>("changelog");
  const [copyStatus, setCopyStatus] = useState("");
  const example = EXAMPLES[active];

  async function copyExample() {
    try {
      await navigator.clipboard.writeText(`${example.title}\n\n${example.body}`);
      setCopyStatus("Copied to clipboard");
    } catch {
      setCopyStatus("Could not copy. Select the text to copy manually.");
    }
  }

  return (
    <div className="kit-preview" id="example">
      <div className="preview-topline"><span className="window-dots" aria-hidden="true"><i /><i /><i /></span><span>FROM SHIPPED TO SHARED</span><span className="preview-live"><span /> Example kit</span></div>
      <div className="preview-input">
        <div className="preview-label"><GitCommitHorizontal size={15} /><span>Your rough notes</span><span className="mono-tag">release.md</span></div>
        <p><span>+</span> added dark mode<br /><span>+</span> improved dashboard load time<br /><span>+</span> shipped CSV exports</p>
      </div>
      <div className="preview-connector"><span /><span className="connector-label"><Sparkles size={13} /> A little AI. A lot of you.</span><span /><ArrowDown size={14} /></div>
      <Tabs.Root value={active} onValueChange={(value) => { setActive(value as keyof typeof EXAMPLES); setCopyStatus(""); }}>
        <div className="preview-output-heading"><span className="preview-label"><span className="output-icon"><Sparkles size={14} /></span>Your marketing kit</span><span className="ready-badge"><Check size={12} /> Ready to make yours</span></div>
        <Tabs.List className="preview-tabs" aria-label="Example marketing kit channels">
          {Object.entries(EXAMPLES).map(([key, item]) => <Tabs.Trigger key={key} value={key}><item.icon size={14} />{item.label}</Tabs.Trigger>)}
        </Tabs.List>
        {Object.entries(EXAMPLES).map(([key, item]) => <Tabs.Content key={key} value={key} className="preview-copy"><div className="preview-copy-meta"><span>PRODUCT UPDATE</span><span>Draft · Example</span></div><h3>{item.title}</h3><p>{item.body}</p></Tabs.Content>)}
      </Tabs.Root>
      <div className="preview-bottom"><span><span className="tiny-avatar">Y</span> Your story. Your voice.</span><button type="button" onClick={copyExample}><Copy size={13} />{copyStatus === "Copied to clipboard" ? "Copied!" : "Copy draft"}</button></div>
      <p className="sr-only" role="status">{copyStatus}</p>
    </div>
  );
}
