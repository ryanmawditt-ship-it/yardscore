import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yardscore — AI Property Investment Research",
  description: "Find your next investment property in 10 minutes. AI analyses Australian properties against 20+ data points and delivers a ranked report.",
  icons: {
    icon: "/favicon.svg",
  },
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
