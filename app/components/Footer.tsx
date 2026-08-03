import packageJson from "@/package.json";


export function Footer() {
  return (
    <footer className="border-t border-zinc-200/70 bg-white/60 px-4 py-4 text-sm text-zinc-600 backdrop-blur-sm sm:px-6">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
                FeatureLogs v{packageJson.version}
              </p>
              <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.16em]">
                <a className="transition hover:text-(--accent-strong)" href="/terms">
                  Terms
                </a>
                <a className="transition hover:text-(--accent-strong)" href="/privacy">
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