import "@mantine/core/styles.css";
import "./globals.css";

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { theme } from "@/lib/mantine/theme";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Englow3 — Chinh phục tiếng Anh cùng Trí tuệ AI",
  description:
    "Chấm điểm phát âm AI theo thời gian thực, lộ trình học hàng ngày thích ứng, thẻ ghi nhớ 3D, thử thách chính tả và các bài thi thử IELTS/TOEIC đầy đủ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" {...mantineHtmlProps} className={inter.variable}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body suppressHydrationWarning>
        <MantineProvider theme={theme} defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
