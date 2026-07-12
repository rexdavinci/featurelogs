import type { Metadata } from "next";
import { Sora, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import packageJson from "@/package.json";
import { getSiteUrl } from "../utils/seo";

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
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "FeatureLogs | Build In Public Content Engine",
    template: "%s | FeatureLogs",
  },
  description:
    "Turn rough product updates into polished changelogs, X threads, LinkedIn posts, FAQs, and newsletters.",
  applicationName: "FeatureLogs",
  keywords: [
    "build in public",
    "changelog generator",
    "release notes",
    "social content automation",
    "founder marketing",
    "product updates",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "FeatureLogs | Build In Public Content Engine",
    description:
      "Create launch-ready changelogs and social posts from raw development notes.",
    siteName: "FeatureLogs",
    images: [
      {
        url: "/feature-logs.svg",
        width: 512,
        height: 512,
        alt: "FeatureLogs logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FeatureLogs | Build In Public Content Engine",
    description:
      "Create launch-ready changelogs and social posts from raw development notes.",
    images: ["/feature-logs.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
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
