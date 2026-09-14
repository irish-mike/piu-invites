import type { Metadata } from "next";
import { Cinzel, Inter, Libre_Baskerville } from "next/font/google";
import type { ReactElement, ReactNode } from "react";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-libre-baskerville",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hocus Pocus Halloween Party 2026 | PIÙ Invites",
  description:
    "Hocus Pocus Halloween Party 2026 by PIÙ. Saturday 31st October. Gates 7pm · Secret location. Register your interest for early ticket offers, party updates and arrival perks.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${libreBaskerville.variable} ${inter.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
