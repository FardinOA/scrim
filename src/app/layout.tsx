import type { Metadata, Viewport } from "next";
import { Fragment_Mono, Inter_Tight } from "next/font/google";
import { Motion } from "@/components/motion";
import { SmoothScroll } from "@/components/smooth-scroll";
import "./globals.css";

/* One family for everything you read; the mono is only for code and data. */
const sans = Inter_Tight({
  variable: "--font-sans-face",
  subsets: ["latin"],
});

const mono = Fragment_Mono({
  variable: "--font-mono-face",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Scrim: feature flags and staged rollouts",
  description:
    "Scrim is feature flags and staged rollouts for teams who ship every day. Show a release to your team, then 1%, then everyone, and let guardrails bring the curtain down on their own if a number moves the wrong way.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" id="top" data-scroll-behavior="smooth" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <head>
        {/* Mark the page as scripted before paint, so reveals can start hidden without a flash. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-silk-400 focus:px-4 focus:py-2 focus:text-ink">
          Skip to content
        </a>
        {children}
        <Motion />
        <SmoothScroll />
      </body>
    </html>
  );
}
