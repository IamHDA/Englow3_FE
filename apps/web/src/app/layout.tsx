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
import { headers } from "next/headers";
import { Lexend, Source_Sans_3 } from "next/font/google";
import { Suspense } from "react";

import { AccountProvider } from "@/features/account";
import { getAccountProfile } from "@/features/account/server/getAccountProfile";
import { AuthProvider } from "@/features/auth";
import { getServerSession } from "@/features/auth/server/getServerSession";
import { OnboardingGate, OnboardingProvider } from "@/features/onboarding";
import { UserTourProvider } from "@/features/tour";
import { ApolloWrapper } from "@/lib/apollo/ApolloWrapper";
import { JitlessZod } from "@/lib/zod/JitlessZod";
import { NavigationProgress } from "@/shared/components/NavigationProgress";
import { SlowBackendNotice } from "@/shared/components/SlowBackendNotice";
import { theme } from "@/lib/mantine/theme";
import { LanguageProvider } from "@/shared/context/LanguageContext";
import { SiteHeader } from "@/shared/components/SiteHeader";
import { SkipLink } from "@/shared/components/SkipLink";
import { HideInAdmin } from "@/shared/components/SiteHeader/HideInAdmin";

// Lexend for headings - designed for reading ease; Source Sans 3 for body
// copy. Both carry the Vietnamese subset (diacritics render in the font, not a
// fallback). See apps/web/docs/design-system.md.
const heading = Lexend({
  variable: "--font-heading",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Englow3 — Chinh phục tiếng Anh cùng Trí tuệ AI",
  description:
    "Chấm điểm phát âm AI theo thời gian thực, lộ trình học hàng ngày thích ứng, thẻ ghi nhớ 3D, thử thách chính tả và các bài thi thử IELTS/TOEIC đầy đủ.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Hai nguồn độc lập, ghép lại ở đây chứ không feature nào biết về feature kia:
  // `auth` trả lời "có đăng nhập không", `account` trả lời "người này là ai".
  // Chỗ điều kiện dưới chính là ranh giới - `account` không tự đi đọc cookie.
  // The nonce proxy.ts made for this response: the one inline script this
  // layout writes (the colour-scheme bootstrap) must carry it or the browser's
  // policy refuses to run it.
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const session = await getServerSession();
  const initialProfile = session
    ? await getAccountProfile()
    : { profile: null, hasError: false };

  return (
    <html
      lang="vi"
      {...mantineHtmlProps}
      className={`${heading.variable} ${body.variable}`}
    >
      <head>
        <ColorSchemeScript defaultColorScheme="light" nonce={nonce} />
      </head>
      <body suppressHydrationWarning>
        <MantineProvider theme={theme} defaultColorScheme="light">
          <JitlessZod />
          <Notifications position="top-right" zIndex={1000} />
          {/* useSearchParams inside needs a Suspense boundary of its own, or
              every page would render client-side only. */}
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <ApolloWrapper nonce={nonce}>
            <AuthProvider initialSession={session}>
              <AccountProvider initialProfile={initialProfile}>
                <LanguageProvider>
                  <OnboardingProvider>
                    <UserTourProvider>
                      <SkipLink />
                      <HideInAdmin>
                        <SiteHeader />
                      </HideInAdmin>
                      <SlowBackendNotice />
                      <main id="main-content" tabIndex={-1}>
                        {children}
                      </main>
                      <OnboardingGate />
                    </UserTourProvider>
                  </OnboardingProvider>
                </LanguageProvider>
              </AccountProvider>
            </AuthProvider>
          </ApolloWrapper>
        </MantineProvider>
      </body>
    </html>
  );
}
