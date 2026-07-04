import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "TheAIM — PT Abadi Insan Manfaat", template: "%s | TheAIM" },
  description: "Psikologi, Coaching & HR Solutions",
};

import { Lexend } from "next/font/google";

const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lexend",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`flex flex-col min-h-screen ${lexend.variable} antialiased`}>{children}</body>
    </html>
  );
}
