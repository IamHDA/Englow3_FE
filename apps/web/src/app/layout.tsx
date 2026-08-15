import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./globals.css";

import {
  ColorSchemeScript,
  MantineProvider,
  mantineHtmlProps,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import type { Metadata } from "next";
import { Lora, Work_Sans } from "next/font/google";

import { ApolloWrapper } from "@/lib/apollo/ApolloWrapper";
import { theme } from "@/lib/mantine/theme";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin", "vietnamese"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
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
    <html
      lang="vi"
      {...mantineHtmlProps}
      className={`${lora.variable} ${workSans.variable}`}
    >
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body suppressHydrationWarning>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <Notifications position="top-right" zIndex={1000} />
          <ApolloWrapper>{children}</ApolloWrapper>
        </MantineProvider>
      </body>
    </html>
  );
}
