import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AION — Give AI a personality",
  description: "Turn natural language personality ideas into structured AION behavior.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
