"use client";

import { readStoredLanguage } from "@/shared/context/LanguageContext";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Replaces the root layout, so there is no LanguageProvider here.
  const isVi = readStoredLanguage() === "vi";
  const tr = (vi: string, en: string) => (isVi ? vi : en);
  return (
    <html lang={isVi ? "vi" : "en"}>
      <body style={{ fontFamily: "system-ui", padding: 32 }}>
        <main role="alert" style={{ maxWidth: 560, margin: "80px auto" }}>
          <h1>{tr("Chưa tải được Englow3", "Englow3 did not load")}</h1>
          <p>
            {tr(
              "Có lỗi khi khởi tạo trang. Vui lòng thử lại.",
              "Something went wrong starting the page. Please try again.",
            )}
          </p>
          <button
            onClick={reset}
            style={{ padding: "12px 20px", cursor: "pointer" }}
          >
            {tr("Thử lại", "Try again")}
          </button>
          <p>
            <Link href="/">{tr("Về trang chủ", "Go home")}</Link>
          </p>
        </main>
      </body>
    </html>
  );
}
