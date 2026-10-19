import type { Metadata } from "next";
import { Sora, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { getSiteUrl } from "../utils/seo";
import { Footer } from "@/components/Footer";

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
    default: "FeatureLogs | Make every update worth sharing",
    template: "%s | FeatureLogs",
  },
  description:
    "Turn rough product updates into polished changelogs, X threads, LinkedIn posts, FAQs, and newsletters.",
  applicationName: "FeatureLogs",
  icons: { icon: "/feature-logs.svg", apple: "/apple-touch-icon.png" },
  keywords: [
    "build in public",
    "changelog generator",
    "release notes",
    "social content automation",
    "product communication",
    "product marketing",
    "product updates",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "FeatureLogs | Make every update worth sharing",
    description:
      "Turn product progress into clear, on-brand updates for your audience.",
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
    title: "FeatureLogs | Make every update worth sharing",
    description:
      "Turn product progress into clear, on-brand updates for your audience.",
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
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${sora.variable} ${plexMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t;try{t=localStorage.getItem('featurelogs-theme')}catch(e){}document.documentElement.dataset.theme=t==='light'||t==='dark'?t:window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
