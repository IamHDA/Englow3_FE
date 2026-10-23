import type { Metadata } from "next";

import { LegalDocument, TERMS } from "@/features/legal";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng — Englow3",
  description: "Điều khoản khi tạo tài khoản và sử dụng Englow3.",
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Điều khoản sử dụng"
      intro="Hãy đọc kỹ trước khi dùng Englow3. Điều khoản này nói rõ bạn có thể làm gì, chúng tôi cam kết gì và giới hạn của dịch vụ."
      sections={TERMS}
      sibling={{ href: "/privacy", label: "Chính sách bảo mật" }}
    />
  );
}
