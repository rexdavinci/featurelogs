import packageJson from "@/package.json";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200/70 bg-white/60 px-4 py-4 text-sm text-zinc-600 backdrop-blur-sm sm:px-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
          <span className="flex items-center gap-1">
            <span>FeatureLogs v{packageJson.version}</span>{" "}
            <a href="https://github.com/rexdavinci/featurelogs" target="_blank" rel="noopener noreferrer">
              <GitIcon />
            </a>
          </span>
        </p>
        <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.16em]">
          <a className="transition hover:text-(--accent-strong)" href="/terms">
            Terms
          </a>
          <a
            className="transition hover:text-(--accent-strong)"
            href="/privacy"
          >
            Privacy
          </a>
          <a className="transition hover:text-(--accent-strong)" href="/faq">
            FAQ
          </a>
        </div>
      </div>
    </footer>
  );
}

const GitIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-4 w-4"
  >
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.086.636-1.336-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.099 2.651a3.293 3.293 0 011.028 2.687c0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.523 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);
