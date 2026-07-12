import type { Metadata } from "next";
import { Sora, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import packageJson from "@/package.json";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FeatureLogs",
  description: "Build-in-public changelog and social content engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="flex-1">{children}</div>
        <footer className="border-t border-zinc-200/70 bg-white/60 px-6 py-3 text-center font-mono text-[11px] uppercase tracking-wider text-zinc-600 backdrop-blur-sm">
          FeatureLogs v{packageJson.version}
        </footer>
      </body>
    </html>
  );
}
