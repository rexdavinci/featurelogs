"use client";

import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { ArrowDown, Check, Copy, FileText, Mail, Sparkles } from "lucide-react";
import { Linkedin } from "./SocialIcons";

const STORIES = [
  {
    name: "An app",
    product: "Gather",
    type: "Booking app",
    notes: [
      "Added one-click rebooking",
      "Customers can save a favorite time",
      "Available to all customers today",
    ],
    title: "Your next booking. Already easier.",
    changelog:
      "A little less planning. A little more doing.\n\nYou can now rebook in one click and save your favorite time. No more starting from scratch every visit.\n\nAvailable today for everyone using Gather.",
    linkedin:
      "The best improvements often start with a simple question: why does this take so many steps?\n\nOur latest Gather update brings one-click rebooking and saved time preferences to every customer.\n\nFewer steps between you and the things you want to do. That’s progress worth sharing.",
    email:
      "Subject: Same time next week?\n\nYour next booking just got easier. Rebook in one click, or save your favorite time for later.\n\nOpen Gather to try it. We’d love to hear what you think.",
  },
  {
    name: "A collection",
    product: "Fieldwork",
    type: "Everyday essentials",
    notes: [
      "New everyday tote collection",
      "Two sizes, three colors",
      "Available in our store on Friday",
    ],
    title: "Made for wherever the day takes you.",
    changelog:
      "Meet the everyday tote collection.\n\nTwo sizes. Three colors. A place for the things you carry from one part of your day to the next.\n\nExplore the collection in our store this Friday.",
    linkedin:
      "A new chapter for Fieldwork: our everyday tote collection arrives Friday.\n\nWe kept the idea simple. A useful bag, in two sizes and three colors, for the way your day actually unfolds.\n\nWe can’t wait to see where you take it.",
    email:
      "Subject: Something new for your everyday\n\nOur new tote collection arrives this Friday.\n\nChoose from two sizes and three colors. Find your everyday companion in the Fieldwork store.",
  },
  {
    name: "A course",
    product: "First Chapter",
    type: "Learning resource",
    notes: [
      "New self-paced writing course",
      "Six lessons with practice prompts",
      "Enrollment opens Monday",
    ],
    title: "Your first chapter starts here.",
    changelog:
      "A new way to start writing.\n\nOur self-paced course includes six lessons and practice prompts to help you turn a blank page into a writing habit.\n\nEnrollment opens Monday. Learn at your own pace.",
    linkedin:
      "Starting is often the hardest part of writing.\n\nThat’s why we created First Chapter: six self-paced lessons, each paired with a practice prompt. A little structure to help you keep going.\n\nEnrollment opens Monday. Your story can start here.",
    email:
      "Subject: Make room for your writing\n\nFirst Chapter opens for enrollment on Monday.\n\nSix lessons. Practical writing prompts. Your own pace.\n\nIf you’ve been waiting to start, this is your invitation.",
  },
];
const CHANNELS = [
  { id: "changelog", label: "Update", icon: FileText },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "email", label: "Email", icon: Mail },
] as const;

export function KitPreview() {
  const [storyIndex, setStoryIndex] = useState(0);
  const [active, setActive] = useState<"changelog" | "linkedin" | "email">(
    "changelog",
  );
  const [copyStatus, setCopyStatus] = useState("");
  const story = STORIES[storyIndex];
  return (
    <div className="release-demo" id="example">
      <div className="demo-toolbar">
        <span>
          <span className="status-dot" /> THE UPDATE STUDIO
        </span>
        <span>Interactive example</span>
      </div>
      <p className="demo-instructions">Try a product type, then switch channels to see its drafts.</p>
      <div
        className="demo-scenarios"
        role="group"
        aria-label="Example product type"
      >
        {STORIES.map((item, index) => (
          <button
            key={item.name}
            aria-pressed={index === storyIndex}
            onClick={() => {
              setStoryIndex(index);
              setCopyStatus("");
            }}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="demo-notes">
        <div className="demo-note-label">
          <span>01 / YOUR NOTES</span>
          <span>
            {story.product} · {story.type}
          </span>
        </div>
        <ul>
          {story.notes.map((note) => (
            <li key={note}>
              <span>+</span>
              {note}
            </li>
          ))}
        </ul>
      </div>
      <div className="demo-transform">
        <span />
        <span>
          <Sparkles size={13} /> A clearer story, in your voice
        </span>
        <span />
        <ArrowDown size={14} />
      </div>
      <Tabs.Root
        value={active}
        onValueChange={(value) => {
          setActive(value as typeof active);
          setCopyStatus("");
        }}
      >
        <div className="demo-output-label">
          <span>02 / READY TO MAKE YOURS</span>
          <span>
            <Check size={12} /> Example draft
          </span>
        </div>
        <Tabs.List
          className="demo-channel-tabs"
          aria-label="Example update channels"
        >
          {CHANNELS.map((channel) => (
            <Tabs.Trigger key={channel.id} value={channel.id}>
              <channel.icon size={14} />
              {channel.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {CHANNELS.map((channel) => (
          <Tabs.Content
            key={`${channel.id}-${storyIndex}`}
            value={channel.id}
            className="demo-output"
          >
            <span className="demo-product-name">
              {story.product.toUpperCase()} / PRODUCT UPDATE
            </span>
            <h3>{story.title}</h3>
            <p>{story[channel.id]}</p>
          </Tabs.Content>
        ))}
      </Tabs.Root>
      <div className="demo-footer">
        <span>Illustrative products · Sample content</span>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                `${story.title}\n\n${story[active]}`,
              );
              setCopyStatus("Copied!");
            } catch {
              setCopyStatus("Select the draft to copy manually.");
            }
          }}
        >
          <Copy size={13} />
          {copyStatus === "Copied!" ? "Copied!" : "Copy draft"}
        </button>
      </div>
      <span className="sr-only" role="status">
        {copyStatus}
      </span>
    </div>
  );
}
