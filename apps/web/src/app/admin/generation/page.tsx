import type { Metadata } from "next";
import { AdminGenerationView } from "@/features/generation";

export const metadata: Metadata = {
  title: "Tạo đề bằng AI | Englow3",
  description:
    "Tạo bộ full test IELTS bằng AI; đề được gửi duyệt trước khi phát hành.",
};

export default function AdminGenerationPage() {
  return <AdminGenerationView />;
}
