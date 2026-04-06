import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yardscore — AI-Powered Property Analysis",
  description: "Find your next investment property in 10 minutes. AI analyses Australian properties against 20+ data points and delivers a ranked report.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
