import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import config from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${config.appName} — AI-Powered Trip Planning`,
  description: config.appDescription,
  openGraph: {
    title: config.appName,
    description: config.appDescription,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
