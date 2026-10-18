"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Folder } from "lucide-react";

export function ProjectPicker({
  projects,
  value,
  disabled,
  onChange,
}: {
  projects: { id: string; name: string }[];
  value: string;
  disabled: boolean;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const selected = projects.find((project) => project.id === value);

  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", dismiss);
    const options =
      root.current?.querySelectorAll<HTMLButtonElement>("[role=option]");
    options?.[
      Math.max(
        0,
        projects.findIndex((project) => project.id === value),
      )
    ]?.focus();
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open, projects, value]);

  return (
    <div
      ref={root}
      className="project-picker"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          setOpen(false);
          trigger.current?.focus();
        }
        if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
          event.preventDefault();
          if (!open) {
            setOpen(true);
            return;
          }
          const options = Array.from(
            root.current?.querySelectorAll<HTMLButtonElement>(
              "[role=option]",
            ) ?? [],
          );
          const index = options.indexOf(
            document.activeElement as HTMLButtonElement,
          );
          const next =
            event.key === "Home"
              ? 0
              : event.key === "End"
                ? options.length - 1
                : (index +
                    (event.key === "ArrowDown" ? 1 : -1) +
                    options.length) %
                  options.length;
          options[next]?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="project-picker-trigger"
        aria-label={`Selected project: ${selected?.name ?? "Create your first project"}`}
        aria-haspopup="listbox"
        aria-expanded={open && !disabled}
        aria-controls={listId}
        disabled={disabled}
        onClick={() => setOpen(!open)}
      >
        <Folder size={17} />
        <span>{selected?.name ?? "Create your first project"}</span>
        <ChevronDown size={15} />
      </button>
      {open && !disabled && (
        <div
          id={listId}
          role="listbox"
          aria-label="Your projects"
          className="project-picker-options"
        >
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              role="option"
              aria-selected={project.id === value}
              tabIndex={-1}
              onClick={() => {
                onChange(project.id);
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              <Folder size={16} />
              <span>{project.name}</span>
              {project.id === value && <Check size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
