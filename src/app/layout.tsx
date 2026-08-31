import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Noto_Serif_TC, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import { brand } from "@/lib/data";

const display = Cormorant_Garamond({
  variable: "--font-display-latin",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const displayTc = Noto_Serif_TC({
  variable: "--font-display-tc",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const body = Inter({
  variable: "--font-body-latin",
  subsets: ["latin"],
});

const bodyTc = Noto_Sans_TC({
  variable: "--font-body-tc",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: `${brand.nameEn} ${brand.nameZh} | 香港水晶網上專門店`,
  description:
    "Mystic Crystal Workshop 神秘水晶工坊 — 香港水晶網上專門店。親手挑選天然水晶原礦、晶簇、手把件，香港本地發貨。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${display.variable} ${displayTc.variable} ${body.variable} ${bodyTc.variable} h-full antialiased`}
      style={
        {
          "--font-display": "var(--font-display-latin), var(--font-display-tc)",
          "--font-body": "var(--font-body-latin), var(--font-body-tc)",
        } as React.CSSProperties
      }
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
