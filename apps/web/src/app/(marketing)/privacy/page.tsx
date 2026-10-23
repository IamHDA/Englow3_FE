import type { Metadata } from "next";

import { LegalDocument, PRIVACY } from "@/features/legal";

export const metadata: Metadata = {
  title: "Chính sách bảo mật — Englow3",
  description:
    "Englow3 thu thập dữ liệu gì, dùng để làm gì, lưu ở đâu và bạn kiểm soát nó thế nào.",
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Chính sách bảo mật"
      intro="Englow3 thu thập những dữ liệu cần để dạy và chấm bài cho bạn. Trang này nói rõ đó là dữ liệu nào, đi qua đâu và bạn tự tải về hay xoá nó như thế nào."
      sections={PRIVACY}
      sibling={{ href: "/terms", label: "Điều khoản sử dụng" }}
    />
  );
}
