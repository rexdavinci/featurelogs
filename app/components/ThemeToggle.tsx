"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const storageKey = "featurelogs-theme";

function currentTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const syncPreference = () => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(storageKey);
    } catch {
      /* Storage may be disabled. */
    }
    document.documentElement.dataset.theme =
      saved === "light" || saved === "dark"
        ? saved
        : media.matches
          ? "dark"
          : "light";
    onChange();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) syncPreference();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("featurelogs-theme-change", onChange);
  media.addEventListener("change", syncPreference);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("featurelogs-theme-change", onChange);
    media.removeEventListener("change", syncPreference);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => "light");
  const nextTheme = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      onClick={() => {
        document.documentElement.dataset.theme = nextTheme;
        try {
          localStorage.setItem(storageKey, nextTheme);
        } catch {
          /* Still switch for this visit. */
        }
        window.dispatchEvent(new Event("featurelogs-theme-change"));
      }}
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
