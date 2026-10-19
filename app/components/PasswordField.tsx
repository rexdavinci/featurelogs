"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";

export function PasswordField({
  id,
  label = "Password",
  value,
  onChange,
  disabled,
  autoComplete = "new-password",
}: {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoComplete?: "new-password" | "current-password";
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-wider text-(--text-muted)"
      >
        {label}
      </label>
      <div className="relative">
        <KeyRound
          aria-hidden="true"
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-muted)"
        />
        <input
          id={id}
          name={id}
          autoComplete={autoComplete}
          minLength={6}
          maxLength={1024}
          required
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="w-full rounded-xl border border-(--border) bg-(--surface) pl-10 pr-12 py-2.5 text-sm outline-none focus:border-(--accent) transition disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          disabled={disabled}
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
          aria-controls={id}
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-2.5 text-(--text-muted) hover:text-foreground focus-visible:outline-2 focus-visible:outline-(--accent) cursor-pointer"
        >
          {visible ? (
            <EyeOff size={18} aria-hidden="true" />
          ) : (
            <Eye size={18} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
