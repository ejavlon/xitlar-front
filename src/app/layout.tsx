import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap"
});

export const metadata: Metadata = {
  title: "Xitlar — Music Streaming Platform",
  description: "Xitlar is a modern music streaming platform. Discover, play, and curate your favorite tracks, artists, and playlists.",
  keywords: ["music", "streaming", "xitlar", "player", "mp3"],
  openGraph: {
    title: "Xitlar — Music Streaming Platform",
    description: "Discover and play the latest tracks and albums on Xitlar.",
    type: "website",
    siteName: "Xitlar",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

