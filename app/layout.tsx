import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: "Simulateur Plus-Value Cryptomonnaies - S'investir",
  description: "Simulateur de plus-value sur les crypto-monnaies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${lexend.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-navy text-white">{children}</body>
    </html>
  );
}
