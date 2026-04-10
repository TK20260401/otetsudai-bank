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

export const metadata: Metadata = {
  title: "おこづかいクエスト",
  description: "お手伝い＝クエスト！稼いで、貯めて、増やすマネー冒険アプリ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "おこづかいクエスト",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
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
      <body className="min-h-full flex flex-col bg-gradient-to-b from-emerald-50 to-amber-50">
        <ReloadGuard />
        <MaintenanceGuard>
          <div className="flex-1">
            {children}
          </div>
          <footer className="py-4 text-center text-xs text-gray-400 space-x-3">
            <Link href="/terms" className="hover:text-gray-600 hover:underline">利用規約</Link>
            <span>|</span>
            <Link href="/privacy" className="hover:text-gray-600 hover:underline">プライバシーポリシー</Link>
            <span>|</span>
            <Link href="/help" className="hover:text-gray-600 hover:underline">ヘルプ</Link>
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
