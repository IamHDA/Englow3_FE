import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

import { SiteHeader } from "@/features/navigation";
import { ApolloWrapper } from "@/lib/apollo/ApolloWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Englow3 - Master English with AI Intelligence",
  description:
    "Transform your fluency with real-time AI speech pronunciation scoring, adaptive daily learning paths, 3D flashcards, dictation challenges, and full IELTS/TOEIC mock exam simulations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ApolloWrapper>
          <SiteHeader />
          {children}
        </ApolloWrapper>
      </body>
    </html>
  );
}
