"use client";

import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Folder } from "lucide-react";

export function OptionPicker({
  options: projects,
  value,
  disabled,
  onChange,
  label,
  placeholder,
  icon,
}: {
  options: { id: string; name: string; description?: string }[];
  value: string;
  disabled: boolean;
  onChange: (id: string) => void;
  label: string;
  placeholder: string;
  icon: ReactNode;
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
        aria-label={`${label}: ${selected?.name ?? placeholder}`}
        aria-haspopup="listbox"
        aria-expanded={open && !disabled}
        aria-controls={listId}
        disabled={disabled}
        onClick={() => setOpen(!open)}
      >
        {icon}
        <span>{selected?.name ?? placeholder}</span>
        <ChevronDown size={15} />
      </button>
      {open && !disabled && (
        <div
          id={listId}
          role="listbox"
          aria-label={label}
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
              <span className="picker-option-copy">
                <span>{project.name}</span>
                {project.description && <small>{project.description}</small>}
              </span>
              {project.id === value && <Check size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProjectPicker(props: {
  projects: { id: string; name: string }[];
  value: string;
  disabled: boolean;
  onChange: (id: string) => void;
}) {
  return (
    <OptionPicker
      options={props.projects}
      value={props.value}
      disabled={props.disabled}
      onChange={props.onChange}
      label="Selected project"
      placeholder="Create your first project"
      icon={<Folder size={17} />}
    />
  );
}
