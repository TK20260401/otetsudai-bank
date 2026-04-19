import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import GlobalChat from "@/components/global-chat";
import { MaintenanceGuard } from "@/components/maintenance-guard";
import { ReloadGuard } from "@/components/reload-guard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://otetsudai-bank-beta.vercel.app";
const OG_IMAGE = `${SITE_URL}/api/og`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "おこづかいクエスト | Habitica風RPG マネー教育アプリ",
  description:
    "お手伝いを「クエスト」に変えて、子供が楽しく金融リテラシーを育てられるアプリ。3分割ウォレット（使う/貯める/増やす）、ペット育成、レベルアップ、トロフィー等RPG要素満載。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "おこづかいクエスト",
  },
  openGraph: {
    type: "website",
    siteName: "おこづかいクエスト",
    title: "おこづかいクエスト v0.19.0 プロトタイプ",
    description:
      "お手伝いをクエストに。Habitica風RPGで子供が楽しく金融リテラシーを育てるアプリ。",
    url: SITE_URL,
    locale: "ja_JP",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "おこづかいクエスト - Habitica風RPGマネー教育アプリ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "おこづかいクエスト v0.19.0 プロトタイプ",
    description:
      "お手伝いをクエストに。Habitica風RPGで子供が楽しく金融リテラシーを育てるアプリ。",
    images: [OG_IMAGE],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#1f0f31",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background">
        <ReloadGuard />
        <MaintenanceGuard>
          <div className="flex-1">
            {children}
          </div>
          <footer className="py-4 text-center text-xs text-muted-foreground space-x-3">
            <Link href="/terms" className="hover:text-primary hover:underline">利用規約</Link>
            <span>|</span>
            <Link href="/privacy" className="hover:text-primary hover:underline">プライバシーポリシー</Link>
            <span>|</span>
            <Link href="/help" className="hover:text-primary hover:underline">ヘルプ</Link>
          </footer>
          <GlobalChat />
        </MaintenanceGuard>
        <script
          dangerouslySetInnerHTML={{
            __html: `if("serviceWorker"in navigator){window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js")})}`,
          }}
        />
      </body>
    </html>
  );
}
