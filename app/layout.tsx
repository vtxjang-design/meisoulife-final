import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "@/app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: "瞑想life",
    template: "%s | 瞑想life"
  },
  description: "朝3分で、心が整う。無料7日チャレンジ、AIコーチ、会員コミュニティ、リーダー成長までつながる日本向け瞑想プラットフォーム。",
  openGraph: {
    title: "瞑想life",
    description: "朝3分で、心が整う。無料7日チャレンジ、AIコーチ、会員コミュニティ、リーダー成長までつながる日本向け瞑想プラットフォーム。",
    url: absoluteUrl("/"),
    siteName: "瞑想life",
    locale: "ja_JP",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "瞑想life",
    description: "朝3分で、心が整う。無料7日チャレンジから始まる共生型の瞑想プラットフォーム。"
  },
  alternates: {
    canonical: absoluteUrl("/")
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-ink font-sans text-white antialiased">
        <div className="relative min-h-screen overflow-hidden">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
