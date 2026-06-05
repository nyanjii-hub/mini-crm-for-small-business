import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MiniCRM",
  description: "小規模事業者向けミニCRM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
