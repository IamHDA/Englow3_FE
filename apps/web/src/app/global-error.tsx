"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body style={{ fontFamily: "system-ui", padding: 32 }}>
        <main role="alert" style={{ maxWidth: 560, margin: "80px auto" }}>
          <h1>Chưa tải được Englow3</h1>
          <p>Có lỗi khi khởi tạo trang. Vui lòng thử lại.</p>
          <button
            onClick={reset}
            style={{ padding: "12px 20px", cursor: "pointer" }}
          >
            Thử lại
          </button>
          <p>
            <Link href="/">Về trang chủ</Link>
          </p>
        </main>
      </body>
    </html>
  );
}
