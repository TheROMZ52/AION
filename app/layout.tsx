import type { Metadata, Viewport } from "next";
import "@fontsource-variable/vazirmatn";
import "./globals.css";

export const metadata: Metadata = {
  title: "AION — شخصیت بده به هوش مصنوعی",
  description: "شخصیت دلخواهت رو توصیف کن و یه پرامپت کوتاه تحویل بگیر که هر LLM رو همون‌طور رفتار می‌ده.",
};

export const viewport: Viewport = { themeColor: "#07080b" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
