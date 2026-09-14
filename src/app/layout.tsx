import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hocus Pocus Halloween Party 2026 | PIÙ Invites",
  description: "Hocus Pocus Halloween Party 2026. Site under development.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
